'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { iast, toScript } from '@/lib/grammar'
import { nounMeaning, type UIKey } from '@/lib/i18n'
import type { NounLite } from '@/lib/data'
import { DEEP, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Input } from '@/components/ui/input'

const CATS = ['pronoun', 'family', 'people', 'food', 'body', 'home', 'place', 'nature', 'time', 'study', 'travel', 'shop', 'life']

export function NounsClient({ nouns }: { nouns: NounLite[] }) {
  const { t, sc, tr, lang, subj, query } = useSamvada()
  const [q, setQ] = useState('')
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return nouns
    return nouns.filter((n) => [n.display, n.nom, toScript(n.display, sc), iast(n.display), n.meaning_en, n.meaning_te, n.meaning_kn, n.meaning_ta].some((x) => x && x.toLowerCase().includes(s)))
  }, [q, nouns, sc])
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-10 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="flex min-w-0 flex-col gap-3.5">
            <span className="eyebrow" style={{ color: deep }}>{t('nav.nouns')}</span>
            <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('n.h1', { n: nouns.length })}</h1>
            <p className="m-0 max-w-[520px] text-lg leading-relaxed">{t('n.p')}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="nq" className="eyebrow text-[11px] opacity-80">{t('n.filter')}</label>
            <Input id="nq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('n.filterPh')} className="h-14 min-w-0 rounded-full bg-paper px-5 text-[17px]" />
          </div>
        </div>
        {!shown.length && <p className="m-0 text-lg">{t('n.none')}</p>}
        {CATS.map((c) => {
          const list = shown.filter((n) => n.cat === c)
          if (!list.length) return null
          return (
            <section key={c} aria-labelledby={`cat-${c}`} className="flex flex-col gap-3">
              <h2 id={`cat-${c}`} className="disp m-0 border-b border-ink/25 pb-2 text-[clamp(24px,2.6vw,34px)] font-extrabold">{t(`cat.${c}` as UIKey)}</h2>
              <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((n) => (
                  <li key={n.slug} className="min-w-0">
                    <Link href={`/noun/${n.slug}${query}`} className="lift flex h-full flex-col gap-0.5 rounded-[20px] border border-ink/12 bg-paper px-4 py-3 no-underline">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span lang="sa" className="min-w-0 text-[24px] leading-normal font-bold [overflow-wrap:anywhere]" style={{ fontFamily: font }}>{toScript(n.nom, sc)}</span>
                        <span className="shrink-0 text-[12px] font-semibold opacity-80">{t(`g.${n.gender}` as UIKey)}</span>
                      </span>
                      <span className="text-[15px] font-semibold">{nounMeaning(lang, n)}</span>
                      {tr && <span className="text-[13px] italic opacity-80">{iast(n.nom)}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </main>
      <Footer />
    </>
  )
}
