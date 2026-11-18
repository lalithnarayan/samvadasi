'use client'
import Link from 'next/link'
import { useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'

export function OfflineClient() {
  const { t, query, base } = useSamvada()
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex min-h-[60vh] flex-col justify-center gap-4 pb-[72px] outline-none">
        <h1 className="disp m-0 text-[clamp(40px,6vw,80px)] font-extrabold">{t('off.title')}</h1>
        <p className="m-0 max-w-[520px] text-lg">{t('off.p')}</p>
        <Link href={base + '/' + query} className="pill self-start rounded-full bg-ink px-6 py-3 font-semibold text-stone no-underline">संवदसि →</Link>
      </main>
    </>
  )
}
