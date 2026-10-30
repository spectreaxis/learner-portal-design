'use client'

import { m, useReducedMotion } from 'framer-motion'
import { ease, viewportOnce } from '@/lib/motion'

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'p' | 'span'
}

/** Enters once when scrolled into view: 24px rise with a fade. */
export function Reveal({ children, className, delay = 0, y = 24, as = 'div' }: RevealProps) {
  const Tag = m[as]
  const still = useReducedMotion()
  return (
    <Tag
      className={className}
      initial={still ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </Tag>
  )
}
