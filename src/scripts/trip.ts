// Trip dial: sets the global animation speed multiplier (--spd) and remembers it.
const SPEEDS = { mild: 2.6, vol: 1, overdosis: 0.35 } as const;
type Trip = keyof typeof SPEEDS;

const buttons = document.querySelectorAll<HTMLButtonElement>("[data-trip]");

function apply(trip: Trip) {
  document.documentElement.style.setProperty("--spd", String(SPEEDS[trip]));
  buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.trip === trip)));
}

let saved: Trip = "vol";
try {
  const v = localStorage.getItem("trip");
  if (v && v in SPEEDS) saved = v as Trip;
} catch {}
apply(saved);

buttons.forEach((b) =>
  b.addEventListener("click", () => {
    const trip = b.dataset.trip as Trip;
    apply(trip);
    try {
      localStorage.setItem("trip", trip);
    } catch {}
  }),
);
