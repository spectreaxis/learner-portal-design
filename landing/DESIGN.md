# Cogniwise: design direction

## The one idea: "The Survey Office"

Cogniwise is a **cartographer**, not a tech vendor. Most AI marketing shows
glowing brains, neural meshes and purple gradients. We show none of that. AI
adoption is presented as **terrain to be surveyed, mapped and crossed**. An
organisation starts at base camp (literacy) and climbs to the summit
(integration), and Cogniwise draws the map and walks the route with them.

Every visual choice comes from an Ordnance-Survey or field-survey-office
sensibility: contour lines, plotted routes, waypoints, grid references,
legends, compass bearings, survey-sheet margins and marginalia. It should feel
like a well-made printed field map: clean paper, dense ink, one signal colour
(the portal's blue), precise labels.

If a choice doesn't fit "a survey office that teaches AI", it doesn't ship.

---

## Palette

The palette is the **learner portal's own** (its `app/globals.css` oklch tokens,
converted to hex), so the marketing site and the product read as one brand.
Defined once as CSS variables in `app/globals.css` and exposed to Tailwind via
`@theme`. Token names are roles carried over from the original concept:
`pine` = ink and dark surfaces, `paper` = page, `signal` = the blue accent.

| Token            | Hex       | Portal source               | Role                                              |
| ---------------- | --------- | --------------------------- | ------------------------------------------------- |
| `--pine`         | `#060B10` | `--foreground`              | **Dominant.** Ink, dark sections, primary type.   |
| `--pine-800`     | `#0A0E11` | dark `--card`               | Raised surfaces on dark.                          |
| `--pine-700`     | `#292E34` | (dark border, one step up)  | Rules and contour lines on dark.                  |
| `--paper`        | `#FAFAFA` | `--background`              | Page ground.                                      |
| `--paper-200`    | `#EFF2F5` | `--muted`                   | Inset panels, map sheets.                         |
| `--paper-300`    | `#DFE1E4` | `--border`                  | Hairlines and grid on paper (decorative).         |
| `--signal`       | `#007EB7` | `--primary`                 | **The one accent.** Routes, waypoints, icons.     |
| `--signal-deep`  | `#006EA4` | `--primary`, nudged darker  | Blue *text* on paper and button fills (AA).       |
| `--signal-ink`   | `#FFFFFF` | `--primary-foreground`      | Label on signal-deep.                             |
| `--moss`         | `#51565B` | `--muted-foreground`        | Secondary text on paper.                          |
| `--sage`         | `#8F8F8F` | dark `--muted-foreground`   | Secondary text on dark.                           |

Inside `.on-pine` (dark sections) the accent switches to the portal's dark-mode
primary: `--signal` and `--signal-deep` become `#009ED8`, and `--signal-ink`
becomes pine.

### Contrast (WCAG 2.2, verified)
- pine on paper: **18.9:1**. Moss on paper: **7.1:1**. Sage on pine: **6.1:1**.
- signal-deep on paper: **5.3:1**. White on signal-deep (button label): **5.3:1**.
- On dark: `#009ED8` on pine **6.5:1**, both as text and with a pine label on a blue button.
- `--signal` (`#007EB7`) on paper is **4.3:1**. That passes 3:1 for graphics but not
  4.5:1 for body text, which is why blue text and buttons use `--signal-deep`.

Rules:
- No gradients except one: the radial "sun-spot" glow behind the summit, which is
  blue signal at 0 to 18% alpha.
- No glassmorphism, no blur panels, no drop-shadow stacks.
- One shadow only, the **"sheet" shadow**: a hard 1px ink-tinted offset plus
  `6px 6px 0` of paper-300. It reads as a printed sheet lying on a desk, not a floating card.

---

## Type

| Role      | Face                     | Notes                                                                                   |
| --------- | ------------------------ | --------------------------------------------------------------------------------------- |
| Display   | **Fraunces** (variable)  | `opsz` 96, weight 460; italics add `WONK` 1. Upright is preloaded, italic loads on demand (perf). |
| Body      | **Instrument Sans**      | 400 / 500 / 600. Calm, narrow-ish, highly legible.                                      |
| Labels    | **IBM Plex Mono**        | 400 / 500, uppercase, `+0.14em` tracking. Grid references, legends, step numbers only. |

