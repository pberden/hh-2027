# D'n Heiten Haspel — website

Astro (static) + a Cloudflare Worker for the booking form. Hosted on Cloudflare Workers with static assets.

```
src/pages/index.astro     the page
src/styles/global.css     all styling + animations (--spd = trip speed)
src/data/*.json           content: gigs, videos, sponsors  ← edit these
worker/index.ts           POST /api/boeke → Turnstile check → email
wrangler.jsonc            Cloudflare config
```

## Updating content

- **Gigs:** `src/data/gigs.json` → `{ "plaats": "Venlo", "jaor": "2026" }`
- **Videos:** `src/data/videos.json` → set `youtubeId` (the part after `v=` in the YouTube URL).
  Leave `still` empty to use YouTube's own thumbnail.
- **Sponsors:** `src/data/sponsors.json` → `naam`, optional `logo` (put the file in `public/sponsors/`, use `/sponsors/x.png`) and `url`.

Push to `main` → Cloudflare builds and deploys.

## Local development

```sh
npm install
npm run dev            # http://localhost:4321 — page only, the form won't send
cp .dev.vars.example .dev.vars
npm run preview        # builds + runs the Worker locally (form works with test keys)
```

## One-time Cloudflare setup

1. **Move DNS for heitenhaspel.nl to Cloudflare** (add the site in the dashboard, change nameservers at your registrar).
   Copy every existing record first, especially MX/TXT for mail.
2. **Email Routing** (dashboard → heitenhaspel.nl → Email → Email Routing):
   - enable it, add your personal address as a destination and verify it;
   - add a rule `info@heitenhaspel.nl` → your personal address (replaces the current redirect).
3. Put your personal address in `wrangler.jsonc` (`send_email.destination_address` and `vars.MAIL_TO`).
4. **Turnstile** (dashboard → Turnstile → Add widget, hostname `heitenhaspel.nl`):
   - set the site key as build variable `PUBLIC_TURNSTILE_SITE_KEY` (in the Workers build settings);
   - set the secret: `npx wrangler secret put TURNSTILE_SECRET`.
5. Deploy: `npm run deploy`, or connect the Git repo in Workers → Create → Import a repository
   (build command `npm run build`, deploy command `npx wrangler deploy`).
6. When it works on the domain, switch off Firebase Hosting.
