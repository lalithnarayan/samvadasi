'use client'
import { useEffect } from 'react'
import { useSamvada } from './state'
import { SiteNav } from './SiteNav'

/** Shown when a page fails to render (a database timeout on a cold start, say), with a retry. */
export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useSamvada()
  useEffect(() => { console.error(error) }, [error])
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex min-h-[60vh] flex-col gap-6 pt-[clamp(32px,6vw,80px)] pb-[72px] outline-none">
        <h1 className="disp m-0 text-[clamp(36px,6vw,64px)] leading-[1.05] font-extrabold">{t('err.title')}</h1>
        <p className="m-0 max-w-[56ch] text-lg opacity-85">{t('err.lead')}</p>
        <button onClick={reset} className="pill disp min-h-[56px] self-start rounded-full bg-ink px-8 text-lg font-bold text-stone">{t('err.retry')} →</button>
        {error.digest && <p className="m-0 text-[13px] opacity-60">ref {error.digest}</p>}
      </main>
    </>
  )
}
