# Cogniwise landing page

Marketing site for **cogniwiseai.com**. It's a standalone Next.js app, separate from
the learner portal in the repository root. The design direction ("The Survey Office")
and every token, type and motion rule are in [DESIGN.md](DESIGN.md).

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

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

The page is fully static (`○` routes only). On Vercel, set the project root to
`landing/`. Any Node host also works with `pnpm build && pnpm start`.
