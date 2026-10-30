import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthLayout } from '@/components/auth-layout'
import { Providers } from './providers'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Cogniwise Artificial Intelligence Literacy',
  description: 'Learn the fundamentals of AI and Machine Learning and earn Cogniwise Artificial Intelligence Literacy certificates.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geist.className} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <AuthLayout>
            {children}
          </AuthLayout>
        </Providers>
      </body>
    </html>
  )
}
