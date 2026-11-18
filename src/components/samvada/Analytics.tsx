'use client'
import { Analytics as Vercel } from '@vercel/analytics/next'
import Script from 'next/script'

const UMAMI = process.env.NEXT_PUBLIC_UMAMI_ID
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js'

/** Page views (Vercel Web Analytics, cookie-free) and, if configured, Umami for the practice funnel events. */
export function Analytics() {
  return (
    <>
      <Vercel />
      {UMAMI && <Script src={UMAMI_SRC} data-website-id={UMAMI} strategy="afterInteractive" />}
    </>
  )
}
