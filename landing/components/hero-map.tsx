'use client'

import { m, useReducedMotion } from 'framer-motion'
import { CONTOUR_LABELS, HILL_CONTOURS, MAIN_CONTOURS, ROUTE, SUMMIT } from '@/lib/terrain'
import { ease } from '@/lib/motion'

const W = 800
const H = 760

// Hero timeline (seconds). Contours draw summit-outward, then the route, then waypoints.
export const T = {
  contours: 0.25,
  route: 0.75,
  routeDuration: 1.25,
  legend: 1.95,
} as const

export const WAYPOINTS = [
  { id: 'WP-01', name: 'Literacy', x: 176, y: 646, at: 0.08, place: 'below' },
  { id: 'WP-02', name: 'Upskilling', x: 338, y: 548, at: 0.36, place: 'right' },
  { id: 'WP-03', name: 'Adoption', x: 466, y: 372, at: 0.66, place: 'right' },
  { id: 'WP-04', name: 'Integration', x: SUMMIT.x, y: 236, at: 1, place: 'summit' },
] as const

const pct = (v: number, of: number) => `${(v / of) * 100}%`

export function HeroMap() {
  // Reduced motion: render the finished map, no drawing or fades.
  const still = useReducedMotion()
  return (
    <div className="relative aspect-[800/760] w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        role="img"
        aria-labelledby="hero-map-title hero-map-desc"
      >
        <title id="hero-map-title">A survey map of the route to AI competence</title>
        <desc id="hero-map-desc">
          Contour lines rise to a summit. A dashed route climbs from base camp through four waypoints: literacy,
          upskilling, adoption and, at the summit, integration.
        </desc>

        <defs>
          <radialGradient id="summit-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--signal)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
          </radialGradient>
          <mask id="route-mask" maskUnits="userSpaceOnUse">
            <m.path
              d={ROUTE}
              fill="none"
              stroke="#fff"
              strokeWidth="14"
              initial={still ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: T.routeDuration, delay: T.route, ease: [0.45, 0, 0.25, 1] }}
            />
          </mask>
        </defs>

        {/* Survey grid */}
        <m.g
          aria-hidden="true"
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          stroke="var(--paper-300)"
          strokeWidth="1"
        >
          {[100, 200, 300, 400, 500, 600, 700].map((v) => (
            <g key={v}>
              <line x1={v} y1="0" x2={v} y2={H} strokeDasharray="1 5" />
              <line x1="0" y1={v} x2={W} y2={v} strokeDasharray="1 5" />
            </g>
          ))}
        </m.g>

        <m.circle
          cx={SUMMIT.x}
          cy={SUMMIT.y}
          r="190"
          fill="url(#summit-glow)"
          initial={still ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.9, ease }}
        />

        {/* Contours: outer index contours are heavier, as on a printed sheet. */}
        <g fill="none" stroke="var(--pine)" aria-hidden="true">
          {MAIN_CONTOURS.map((d, i) => (
            <m.path
              key={i}
              d={d}
              strokeWidth={i % 3 === 2 ? 1.5 : 0.9}
              strokeOpacity={0.28 + (MAIN_CONTOURS.length - i) * 0.06}
              initial={still ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 1.1, delay: T.contours + i * 0.07, ease },
                opacity: { duration: 0.2, delay: T.contours + i * 0.07 },
              }}
            />
          ))}
          {HILL_CONTOURS.map((d, i) => (
            <m.path
              key={`h${i}`}
              d={d}
              strokeWidth="0.9"
              strokeOpacity={0.5 - i * 0.08}
              initial={still ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 0.9, delay: T.contours + 0.3 + i * 0.07, ease },
                opacity: { duration: 0.2, delay: T.contours + 0.3 + i * 0.07 },
              }}
            />
          ))}
        </g>

        {/* Contour height labels, knocked out of the line like a printed map. */}
        <m.g
          aria-hidden="true"
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {CONTOUR_LABELS.map((l) => (
            <g key={l.text} transform={`translate(${l.x} ${l.y}) rotate(${l.angle})`}>
              <rect x="-11" y="-7" width="22" height="14" fill="var(--paper)" />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="var(--font-mono)"
                fontSize="10"
                letterSpacing="0.06em"
                fill="var(--moss)"
              >
                {l.text}
              </text>
            </g>
          ))}
        </m.g>

        {/* Route: a dashed line revealed by an animated mask. */}
        <g mask="url(#route-mask)" aria-hidden="true">
          <path d={ROUTE} fill="none" stroke="var(--paper)" strokeWidth="7" />
          <path d={ROUTE} fill="none" stroke="var(--signal)" strokeWidth="2.5" strokeDasharray="7 7" />
        </g>

        {/* Waypoints */}
        {WAYPOINTS.map((w) => {
          const delay = T.route + T.routeDuration * w.at
          const summit = w.place === 'summit'
          return (
            <m.g
              key={w.id}
              aria-hidden="true"
              initial={still ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay, ease }}
              style={{ originX: `${w.x}px`, originY: `${w.y}px` }}
            >
              {summit ? (
                <>
                  <circle cx={w.x} cy={w.y} r="20" fill="none" stroke="var(--signal)" strokeWidth="1" strokeDasharray="2 4" />
                  <path
                    d={`M${w.x} ${w.y - 13}l11.5 19h-23z`}
                    fill="var(--pine)"
                    stroke="var(--paper)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx={w.x} cy={w.y + 1} r="3" fill="var(--signal)" />
                </>
              ) : (
                <>
                  <circle cx={w.x} cy={w.y} r="10" fill="var(--paper)" stroke="var(--signal)" strokeWidth="2.5" />
                  <circle cx={w.x} cy={w.y} r="3.5" fill="var(--pine)" />
                </>
              )}
            </m.g>
          )
        })}

        {/* Compass rose, bespoke */}
        <m.g
          aria-hidden="true"
          initial={still ? false : { opacity: 0, rotate: -40 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease }}
          style={{ originX: '712px', originY: '78px' }}
          stroke="var(--pine)"
          fill="none"
        >
          <circle cx="712" cy="78" r="34" strokeOpacity=".35" />
          <circle cx="712" cy="78" r="26" strokeOpacity=".2" strokeDasharray="1 3" />
          <path d="M712 38v80M672 78h80" strokeOpacity=".35" />
          <path d="M712 42l7 36h-14z" fill="var(--pine)" stroke="none" />
          <path d="M712 114l7-36h-14z" fill="var(--paper)" strokeOpacity=".6" />
          <text
            x="712"
            y="27"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fill="var(--pine)"
            stroke="none"
          >
            N
          </text>
        </m.g>
      </svg>

      {/* Waypoint labels are HTML so they stay crisp and legible at every size. */}
      {WAYPOINTS.map((w) => {
        const delay = T.route + T.routeDuration * w.at + 0.1
        const summit = w.place === 'summit'
        return (
          <m.div
            key={w.id}
            aria-hidden="true"
            className={`pointer-events-none absolute whitespace-nowrap ${
              summit
                ? '-translate-x-1/2 -translate-y-[calc(100%+1.6rem)] text-center'
                : w.place === 'below'
                  ? 'translate-x-3 translate-y-4'
                  : 'translate-x-5 -translate-y-1/2'
            }`}
            style={{ left: pct(w.x, W), top: pct(w.y, H) }}
            initial={still ? false : { opacity: 0, x: summit ? 0 : -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay, ease }}
          >
            <span className="block bg-paper/85 px-1 py-0.5">
              <span className="label block text-[0.625rem] text-signal-deep sm:text-[0.6875rem]">{w.id}</span>
              <span className="display block text-[0.95rem] leading-tight sm:text-[1.15rem]">{w.name}</span>
            </span>
          </m.div>
        )
      })}
    </div>
  )
}
