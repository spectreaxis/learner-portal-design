import type { Transition, Variants } from 'framer-motion'

// The one curve used everywhere ("survey ease", see DESIGN.md).
export const ease = [0.22, 1, 0.36, 1] as const

export const enter: Transition = { duration: 0.8, ease }

export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: enter },
}

export const viewportOnce = { once: true, amount: 0.3 } as const
