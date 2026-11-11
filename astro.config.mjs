// @ts-check
import { defineConfig } from "astro/config";

// Fully static build: Astro writes plain HTML/CSS/JS to ./dist,
// which the Cloudflare Worker (worker/index.ts) serves as static assets.
export default defineConfig({
  site: "https://www.heitenhaspel.nl",
  output: "static",
  trailingSlash: "ignore",
});
