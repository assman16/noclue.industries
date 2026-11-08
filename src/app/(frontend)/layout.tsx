import type { Metadata, Viewport } from 'next'
import React from 'react'

import '@/styles/globals.css'

import { ConsoleNote } from '@/components/ConsoleNote'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { RevealObserver } from '@/components/RevealObserver'
import { SITE } from '@/content/defaults'
import { getSettings } from '@/lib/data'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: 'NoClue Industries',
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#07090a',
  colorScheme: 'dark',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Enable reveal animations only when JS runs; content is visible without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preload" href="/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/jetbrains-mono-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer settings={settings} />
        <RevealObserver />
        <ConsoleNote />
      </body>
    </html>
  )
}
