import React from 'react'
import type { Metadata, Viewport } from 'next'
import { SamvadaStateProvider } from '@/components/samvada/state'
import { Background } from '@/components/samvada/Background'
import { A11Y_BOOT } from '@/components/samvada/A11y'
import { SkipLink } from '@/components/samvada/SkipLink'
import { RegisterSW } from '@/components/samvada/RegisterSW'
import { Analytics } from '@/components/samvada/Analytics'
import type { ScriptId } from '@/lib/grammar'
import { LANG_OF } from '@/lib/i18n'
import { SITE } from '@/lib/site'
import { dictFor } from '@/lib/i18n/server'
// Self-hosted fonts (Fontsource): no request to Google, builds work offline.
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import '@fontsource/rozha-one/devanagari.css'
import '@fontsource/rozha-one/latin.css'
import '@fontsource/noto-serif-devanagari/devanagari-400.css'
import '@fontsource/noto-serif-devanagari/devanagari-600.css'
import '@fontsource/noto-serif-devanagari/devanagari-700.css'
// Telugu, Kannada and Tamil: Baloo 2 by Ek Type (rounded, weights 400–800). Each file covers only
// its own script's letters (unicode-range), so a page downloads just the script it shows.
import '@fontsource-variable/baloo-tammudu-2'
import '@fontsource-variable/baloo-tamma-2'
import '@fontsource-variable/baloo-thambi-2'
import '@/app/(frontend)/globals.css'


export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'संवदसि · Samvadasi — Speak Sanskrit by changing just the ending', template: '%s — Samvadasi' },
  description: 'Conversational Sanskrit: every dhātu, every lakāra, with respectful and gendered forms. Verified with Vidyut.',
  openGraph: { title: 'संवदसि · Samvadasi', description: 'Speak Sanskrit by changing just the ending.', url: SITE, siteName: 'Samvadasi', type: 'website', images: [{ url: '/api/card?t=%E0%A4%B8%E0%A4%82%E0%A4%B5%E0%A4%A6%E0%A4%B8%E0%A4%BF&s=Speak+Sanskrit+by+changing+just+the+ending&k=you+converse&c=m', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  appleWebApp: { capable: true, title: 'संवदसि', statusBarStyle: 'default' },
}
export const baseViewport: Viewport = { themeColor: '#F4F1EB', width: 'device-width', initialScale: 1 }

/** The html shell shared by the English pages and the /te, /kn, /ta copies. */
export function Shell({ sc = 'deva', children }: { sc?: ScriptId; children: React.ReactNode }) {
  const lang = LANG_OF[sc]
  return (
    <html lang={lang} data-lang={lang} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} /></head>
      <body>
        <SamvadaStateProvider initialSc={sc} dict={dictFor(lang)}>
          <SkipLink />
          <RegisterSW />
          <Background />
          <div className="relative z-[1] min-h-screen">{children}</div>
        </SamvadaStateProvider>
        <Analytics />
      </body>
    </html>
  )
}
