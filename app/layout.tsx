'use client';

import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Sidebar } from '@/components/sidebar'
import { Providers } from './providers'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geist.className} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <div className="flex min-h-screen">
            {/* Single Sidebar instance for entire app */}
            <Sidebar />

            {/* Main content area with responsive margin */}
            <main className="flex-1 md:ml-[260px]">
              {children}
            </main>
          </div>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
