// Sticky nav: marks the section in view and tells CSS how tall the bar is,
// so anchor jumps land below it.
const nav = document.querySelector<HTMLElement>(".nav");
const list = nav?.querySelector<HTMLElement>(".nav__links");

if (nav && list) {
  const root = document.documentElement;
  const setHeight = () => root.style.setProperty("--nav-h", `${nav.offsetHeight + 12}px`);
  setHeight();
  new ResizeObserver(setHeight).observe(nav);

  const links = new Map<Element, HTMLAnchorElement>();
  list.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    const section = document.getElementById(a.hash.slice(1));
    if (section) links.set(section, a);
  });

  const setCurrent = (current: HTMLAnchorElement | undefined) => {
    links.forEach((a) => a.toggleAttribute("aria-current", a === current));
    if (current) {
      // keep the active pill visible in the sideways-scrolling row on phones
      const left = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2;
      list.scrollTo({ left, behavior: "smooth" });
    }
  };

  // A section counts as "current" when it crosses a thin band in the middle of the screen.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setCurrent(links.get(e.target));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  links.forEach((_, section) => observer.observe(section));

  // Back in the hero: nothing is current.
  const hero = document.getElementById("top");
  if (hero) {
    new IntersectionObserver(([e]) => e.isIntersecting && setCurrent(undefined), {
      rootMargin: "-45% 0px -50% 0px",
    }).observe(hero);
  }
}