No Inter, Roboto, Arial or system stacks. Fonts are self-hosted via `next/font`
with `display: swap`.

### Scale (fluid, mobile-first; `clamp(min, vw, max)`)
- `display-xl`: 3.25rem to 8.5rem, leading 0.92, tracking -0.03em (hero only)
- `display-lg`: 2.5rem to 5.25rem, leading 0.98, tracking -0.025em
- `display-md`: 1.875rem to 3rem, leading 1.05
- `lede`: 1.125rem to 1.375rem, leading 1.5
- `body`: 1rem to 1.0625rem, leading 1.65, max 62ch
- `label`: 0.6875rem to 0.75rem mono, uppercase

Italic Fraunces is the emphasis device in headlines, not bold, and not colour on its own.

---

## Space and grid

- 4px base unit. Section rhythm: `py-24` mobile and `py-40` desktop. Whitespace is a feature.
- 12-column grid, `max-w-[1440px]`, gutters `px-5` / `sm:px-8` / `lg:px-12`.
- **Asymmetry is mandatory.** Headlines sit on columns 1 to 8. Supporting copy sits
  offset on 7 to 12, or hangs in a narrow "margin note" column. Nothing important
  is perfectly centred except the closing CTA.
- **Overlap.** The hero map bleeds off the right edge and under the next section.
  The legend card overlaps the map. Service illustrations break their row bounds.
- Hairline rules (1px paper-300 / pine-700) and **survey ticks** (small `+`
  crosshair marks at grid corners) replace boxes and borders.

---

## Components and motifs

- **Contours**: hand-built SVG paths, stroke 1px, never filled.
- **Route**: a dashed signal line (`6 6` dash) connecting waypoints.
- **Waypoint**: a signal ring with a pine dot, plus a mono label `WP-01`.
- **Grid reference**: mono label, e.g. `GR 01°17′S 36°49′E`. Used as section eyebrows.
- **Icons**: bespoke 32px line glyphs at 1.5px stroke with square caps, drawn per
  service. No icon packs, no emoji.
- **Buttons**: primary is signal fill with pine label. On paper it gets a pine
  1.5px border so its edge passes 3:1. Fully rounded pill (`rounded-full`), the one soft shape against the sharp map lines and sheet edges. Hover shifts
  the label right 4px and draws an arrow.

---

## Motion rules (Framer Motion)

1. **Staged hero reveal, about 2.2s total** (timeline constants live in `components/hero-map.tsx`).
   (a) The survey grid fades in at 0 to 0.6s. (b) Headline lines rise from a mask, staggered 90ms.
   This and the lede run as **CSS keyframes**, not Framer, so the copy paints before hydration
   and LCP stays at FCP. (c) Contours draw via `pathLength` from 0.25s, summit outward. (d) The
   route traces base to summit from 0.75s over 1.25s. (e) Waypoints pop as the route reaches
   them. (f) The legend sheet slides up last, at 1.95s.
2. **Scroll-triggered sections**: elements enter once (`viewport: { once: true, amount: 0.3 }`),
   moving 24px with an opacity fade. Never more than 32px of travel.
3. **Easing**: one curve everywhere, `[0.22, 1, 0.36, 1]` ("survey ease").
   Durations 0.5 to 0.9s. No springs with visible bounce.
4. **Micro-interactions**: buttons nudge the arrow, service rows reveal their route
   segment on hover, FAQ items rotate their `+` tick to `×`, and the method route
   fills with scroll progress.
5. **Reduced motion**: `MotionConfig reducedMotion="user"`, plus `initial={false}`
   wherever `useReducedMotion()` is true (MotionConfig alone still draws paths and
   fades). Everything renders in its final state. No parallax, no path drawing.
6. Animate only `transform`, `opacity` and SVG `pathLength`. Nothing that
   triggers layout.

---

## Voice

Plain, precise, a little dry, like a good field guide. Short declaratives. No
"revolutionise", "unlock", "supercharge" or "harness the power". No invented
statistics, logos or testimonials.
