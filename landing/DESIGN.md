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
like a well-made printed field map: warm paper, dense ink, one hot signal
colour, precise labels.

If a choice doesn't fit "a survey office that teaches AI", it doesn't ship.

---

## Palette

Defined once as CSS variables in `app/globals.css` and exposed to Tailwind via `@theme`.

| Token            | Hex       | Role                                                        |
| ---------------- | --------- | ----------------------------------------------------------- |
| `--pine`         | `#0E2A23` | **Dominant.** Ink, dark sections, primary type.             |
| `--pine-800`     | `#16382F` | Raised surfaces on pine.                                    |
| `--pine-700`     | `#22493E` | Rules and contour lines on pine.                            |
| `--paper`        | `#F2ECDF` | Page ground. Warm survey paper.                             |
| `--paper-200`    | `#E7DFCD` | Inset panels, map sheets.                                   |
| `--paper-300`    | `#D6CCB5` | Contour lines and hairlines on paper (decorative only).     |
| `--signal`       | `#FF5C39` | **The one accent.** Route lines, waypoints, CTAs on pine.   |
| `--signal-deep`  | `#B8321A` | Accent when used *as text* on paper (AA).                   |
| `--moss`         | `#4F6A5F` | Secondary text on paper.                                    |
| `--sage`         | `#A9BDB1` | Secondary text on pine.                                     |

### Contrast (WCAG 2.2, verified)
- pine on paper: **12.98:1**. Paper on pine is the same.
- moss on paper: **5.01:1**. Sage on pine: **7.71:1**.
- signal-deep on paper: **5.08:1**. Pine on signal (button label): **4.98:1**.
- `--signal` on paper is **2.6:1**, so it **never carries text or meaning on paper**. It is
  used there only for decorative route lines beside a labelled element.

Rules:
- No gradients except one: the radial "sun-spot" glow behind the summit, which is
  signal at 0 to 18% alpha.
- No glassmorphism, no blur panels, no drop-shadow stacks.
- One shadow only, the **"sheet" shadow**: a hard 1px pine-tinted offset plus
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
