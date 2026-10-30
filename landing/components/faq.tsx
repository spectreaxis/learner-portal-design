'use client'

import { AnimatePresence, m } from 'framer-motion'
import { useId, useState } from 'react'
import { Reveal } from './reveal'
import { SectionMark } from './section-mark'
import { faqs } from '@/lib/faqs'
import { ease } from '@/lib/motion'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const base = useId()

  return (
    <section id="questions" aria-labelledby="faq-title" className="relative border-t border-paper-300 py-24 lg:py-40">
      <div className="wrap grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionMark sheet="06" title="Field questions" />
            <Reveal>
              <h2 id="faq-title" className="display text-display-lg mt-8 text-pine">
                Asked <em>often.</em>
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="col-span-12 mt-12 lg:col-span-7 lg:col-start-6 lg:mt-0">
          <ul className="border-t border-pine/20">
            {faqs.map((f, i) => {
              const isOpen = open === i
              const btn = `${base}-q${i}`
              const panel = `${base}-a${i}`
              return (
                <li key={f.q} className="border-b border-pine/20">
                  <h3>
                    <button
                      id={btn}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-start gap-5 py-6 text-left sm:gap-8 sm:py-7"
                    >
                      <span className="label w-8 shrink-0 pt-2 text-moss">Q{i + 1}</span>
                      <span className="display flex-1 text-[1.375rem] leading-snug text-pine sm:text-[1.625rem]">
                        {f.q}
                      </span>
                      <m.span
                        aria-hidden="true"
                        className="relative mt-2 h-4 w-4 shrink-0 text-signal-deep"
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.4, ease }}
                      >
                        <span className="tick left-0 top-0 h-4 w-4" />
                      </m.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        id={panel}
                        role="region"
                        aria-labelledby={btn}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[58ch] pb-8 pl-[3.25rem] text-[1.0625rem] leading-relaxed text-pine/80 sm:pl-16">
                          {f.a}
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
