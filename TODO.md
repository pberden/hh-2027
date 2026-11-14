# Deploy TODO — heitenhaspel.nl

## Done
- [x] Add `heitenhaspel.nl` as a site in Cloudflare (DNS records imported)
- [x] Create Turnstile widget (hostnames `heitenhaspel.nl` + `www.heitenhaspel.nl`, mode Managed)
- [x] `npx wrangler secret put TURNSTILE_SECRET` (pasted the Turnstile **secret key**)
- [x] Personal address filled in `wrangler.jsonc` (`send_email.destination_address` + `vars.MAIL_TO`)
- [x] Connect GitHub repo to the `heitenhaspel` Worker (Settings → Build)
      build `npm run build`, deploy `npx wrangler deploy`,
      build variable `PUBLIC_TURNSTILE_SITE_KEY` = Turnstile **site key**
- [x] First build: Worker uploaded, but custom domain failed (existing A/AAAA records)

## 1. Fix DNS in Cloudflare (heitenhaspel.nl → DNS → Records)
- [x] Delete these 4 records:
  - [x] `heitenhaspel.nl` A → 88.214.28.10
  - [x] `heitenhaspel.nl` AAAA → 2a09:8b00:252:7::10
  - [x] `www` A → 88.214.28.10
  - [x] `www` AAAA → 2a09:8b00:252:7::10
- [x] Set to **DNS only** (grey cloud), both A and AAAA where present:
      `mail`, `smtp`, `pop`, `ftp`, `webmail`
      (proxy only handles web traffic; mail/FTP clients break otherwise)
- [x] Keep all MX and TXT records as they are

## 2. Redeploy
- [x] Worker → Deployments → **Retry build**
      (or `git commit --allow-empty -m "Redeploy" && git push origin main`)
- [x] Build log ends without errors; custom domains `heitenhaspel.nl` + `www` attached

## 3. Nameservers (at the hosting company's customer portal, not DirectAdmin)
Registrar: The Registrar Company B.V. — current NS: `nsauth1–4.hostingcp.*`
- [ ] Domains → `heitenhaspel.nl` → Nameservers → replace all four with the two Cloudflare ones
      (`fonzie.ns.cloudflare.com` + the second one shown in Cloudflare)
- [ ] Wait until Cloudflare shows the zone as **Active**

## 4. Mail — check first!
MX currently points to `web7.hostingcp.eu` (mail runs at the host).
- [ ] In the host's control panel: is `info@heitenhaspel.nl` a **mailbox** or only a **forward**?
  - Forward only → continue with Email Routing below
  - Real mailbox in use → STOP, don't enable Email Routing (it replaces the MX records); pick another setup first
- [ ] Cloudflare → Email → Email Routing → Enable (accept its MX/TXT, remove old MX)
- [ ] Destination addresses → add personal address → click the verification link
- [ ] Routing rules → `info@heitenhaspel.nl` → personal address
- [ ] Switch off the old `info@` forward at the host

## 5. Test
- [ ] https://heitenhaspel.nl and https://www.heitenhaspel.nl load the new site
- [ ] Send a test booking via the form → arrives in personal inbox
- [ ] If not: Worker → Logs (observability is on)

## 6. Clean up
- [ ] Switch off Firebase Hosting
- [ ] Optional: delete the `localhost` A record in Cloudflare DNS (harmless, but pointless)
