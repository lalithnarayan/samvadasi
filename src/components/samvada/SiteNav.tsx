'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SCRIPTS } from '@/lib/grammar'
import { cn } from '@/lib/utils'
import { stripLang, useSamvada } from './state'
import { Wordmark } from './Wordmark'
import { A11yMenu } from './A11y'

const LINKS = [
  { href: '/today', label: 'nav.today' },
  { href: '/path', label: 'nav.path', match: '/path/' },
  { href: '/phrases', label: 'nav.phrases' },
  { href: '/verbs', label: 'nav.verbs', match: '/verb/' },
  { href: '/nouns', label: 'nav.nouns', match: '/noun/' },
  { href: '/build', label: 'nav.build' },
  { href: '/packs', label: 'nav.packs', match: '/packs/' },
] as const

export function SiteNav() {
  const path = stripLang(usePathname())
  const { sc, tr, set, query, t, base } = useSamvada()
  return (
    <header className="wrap relative flex flex-wrap items-center gap-x-4 gap-y-3 pt-[18px] pb-3.5">
      <Link href={base + '/' + query} className="flex min-h-11 items-baseline gap-2 no-underline">
        <Wordmark className="text-[30px] leading-[1.3]" />
      </Link>
      <nav aria-label={t('nav.main')} className="order-3 flex w-full gap-0.5 overflow-x-auto sm:order-none sm:w-auto">
        {LINKS.map((l) => {
          const on = path === l.href || ('match' in l && path.startsWith(l.match))
          return (
            <Link key={l.href} href={base + l.href + query} aria-current={on ? 'page' : undefined}
              className={cn('disp pill shrink-0 rounded-full border px-4 py-2.5 text-[15px] font-semibold no-underline', on ? 'border-ink/55' : 'border-transparent')}>
              {t(l.label)}
            </Link>
          )
        })}
      </nav>
      <span className="flex-1" />
      <div role="group" aria-label={t('nav.script')} className="seg">
        {SCRIPTS.map((x) => (
          <button key={x.id} onClick={() => set({ sc: x.id })} aria-pressed={sc === x.id}
            className={cn('pill min-h-10 min-w-10 rounded-full text-[15px]', sc === x.id ? 'bg-ink text-stone' : '')} style={{ fontFamily: x.font }}>
            {x.short}<span className="sr-only"> {x.name}</span>
          </button>
        ))}
      </div>
      <button onClick={() => set({ tr: !tr })} aria-pressed={tr} className="pill min-h-[46px] rounded-full border border-ink/20 px-3.5 text-[13px] font-semibold">
        {tr ? t('nav.iastOn') : t('nav.iastOff')}
      </button>
      <A11yMenu />
    </header>
  )
}
