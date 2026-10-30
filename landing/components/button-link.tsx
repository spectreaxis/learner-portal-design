import Link from 'next/link'

type ButtonLinkProps = {
  href: string
  children: React.ReactNode
  variant?: 'signal' | 'ghost' | 'ghost-light'
  className?: string
}

const variants = {
  // White on signal-deep is 5.3:1; inside .on-pine the tokens flip to light blue with a dark label (6.5:1).
  signal: 'bg-signal-deep text-signal-ink border-signal-deep hover:bg-pine hover:text-paper hover:border-pine',
  ghost: 'bg-transparent text-pine border-pine/30 hover:border-pine',
  'ghost-light': 'bg-transparent text-paper border-paper/30 hover:border-paper',
} as const

export function ButtonLink({ href, children, variant = 'signal', className = '' }: ButtonLinkProps) {
  const external = href.startsWith('http') || href.startsWith('mailto:')
  const cls = `group inline-flex min-h-12 items-center gap-3 rounded-full border-[1.5px] px-6 py-3 text-[0.9375rem] font-medium transition-colors duration-300 ease-survey ${variants[variant]} ${className}`
  const inner = (
    <>
      <span className="transition-transform duration-300 ease-survey group-hover:translate-x-1">{children}</span>
      <Arrow />
    </>
  )
  return external ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  )
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 12"
      className="h-3 w-5 overflow-visible transition-transform duration-300 ease-survey group-hover:translate-x-1"
    >
      <path d="M0 6h17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 1.5 17 6l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
