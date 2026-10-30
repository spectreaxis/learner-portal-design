type SectionMarkProps = {
  sheet: string
  title: string
  tone?: 'paper' | 'pine'
  className?: string
}

/** Survey-sheet eyebrow: crosshair tick, sheet number and section name. */
export function SectionMark({ sheet, title, tone = 'paper', className = '' }: SectionMarkProps) {
  const muted = tone === 'pine' ? 'text-sage' : 'text-moss'
  const tick = tone === 'pine' ? 'text-signal' : 'text-signal-deep'
  return (
    <p className={`label flex items-start gap-3 ${muted} ${className}`}>
      <span className={`relative mt-[3px] inline-block h-[11px] w-[11px] shrink-0 ${tick}`} aria-hidden="true">
        <span className="tick left-0 top-0" />
      </span>
      <span>
        Sheet {sheet}
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        {title}
      </span>
    </p>
  )
}
