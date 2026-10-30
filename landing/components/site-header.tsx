'use client'

import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Wordmark } from './logo'
import { ButtonLink } from './button-link'
import { nav, signInHref, signUpHref, site } from '@/lib/site'
import { ease } from '@/lib/motion'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 ease-survey ${
        scrolled && !open ? 'bg-paper shadow-[0_1px_0_var(--paper-300)]' : 'bg-transparent'
      }`}
    >
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-6">
        <a
          href="#top"
          className={`relative z-[60] rounded-[2px] transition-colors duration-300 ${open ? 'text-paper' : 'text-pine'}`}
          aria-label={`${site.name} home`}
        >
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group relative py-2 text-[0.9375rem] text-pine/80 transition-colors hover:text-pine"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-signal-deep transition-transform duration-300 ease-survey group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a href={signInHref} className="text-[0.9375rem] text-pine/80 underline-offset-4 hover:text-pine hover:underline">
            Learner sign-in
          </a>
          <ButtonLink href={signUpHref} className="min-h-11 py-2.5">
            Sign up
          </ButtonLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={`relative z-[60] -mr-2 flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${
            open ? 'text-paper' : 'text-pine'
          }`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <m.path
              d="M3 8h18"
              animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease }}
            />
            <m.path
              d="M3 16h18"
              animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease }}
            />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="on-pine fixed inset-0 z-[55] flex flex-col bg-pine px-5 pb-10 pt-28 text-paper sm:px-8 lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease }}
          >
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {nav.map((item, i) => (
                  <m.li
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.06 }}
                    className="border-b border-pine-700"
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="display flex items-baseline justify-between py-4 text-[2.25rem] leading-none"
                    >
                      {item.label}
                      <span className="label text-sage">0{i + 1}</span>
                    </a>
                  </m.li>
                ))}
              </ul>
            </nav>
            <m.div
              className="mt-auto flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ButtonLink href={signUpHref} className="justify-between hover:bg-paper hover:text-pine">
                Sign up
              </ButtonLink>
              <a href={signInHref} className="label py-3 text-sage hover:text-paper">
                Learner sign-in
              </a>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
