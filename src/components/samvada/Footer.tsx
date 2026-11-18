'use client'
import Link from 'next/link'
import { Wordmark } from './Wordmark'
import { useSamvada } from './state'
import type { UIKey } from '@/lib/i18n'

export const FOOT_LINKS: { href: string; label: UIKey }[] = [
  { href: '/today', label: 'nav.today' },
  { href: '/phrases', label: 'nav.phrases' },
  { href: '/verbs', label: 'nav.verbs' },
  { href: '/verb/01.1137', label: 'nav.oneVerb' },
  { href: '/nouns', label: 'nav.nouns' },
  { href: '/words', label: 'nav.words' },
  { href: '/build', label: 'nav.build' },
  { href: '/packs', label: 'nav.packs' },
  { href: '/greetings', label: 'nav.greetings' },
  { href: '/subhashitas', label: 'nav.subh' },
  { href: '/practice', label: 'nav.practice' },
  { href: '/support', label: 'nav.support' },
]

export function Footer() {
  const { t, query, base } = useSamvada()
  return (
    <footer className="relative overflow-hidden bg-charcoal text-chalk">
      <nav aria-label={t('nav.more')} className="wrap flex flex-wrap gap-x-6 gap-y-2 pt-9 text-[15px] font-semibold">
        {FOOT_LINKS.map((l) => <Link key={l.href} href={base + l.href + query} className="underline-offset-4 hover:underline">{t(l.label)}</Link>)}
        <a href="https://github.com/lalithnarayan/samvadasi" className="underline-offset-4 hover:underline">GitHub</a>
      </nav>
      <div className="wrap flex flex-wrap gap-x-8 gap-y-2 pt-5 pb-2 text-[13px] leading-relaxed text-[#B9B2A6]">
        <span>{t('f.means')}</span>
        <span>{t('f.va')} <a className="underline" href="https://github.com/ambuda-org/vidyut">Vidyut</a> {t('f.vb')}</span>
        <span>{t('f.fonts')}</span>
        <span>{t('f.oss')}</span>
      </div>
      <div aria-hidden className="wrap -mb-[0.3em] text-[clamp(120px,26vw,380px)] leading-[1.1]"><Wordmark /></div>
    </footer>
  )
}
