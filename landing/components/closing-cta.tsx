'use client'

import { m, useReducedMotion } from 'framer-motion'
import { ButtonLink } from './button-link'
import { MAIN_CONTOURS } from '@/lib/terrain'
import { briefingHref, site } from '@/lib/site'
import { ease, viewportOnce } from '@/lib/motion'

export function ClosingCta() {
  // Reduced motion: render the finished map, no drawing or fades.
  const still = useReducedMotion()
  return (
    <section id="contact" aria-labelledby="cta-title" className="on-pine relative overflow-hidden bg-pine text-paper">
      {/* The summit again, redrawn as you arrive. */}
      <svg
        viewBox="140 -60 800 760"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-auto min-w-[140%] -translate-x-1/2 -translate-y-1/2 sm:min-w-[110%]"
        aria-hidden="true"
        fill="none"
        stroke="var(--pine-700)"
      >
        {MAIN_CONTOURS.map((d, i) => (
          <m.path
            key={i}
            d={d}
            strokeWidth={i % 3 === 2 ? 1.6 : 1}
            initial={still ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 1.6, delay: i * 0.08, ease }}
          />
        ))}
      </svg>

      <div className="wrap relative py-28 text-center sm:py-36 lg:py-48">
        <m.p
          className="label text-sage"
          initial={still ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6 }}
        >
          Sheet 07 / Base camp
        </m.p>
        <m.h2
          id="cta-title"
          className="display text-display-xl mx-auto mt-8 max-w-[11ch]"
          initial={still ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
        >
          Start with a <em className="text-signal">briefing.</em>
        </m.h2>
        <m.div
          initial={still ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease, delay: 0.25 }}
        >
          <p className="text-lede mx-auto mt-8 max-w-[40ch] text-sage">
            A short conversation about where your organisation stands and which route makes sense. No obligation,
            and no hard sell.
          </p>
          <div className="mt-11 flex flex-col items-center gap-6">
            <ButtonLink href={briefingHref} className="min-h-14 px-7 text-base hover:!border-paper hover:!bg-paper hover:!text-pine">
              Book a briefing
            </ButtonLink>
            <a
              href={`mailto:${site.email}`}
              className="label text-sage underline decoration-pine-700 underline-offset-[6px] transition-colors hover:text-paper hover:decoration-signal"
            >
              {site.email}
            </a>
          </div>
        </m.div>
      </div>
    </section>
  )
}
