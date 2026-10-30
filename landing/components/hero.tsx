'use client'

import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { HeroMap, T } from './hero-map'
import { ButtonLink } from './button-link'
import { briefingHref } from '@/lib/site'
import { ease } from '@/lib/motion'

const lines = [
  <>Find your</>,
  <>footing</>,
  <>
    in <em>AI.</em>
  </>,
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const mapY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90])

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-x-clip pt-28 sm:pt-32 lg:min-h-[100svh] lg:pt-36"
    >
      <div className="wrap relative grid grid-cols-12">
        {/* Copy column */}
        <div className="relative z-10 col-span-12 lg:col-span-7 xl:col-span-6">
          {/* Hero copy animates with CSS so it paints before hydration (keeps LCP fast). */}
          <p className="hero-fade label flex items-center gap-3 text-moss" style={{ '--d': '0.1s' } as React.CSSProperties}>
            <span className="relative inline-block h-[11px] w-[11px] text-signal-deep">
              <span className="tick left-0 top-0" />
            </span>
            Sheet 01<span aria-hidden="true">·</span>
            <span>
              AI competency<span className="hidden sm:inline"> training &amp; advisory</span>
            </span>
          </p>

          <h1 id="hero-title" className="display text-display-xl mt-7 text-pine">
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                <span className="hero-line block" style={{ '--d': `${0.15 + i * 0.09}s` } as React.CSSProperties}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <div className="hero-fade mt-9 max-w-[31rem] sm:mt-11" style={{ '--d': '0.3s' } as React.CSSProperties}>
            <p className="text-lede text-pine/85">
              Cogniwise is an AI competency practice. We teach people what AI can and can’t do, upskill whole
              workforces, run structured adoption courses, and advise leaders on putting AI to work in real
              operations.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href={briefingHref}>Book a briefing</ButtonLink>
              <ButtonLink href="#programmes" variant="ghost">
                See the programmes
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Map: bleeds off the right edge and under the next section. */}
        <m.div
          style={{ y: mapY }}
          className="relative col-span-12 -mr-[22%] mt-10 sm:-mr-[12%] sm:mt-4 lg:absolute lg:right-[-7vw] lg:top-[-4.5rem] lg:mr-0 lg:mt-0 lg:w-[62vw] lg:max-w-[1000px] xl:right-[-3vw] xl:w-[60vw]"
        >
          <HeroMap />

          {/* Legend sheet, overlapping the map */}
          <m.div
            role="group"
            aria-label="Map legend"
            className="sheet absolute bottom-[2%] right-[26%] hidden w-[16.5rem] bg-paper p-5 sm:block lg:bottom-[-3%] lg:right-[9%]"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: T.legend }}
          >
            <p className="label text-moss">Legend</p>
            <ul className="mt-4 space-y-3 text-[0.875rem] leading-snug">
              <li className="flex items-center gap-3">
                <svg viewBox="0 0 36 8" className="h-2 w-9 shrink-0" aria-hidden="true">
                  <path d="M0 4h36" stroke="var(--signal)" strokeWidth="2.5" strokeDasharray="5 5" />
                </svg>
                Recommended route
              </li>
              <li className="flex items-center gap-3">
                <svg viewBox="0 0 36 20" className="h-5 w-9 shrink-0" aria-hidden="true">
                  <circle cx="18" cy="10" r="7" fill="var(--paper)" stroke="var(--signal)" strokeWidth="2" />
                  <circle cx="18" cy="10" r="2.5" fill="var(--pine)" />
                </svg>
                Programme waypoint
              </li>
              <li className="flex items-center gap-3">
                <svg viewBox="0 0 36 14" className="h-3.5 w-9 shrink-0" aria-hidden="true">
                  <path d="M0 10c8-8 14-8 18-4s10 4 18-4" fill="none" stroke="var(--pine)" strokeOpacity=".6" />
                </svg>
                Contour interval: one competency level
              </li>
            </ul>
            <div className="mt-5 border-t border-paper-300 pt-4">
              <div className="flex items-end justify-between" aria-hidden="true">
                <span className="label text-[0.625rem] text-moss">0</span>
                <span className="label text-[0.625rem] text-moss">Your pace</span>
              </div>
              <div className="mt-1.5 flex h-1.5 border border-pine" aria-hidden="true">
                <span className="flex-1 bg-pine" />
                <span className="flex-1" />
                <span className="flex-1 bg-pine" />
                <span className="flex-1" />
              </div>
              <p className="sr-only">Scale: set to your organisation’s pace.</p>
            </div>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
