/** Logomark: three contour arcs opening east, a waypoint at the gap. */
export function Logomark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M33.5 11.2A16 16 0 1 0 33.5 28.8" />
        <path d="M28.6 14.4A10.4 10.4 0 1 0 28.6 25.6" />
        <path d="M23.4 17.8A4.8 4.8 0 1 0 23.4 22.2" />
      </g>
      <circle cx="33" cy="20" r="3.4" fill="var(--signal)" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Logomark className="h-8 w-8" />
      <span className="display text-[1.5rem] leading-none tracking-[-0.02em]">
        Cogni<em>wise</em>
      </span>
    </span>
  )
}
