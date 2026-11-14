// Sound gags: a fart when the entry gate is pressed (or 3s after load if the gate
// was already passed) and then at random intervals, plus a random sound effect on
// every button click.

const FART = "/sounds/fart.mp3";
const CLICK_SOUNDS = ["/sounds/bel.mp3", "/sounds/duck.mp3", "/sounds/monkey.mp3", "/sounds/cat.mp3", "/sounds/goat.mp3"];

const FIRST_FART_MS = 3_000;
const FART_MIN_MS = 15_000;
const FART_MAX_MS = 45_000;

// Elements that count as a "button" for the click sounds.
const CLICKABLE = "button, a.tilt, a[class*='pill--']";

// Preload every sound once; clone on play so rapid clicks can overlap.
const cache = new Map<string, HTMLAudioElement>();
for (const src of [FART, ...CLICK_SOUNDS]) {
  const a = new Audio(src);
  a.preload = "auto";
  cache.set(src, a);
}

function play(src: string): Promise<void> {
  const a = cache.get(src)!.cloneNode() as HTMLAudioElement;
  return a.play();
}

// Shuffle bag: every click sound plays once in random order before any repeats,
// and a new round never starts with the sound that just played.
let bag: string[] = [];
let last: string | undefined;
function nextClickSound(): string {
  if (bag.length === 0) {
    bag = [...CLICK_SOUNDS];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
  }
  last = bag.pop()!;
  return last;
}

document.addEventListener("click", (e) => {
  if ((e.target as Element).closest?.(CLICKABLE)) play(nextClickSound()).catch(() => {});
});

// Browsers block audio until the visitor has interacted with the page. If the
// first fart is blocked, it plays on their first click/tap/keypress instead.
function scheduleFart(delay: number) {
  setTimeout(fart, delay);
}

function fart() {
  if (document.hidden) return scheduleFart(randomDelay());
  play(FART)
    .then(() => scheduleFart(randomDelay()))
    .catch(() => {
      const retry = () => {
        removeEventListener("pointerdown", retry);
        removeEventListener("keydown", retry);
        fart();
      };
      addEventListener("pointerdown", retry);
      addEventListener("keydown", retry);
    });
}

function randomDelay() {
  return FART_MIN_MS + Math.random() * (FART_MAX_MS - FART_MIN_MS);
}

let started = false;

/** Fart right now and keep farting at random intervals. Call from a click handler. */
export function startFarts() {
  if (started) return;
  started = true;
  fart();
}

// The entry gate (gate.ts) starts the farts when its button is pressed. If the
// gate was already passed this session, fall back to a fart after a few seconds.
if (!document.documentElement.classList.contains("gated")) {
  setTimeout(startFarts, FIRST_FART_MS);
}
