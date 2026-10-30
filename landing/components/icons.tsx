// Bespoke glyph set. 48px grid, 1.5px stroke, square caps; one signal detail per glyph.
type IconProps = { className?: string }

function Glyph({ className = '', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {children}
    </svg>
  )
}

/* ---------- Programmes ---------- */

export function IconLiteracy(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M5 15c6.5-3 12.5-3 19 0v24c-6.5-3-12.5-3-19 0z" />
      <path d="M43 15c-6.5-3-12.5-3-19 0v24c6.5-3 12.5-3 19 0z" />
      <path d="M9 21.5c3.5-1.2 7-1.2 11 0M9 27c3.5-1.2 7-1.2 11 0M28 21.5c3.5-1.2 7-1.2 11 0" />
      <path d="M28 28c2.2-1.6 3.6-.6 5.2.6s3 1.6 5.8-.6" stroke="var(--signal)" />
      <circle cx="24" cy="8" r="2.2" fill="var(--signal)" stroke="none" />
    </Glyph>
  )
}

export function IconUpskilling(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M4 42h10v-8h10v-8h10v-8h10" />
      <path d="M4 42h40" strokeDasharray="2 3" />
      <path d="M34 18V5" />
      <path d="M34 5.5l9 3.5-9 3.5z" fill="var(--signal)" stroke="var(--signal)" />
      <path d="M9 37v5M19 29v13M29 21v21" strokeOpacity=".35" />
    </Glyph>
  )
}

export function IconAdoption(p: IconProps) {
  return (
    <Glyph {...p}>
      <rect x="13" y="5" width="28" height="32" />
      <path d="M9 9v32h28" />
      <path d="M5 13v32h28" strokeOpacity=".45" />
      <path d="M19 14h16M19 20h16M19 26h9" />
      <path d="M29.5 30.5l3 3 6-7" stroke="var(--signal)" strokeWidth="2" />
    </Glyph>
  )
}

export function IconConsulting(p: IconProps) {
  return (
    <Glyph {...p}>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="11" strokeOpacity=".4" />
      <path d="M24 3v5M24 40v5M3 24h5M40 24h5" />
      <path d="M24 24l7.5-12.5L27 26z" fill="var(--signal)" stroke="var(--signal)" strokeLinejoin="round" />
      <path d="M24 24l-7.5 12.5L21 22z" strokeLinejoin="round" />
    </Glyph>
  )
}

/* ---------- Hazards (the terrain) ---------- */

export function IconUneven(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M6 40h36" />
      <path d="M11 40V30M20 40V14M29 40V34M38 40V22" />
      <circle cx="11" cy="28" r="2" />
      <circle cx="20" cy="12" r="2" />
      <circle cx="29" cy="32" r="2" fill="var(--signal)" stroke="var(--signal)" />
      <circle cx="38" cy="20" r="2" />
    </Glyph>
  )
}

export function IconStalled(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M5 38c6-1 9-6 13-10s8-5 12-5" strokeDasharray="3 3" />
      <path d="M34 17l8 8M42 17l-8 8" stroke="var(--signal)" strokeWidth="2" />
      <circle cx="5" cy="38" r="2.4" fill="currentColor" />
    </Glyph>
  )
}

export function IconFog(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M4 16c5-3 9-3 14 0s9 3 14 0 8-3 12 0" />
      <path d="M4 25c5-3 9-3 14 0" />
      <path d="M24 25c3 1.6 6 1.8 8.5.6" strokeDasharray="2 3" />
      <path d="M4 34c4-2.4 7-2.6 10-1" strokeDasharray="2 3" strokeOpacity=".5" />
      <circle cx="40" cy="31" r="5" stroke="var(--signal)" />
      <path d="M40 29v2.6" stroke="var(--signal)" />
      <path d="M40 33.4v.2" stroke="var(--signal)" strokeWidth="2" />
    </Glyph>
  )
}

/* ---------- Method ---------- */

export function IconSurvey(p: IconProps) {
  return (
    <Glyph {...p}>
      <rect x="15" y="6" width="18" height="11" />
      <path d="M33 11.5h7" />
      <circle cx="24" cy="11.5" r="2.6" fill="var(--signal)" stroke="none" />
      <path d="M21 17h6v4h-6z" />
      <path d="M24 21l-12 22M24 21v22M24 21l12 22" />
      <path d="M17 33h14" strokeOpacity=".4" />
    </Glyph>
  )
}

export function IconPlot(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M6 6h36v36H6z" strokeOpacity=".35" />
      <path d="M18 6v36M30 6v36M6 18h36M6 30h36" strokeOpacity=".2" />
      <path d="M10 37l9-8 6 3 12-15" stroke="var(--signal)" strokeWidth="2" />
      <circle cx="10" cy="37" r="2" fill="currentColor" />
      <circle cx="37" cy="17" r="3" />
    </Glyph>
  )
}

export function IconTraverse(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M8 40c4-8 14-6 16-14s10-12 16-18" strokeDasharray="3 3" stroke="var(--signal)" />
      <path d="M11 30l3-1.5 1 4-3 1z" fill="currentColor" />
      <path d="M17 34l3-1.4.9 4-3 .9z" fill="currentColor" />
      <path d="M30 16l3-1.5 1 4-3 1z" fill="currentColor" />
      <path d="M35 21l3-1.4.9 4-3 .9z" fill="currentColor" />
    </Glyph>
  )
}

export function IconSettle(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M10 42h28" />
      <path d="M13 42c0-4 4-7 11-7s11 3 11 7" />
      <path d="M16 35c0-3.4 3.6-6 8-6s8 2.6 8 6" />
      <path d="M19 29c0-2.6 2.2-4.6 5-4.6s5 2 5 4.6" />
      <path d="M24 24.4V6" />
      <path d="M24 6.5l10 4-10 4z" fill="var(--signal)" stroke="var(--signal)" />
    </Glyph>
  )
}
