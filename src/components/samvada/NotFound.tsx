'use client'
import Link from 'next/link'
import { useSamvada } from './state'
import { SiteNav } from './SiteNav'
import { Footer } from './Footer'
import { VerbPicker } from './VerbPicker' // loads its search panel only on first use

/** A dead end that isn't one: say so plainly, then offer search and the main places to go. */
export function NotFoundView() {
  const { t, base, query } = useSamvada()
  const links = [['/today', 'nav.today'], ['/path', 'nav.path'], ['/verbs', 'nav.verbs'], ['/phrases', 'nav.phrases']] as const
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex min-h-[60vh] flex-col gap-6 pt-[clamp(32px,6vw,80px)] pb-[72px] outline-none">
        <span className="eyebrow">404</span>
        <h1 className="disp m-0 max-w-[18ch] text-[clamp(36px,6vw,64px)] leading-[1.05] font-extrabold">{t('nf.title')}</h1>
        <p className="m-0 max-w-[56ch] text-lg opacity-85">{t('nf.lead')}</p>
        <div className="max-w-[560px]"><VerbPicker current="?" /></div>
        <nav aria-label={t('nav.more')} className="flex flex-wrap gap-2">
          {links.map(([href, k]) => <Link key={href} href={base + href + query} className="pill rounded-full border border-ink/25 px-5 py-2.5 font-semibold no-underline">{t(k)}</Link>)}
        </nav>
      </main>
      <Footer />
    </>
  )
}
