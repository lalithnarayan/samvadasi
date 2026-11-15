import type { Metadata, Viewport } from 'next'
import React from 'react'
import { SamvadaStateProvider } from '@/components/samvada/state'
import { Background } from '@/components/samvada/Background'
// Self-hosted fonts (Fontsource): no request to Google, builds work offline.
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import '@fontsource/rozha-one/devanagari.css'
import '@fontsource/rozha-one/latin.css'
import '@fontsource/noto-serif-devanagari/devanagari-400.css'
import '@fontsource/noto-serif-devanagari/devanagari-600.css'
import '@fontsource/noto-serif-devanagari/devanagari-700.css'
import '@fontsource/noto-serif-telugu/telugu-500.css'
import '@fontsource/noto-serif-telugu/telugu-700.css'
import '@fontsource/noto-serif-kannada/kannada-500.css'
import '@fontsource/noto-serif-kannada/kannada-700.css'
import '@fontsource/noto-serif-tamil/tamil-500.css'
import '@fontsource/noto-serif-tamil/tamil-700.css'
import './globals.css'

const site = process.env.NEXT_PUBLIC_SERVER_URL || 'https://samavada.si'

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'संवदसि · Samvadasi — Speak Sanskrit by changing just the ending', template: '%s — Samvadasi' },
  description: 'Conversational Sanskrit: every dhātu, every lakāra, with respectful and gendered forms. Verified with Vidyut.',
  openGraph: { title: 'संवदसि · Samvadasi', description: 'Speak Sanskrit by changing just the ending.', url: site, siteName: 'Samvadasi', type: 'website' },
}
export const viewport: Viewport = { themeColor: '#F4F1EB', width: 'device-width', initialScale: 1 }

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SamvadaStateProvider>
          <Background />
          <div className="relative z-[1] min-h-screen">{children}</div>
        </SamvadaStateProvider>
      </body>
    </html>
  )
}
