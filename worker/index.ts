import { EmailMessage } from "cloudflare:email";
import { createMimeMessage, Mailbox } from "mimetext";

interface Env {
  ASSETS: Fetcher;
  BOOKING_EMAIL: SendEmail;
  TURNSTILE_SECRET: string;
  MAIL_FROM: string;
  MAIL_TO: string;
}

type Booking = {
  naam: string;
  email: string;
  datum: string;
  plaats: string;
  fees: string;
  bericht: string;
};

const LIMITS: Record<keyof Booking, number> = {
  naam: 120,
  email: 200,
  datum: 20,
  plaats: 160,
  fees: 60,
  bericht: 5000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/boeke") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
      }
      return handleBooking(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleBooking(request: Request, env: Env): Promise<Response> {
  const wantsJson = (request.headers.get("Accept") ?? "").includes("application/json");
  const reply = (ok: boolean, status: number, error?: string) =>
    wantsJson
      ? Response.json({ ok, error }, { status })
      : Response.redirect(new URL(ok ? "/bedankt/" : "/?fout=1#boeke", request.url).toString(), 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(false, 400, "Formulier kon neet gelaeze waere.");
  }

  // Honeypot: real people never see or fill this field.
  if (String(form.get("website") ?? "").trim() !== "") {
    return reply(true, 200);
  }

  const booking = {} as Booking;
  for (const key of Object.keys(LIMITS) as (keyof Booking)[]) {
    let value = String(form.get(key) ?? "").trim().slice(0, LIMITS[key]);
    // Only the free-text message may contain line breaks (prevents header injection).
    if (key !== "bericht") value = value.replace(/[\r\n]+/g, " ");
    booking[key] = value;
  }

  if (!booking.naam || !EMAIL_RE.test(booking.email)) {
    return reply(false, 400, "Vul dien naam en 'n geldig e-mailadres in.");
  }

  const token = String(form.get("cf-turnstile-response") ?? "");
  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET, ip))) {
    return reply(false, 403, "De robotcontrole is mislukt. Probeer 't nog ins.");
  }

  try {
    const msg = createMimeMessage();
    msg.setSender({ name: "Website D'n Heiten Haspel", addr: env.MAIL_FROM });
    msg.setRecipient(env.MAIL_TO);
    msg.setHeader("Reply-To", new Mailbox({ addr: booking.email, name: booking.naam.replace(/["<>]/g, "") }));
    msg.setSubject(`Boekingsaanvraag: ${booking.fees || "fees"} – ${booking.datum || "datum onbekend"} – ${booking.naam}`);
    msg.addMessage({
      contentType: "text/plain",
      data: [
        "Nieuwe boekingsaanvraag via heitenhaspel.nl",
        "",
        `Naam:    ${booking.naam}`,
        `E-mail:  ${booking.email}`,
        `Datum:   ${booking.datum || "-"}`,
        `Plaats:  ${booking.plaats || "-"}`,
        `Fees:    ${booking.fees || "-"}`,
        "",
        "Bericht:",
        booking.bericht || "-",
        "",
        "Antwoorden op deze mail gaat direct naar de aanvrager.",
      ].join("\n"),
    });

    await env.BOOKING_EMAIL.send(new EmailMessage(env.MAIL_FROM, env.MAIL_TO, msg.asRaw()));
  } catch (err) {
    console.error("Booking email failed", err);
    return reply(false, 502, "Versture is mislukt. Mail ós drek op info@heitenhaspel.nl.");
  }

  return reply(true, 200);
}

async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  if (!token || !secret) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed", err);
    return false;
  }
}
