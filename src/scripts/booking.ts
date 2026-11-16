// Progressive enhancement: without JS the form posts normally and the Worker redirects.
const form = document.querySelector<HTMLFormElement>("#boeke-form");
const status = document.querySelector<HTMLElement>("#boeke-status");
const submit = form?.querySelector<HTMLButtonElement>("button[type=submit]");

declare global {
  interface Window {
    turnstile?: { reset: (el?: string | HTMLElement) => void };
  }
}

function say(text: string, state: "ok" | "error" | "busy") {
  if (!status) return;
  status.textContent = text;
  status.dataset.state = state;
}

if (new URLSearchParams(location.search).has("fout")) {
  say("Dao ging wat mis. Probeer 't nog ens, of mail info@heitenhaspel.nl.", "error");
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  submit?.setAttribute("disabled", "");
  say("Vibes waere verstuurd…", "busy");

  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

    if (res.ok && data.ok) {
      form.reset();
      say("Ontvange! Ut deurt gemiddeld 11 werkdaag veurdat we reagere", "ok");
    } else {
      say(data.error ?? "Dao ging wat mis. Probeer 't nog ens.", "error");
    }
  } catch {
    say("Gen verbinding. Probeer 't nog ens, of mail info@heitenhaspel.nl.", "error");
  } finally {
    submit?.removeAttribute("disabled");
    window.turnstile?.reset();
  }
});

export {};
