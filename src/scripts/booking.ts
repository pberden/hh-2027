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
  say("Dao gieng get mis. Probeer 't nog ins, of mail info@heitenhaspel.nl.", "error");
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
      say("Ontvange! Veer kómme drek bie dich trök. Of later. Mer veer kómme.", "ok");
    } else {
      say(data.error ?? "Dao gieng get mis. Probeer 't nog ins.", "error");
    }
  } catch {
    say("Gein verbinding. Probeer 't nog ins, of mail info@heitenhaspel.nl.", "error");
  } finally {
    submit?.removeAttribute("disabled");
    window.turnstile?.reset();
  }
});

export {};
