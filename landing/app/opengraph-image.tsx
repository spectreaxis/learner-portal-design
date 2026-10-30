import { ImageResponse } from 'next/og'
import { MAIN_CONTOURS, ROUTE } from '@/lib/terrain'

export const alt = 'Cogniwise: find your footing in AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function fraunces() {
  // Pull just the glyphs we need from Google Fonts; fall back to the default face if offline.
  try {
    const css = await (
      await fetch('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@144,400&text=FindyourfootginAI.Cogwse', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534 (KHTML, like Gecko)' },
      })
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const font = await fraunces()
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f2ecdf', position: 'relative' }}>
        <svg width="760" height="722" viewBox="0 0 800 760" style={{ position: 'absolute', right: -120, top: -60 }}>
          {MAIN_CONTOURS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#0e2a23" strokeOpacity={0.25 + (8 - i) * 0.06} strokeWidth={i % 3 === 2 ? 2 : 1.2} />
          ))}
          <path d={ROUTE} fill="none" stroke="#ff5c39" strokeWidth="4" strokeDasharray="10 10" />
          <path d="M560 219l12 20h-24z" fill="#0e2a23" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', height: '100%' }}>
          <div style={{ display: 'flex', fontSize: 34, color: '#0e2a23', fontFamily: font ? 'Fraunces' : undefined }}>Cogniwise</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 132,
              lineHeight: 0.92,
              letterSpacing: '-0.035em',
              color: '#0e2a23',
              fontFamily: font ? 'Fraunces' : undefined,
            }}
          >
            <span>Find your</span>
            <span>footing in AI.</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: 'Fraunces', data: font, weight: 400, style: 'normal' }] : [] },
  )
}
