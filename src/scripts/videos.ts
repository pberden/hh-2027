// Lite YouTube: show a still, load the real player only after a click.
document.querySelectorAll<HTMLButtonElement>("button.vid[data-youtube]").forEach((btn) => {
  btn.addEventListener(
    "click",
    () => {
      const id = btn.dataset.youtube;
      const frame = btn.querySelector(".vid__frame");
      if (!id || !frame) return;

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      iframe.title = btn.dataset.title ?? "Video";
      iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;

      frame.replaceChildren(iframe);
      btn.classList.add("vid--playing");
      btn.classList.remove("blob", "tilt");
      frame.classList.remove("blob");
    },
    { once: true },
  );
});
