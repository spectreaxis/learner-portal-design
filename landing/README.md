# Cogniwise landing page

Marketing site for **cogniwiseai.com**. It's a standalone Next.js app, separate from
the learner portal in the repository root. The design direction ("The Survey Office")
and every token, type and motion rule are in [DESIGN.md](DESIGN.md).

## Run

```bash
npm ci
npm run dev       # http://localhost:3000
npm run build && npm start
```

Stop `npm start` before rebuilding: a running server keeps serving the old build's HTML
while `next build` replaces its assets, which makes the page load unstyled.

## Before deploying

Brand facts live in one place, `lib/site.ts`. Confirm these before going live:

- `email` (`hello@cogniwiseai.com`): every "Book a briefing" CTA is a `mailto:` to this address
- `portalUrl` (`https://learn.cogniwiseai.com`): where the learner portal will be hosted
- `legalName`: shown in the footer and in the JSON-LD

FAQ copy is in `lib/faqs.ts` and also feeds the FAQPage structured data.

## Structure

```
app/          layout (fonts, metadata), page (sections + JSON-LD), robots, sitemap, OG image, icon
components/   one file per section, plus shared Reveal / ScrollLine / ButtonLink
              icons.tsx and illustrations.tsx hold the hand-drawn SVG set
lib/          site config, FAQ data, motion tokens, generated terrain geometry
scripts/      terrain.py: regenerates lib/terrain.ts (contour rings + route)
```

Regenerate the hero map's geometry with `python3 scripts/terrain.py lib/terrain.ts`.
The script checks that every contour ring nests inside the next one.

## Deploying

The page is fully static (`○` routes only). It runs on Coolify as its own app with base
directory `/landing` and `npm ci` / `npm run build` / `npm run start`; see "Landing Page
Deployment" in [PRODUCTION_DEPLOYMENT.md](../PRODUCTION_DEPLOYMENT.md).
