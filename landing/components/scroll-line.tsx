'use client'

import { m, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'

type ScrollLineProps = {
  axis?: 'x' | 'y'
  className?: string
  /** Colour of the filled portion. */
  fill?: string
  /** Colour of the unfilled track. */
  track?: string
  offset?: [string, string]
}

/** A route line that fills as its container scrolls through the viewport. */
export function ScrollLine({
  axis = 'y',
  className = '',
  fill = 'var(--signal)',
  track = 'var(--paper-300)',
  offset = ['start 70%', 'end 60%'],
}: ScrollLineProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as unknown as NonNullable<Parameters<typeof useScroll>[0]>['offset'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const vertical = axis === 'y'
  const still = useReducedMotion()

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div
        className={`absolute ${vertical ? 'inset-y-0 left-0 w-px' : 'inset-x-0 top-0 h-px'}`}
        style={{
          backgroundImage: `linear-gradient(${vertical ? 'to bottom' : 'to right'}, ${track} 50%, transparent 50%)`,
          backgroundSize: vertical ? '1px 8px' : '8px 1px',
        }}
      />
      <m.div
        className={`absolute ${vertical ? 'inset-y-0 left-[-1px] w-[3px] origin-top' : 'inset-x-0 top-[-1px] h-[3px] origin-left'}`}
        style={{
          [vertical ? 'scaleY' : 'scaleX']: still ? 1 : progress,
          backgroundImage: `linear-gradient(${vertical ? 'to bottom' : 'to right'}, ${fill} 55%, transparent 55%)`,
          backgroundSize: vertical ? '3px 12px' : '12px 3px',
        }}
      />
    </div>
  )
}
