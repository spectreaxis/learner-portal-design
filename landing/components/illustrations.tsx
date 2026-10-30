// Section illustrations, drawn by hand in the survey line style. All decorative.
type IllProps = { className?: string }

/** A survey sheet folded concertina-style; the contours shear at every fold. */
export function FoldedMap({ className = '' }: IllProps) {
  const panels = [
    { pts: '40,96 130,72 130,332 40,356', dy: 0, shade: 0.05 },
    { pts: '130,72 220,98 220,358 130,332', dy: 14, shade: 0.12 },
    { pts: '220,98 310,74 310,334 220,358', dy: 2, shade: 0.05 },
    { pts: '310,74 384,96 384,356 310,334', dy: 16, shade: 0.12 },
  ]
  const contours = [
    'M20 300C80 270 110 210 170 214S260 260 300 220 360 150 400 160',
    'M20 268C70 240 100 186 160 188S250 228 290 190 350 120 400 128',
    'M20 236C60 210 92 160 150 162S240 196 278 162 340 92 400 98',
    'M60 170C90 140 120 128 156 132S220 160 262 132 320 66 380 70',
    'M200 250c20-14 52-14 70 0s20 34 0 44-52 8-68-6-20-26-2-38z',
    'M216 258c12-8 30-8 40 0s12 20 0 26-30 4-38-4-12-15-2-22z',
  ]
  return (
    <svg viewBox="0 0 420 420" className={className} aria-hidden="true" fill="none">
      <defs>
        {panels.map((p, i) => (
          <clipPath id={`fold-${i}`} key={i}>
            <polygon points={p.pts} />
          </clipPath>
        ))}
      </defs>
      {panels.map((p, i) => (
        <g key={i}>
          <polygon points={p.pts} fill="currentColor" fillOpacity={p.shade} stroke="currentColor" strokeWidth="1.25" />
          <g clipPath={`url(#fold-${i})`} transform={`translate(0 ${p.dy})`} stroke="currentColor" strokeWidth="1">
            {contours.map((d, j) => (
              <path key={j} d={d} strokeOpacity={j === 1 ? 1 : 0.7} strokeWidth={j === 1 ? 1.6 : 1} />
            ))}
            <path
              d="M70 330C110 300 150 290 190 270S240 240 236 270"
              stroke="var(--signal)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              transform={`translate(0 ${-p.dy})`}
            />
          </g>
        </g>
      ))}
      <circle cx="236" cy="272" r="7" fill="var(--pine)" stroke="var(--signal)" strokeWidth="2.5" />
    </svg>
  )
}

/** Theodolite on a tripod, sighting along a dashed bearing. */
export function Theodolite({ className = '' }: IllProps) {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15)
  return (
    <svg viewBox="0 0 360 440" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Sight line */}
      <path d="M232 92H356" stroke="var(--signal)" strokeWidth="2" strokeDasharray="6 7" />
      <circle cx="356" cy="92" r="4" fill="var(--signal)" stroke="none" />
      {/* Telescope */}
      <g transform="rotate(-4 170 92)">
        <rect x="104" y="78" width="128" height="28" rx="3" />
        <path d="M232 74h14v36h-14zM96 82h8v20h-8z" />
        <path d="M130 78v28M206 78v28" strokeOpacity=".45" />
        <circle cx="246" cy="92" r="0.5" />
      </g>
      {/* Standards and vertical circle */}
      <path d="M132 112v42M208 108v46" />
      <circle cx="170" cy="96" r="30" strokeOpacity=".5" />
      {ticks.map((a) => (
        <line
          key={a}
          x1="170"
          y1={a % 90 === 0 ? 60 : 63}
          x2="170"
          y2="68"
          transform={`rotate(${a} 170 96)`}
          strokeWidth="1"
          strokeOpacity=".55"
        />
      ))}
      {/* Alidade, horizontal circle, tribrach */}
      <path d="M118 154h104v14H118z" />
      <path d="M108 168h124l-10 16H118z" />
      <path d="M126 184h88v10h-88zM138 194v8M202 194v8M170 194v8" />
      <path d="M120 202h100" strokeWidth="2" />
      {/* Tripod */}
      <path d="M150 204L66 424M170 204v220M190 204l84 220" />
      <path d="M112 300l17 3M211 303l17-3" strokeOpacity=".5" />
      <path d="M58 424h18M161 424h18M266 424h18" strokeWidth="2.5" />
      {/* Plumb bob */}
      <path d="M170 204v120" stroke="var(--signal)" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M170 324l-7 10 7 14 7-14z" fill="var(--signal)" stroke="var(--signal)" strokeLinejoin="round" />
    </svg>
  )
}

/** Trail signpost with two arms, one for each audience. */
export function Signpost({ className = '' }: IllProps) {
  return (
    <svg viewBox="0 0 360 400" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M172 40h16v330h-16z" fill="var(--paper)" />
      <path d="M180 40v330" strokeOpacity=".25" />
      <path d="M172 28l8-10 8 10z" fill="currentColor" />
      {/* Arm pointing west */}
      <g transform="rotate(-6 180 96)">
        <path d="M30 76h150v44H30l-18-22z" fill="var(--paper)" />
        <path d="M44 98h90" strokeDasharray="1 5" strokeLinecap="round" strokeWidth="2" />
      </g>
      {/* Arm pointing east, signal */}
      <g transform="rotate(5 180 178)">
        <path d="M180 156h150l18 22-18 22H180z" fill="var(--signal)" stroke="var(--pine)" />
        <path d="M206 178h104" strokeDasharray="1 5" strokeLinecap="round" strokeWidth="2" stroke="var(--pine)" />
      </g>
      {/* Ground and cairn */}
      <path d="M40 370h280" />
      <path d="M200 370c0-10 10-16 26-16s26 6 26 16" />
      <path d="M210 354c0-8 7-13 16-13s16 5 16 13" />
      <path d="M96 370c4-6 10-8 16-8" strokeOpacity=".5" />
      <path d="M262 370c3-4 8-6 13-6" strokeOpacity=".5" />
    </svg>
  )
}
