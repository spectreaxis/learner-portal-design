import type { Metadata, Viewport } from 'next'
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google'
import { MotionProvider } from '@/components/motion-provider'
import { site } from '@/lib/site'
import './globals.css'

// Upright and italic are split so only the upright face is preloaded; the italic
// (used for emphasis words) carries the WONK axis and loads on demand.
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  style: 'normal',
  display: 'swap',
  variable: '--font-fraunces',
})

const frauncesItalic = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'WONK'],
  style: 'italic',
  display: 'swap',
  preload: false,
  variable: '--font-fraunces-italic',
})

const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-instrument',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'AI literacy',
    'AI training',
    'workforce upskilling',
    'AI adoption',
    'AI consulting',
    'AI strategy',
    'AI governance',
    'AI competency',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#fafafa',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${fraunces.variable} ${frauncesItalic.variable} ${instrument.variable} ${plexMono.variable}`}
    >
      <body className="min-h-dvh overflow-x-clip">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
