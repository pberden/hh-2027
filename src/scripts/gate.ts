// Entry gate: a "don't press" button that dodges a few times before it lets you in.
// Pressing it is the first user interaction, so the fart is allowed to play right away.
import { startFarts } from "./sounds";

const root = document.documentElement;
const gate = document.querySelector<HTMLElement>(".gate");
const btn = document.querySelector<HTMLButtonElement>("[data-gate]");

// Labels shown after each dodge; once they run out the button gives up.
const DODGE_LABELS = ["Mis!", "Hihi, nog ins?", "Bijnao...", "Good dan, drök mer"];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (gate && btn && root.classList.contains("gated")) {
  let dodges = 0;
  let lastPointer = "";
  btn.focus();

  function dodge() {
    const rect = btn!.getBoundingClientRect();
    // Position without the current transform, so offsets don't accumulate.
    const current = new DOMMatrix(getComputedStyle(btn!).transform);
    const baseX = rect.left - current.m41;
    const baseY = rect.top - current.m42;
    const pad = 16;
    const x = pad + Math.random() * Math.max(0, innerWidth - rect.width - pad * 2);
    const y = pad + Math.random() * Math.max(0, innerHeight - rect.height - pad * 2);
    const tilt = (Math.random() - 0.5) * 30;
    btn!.style.transform = `translate(${x - baseX}px, ${y - baseY}px) rotate(${tilt}deg)`;
    btn!.textContent = DODGE_LABELS[dodges++];
  }

  const canDodge = () => !reducedMotion && dodges < DODGE_LABELS.length;

  // Mouse: run away when the cursor gets close.
  btn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse" && canDodge()) dodge();
  });
  btn.addEventListener("pointerdown", (e) => (lastPointer = e.pointerType));

  btn.addEventListener("click", (e) => {
    // Touch can't hover, so the first tap makes it jump away instead.
    if (lastPointer === "touch" && dodges === 0 && canDodge()) {
      e.stopPropagation();
      dodge();
      return;
    }
    lastPointer = "";
    e.stopPropagation(); // no click sound; the fart is the reward
    startFarts();
    try {
      sessionStorage.setItem("gate", "1");
    } catch {}
    gate.classList.add("gate--open");
    const done = () => {
      root.classList.remove("gated");
      gate.remove();
    };
    if (reducedMotion) done();
    else gate.addEventListener("animationend", done, { once: true });
  });
}
