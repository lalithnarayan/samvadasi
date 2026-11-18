'use client'
import Link from 'next/link'
import { toScript } from '@/lib/grammar'
import { pick } from '@/lib/i18n'
import type { PackLite } from '@/lib/data'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'

const TONES = ['u', 'm', 'p'] as const

export function PacksClient({ packs }: { packs: PackLite[] }) {
  const { t, sc, lang, subj, query, base } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-10 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="flex max-w-[820px] flex-col gap-3.5">
          <span className="eyebrow" style={{ color: deep }}>{t('pk.eyebrow')}</span>
          <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('pk.h1')}</h1>
          <p className="m-0 text-lg leading-relaxed">{t('pk.p')}</p>
        </div>
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((k, i) => (
            <li key={k.slug} className="min-w-0">
              <Link href={base + `/packs/${k.slug}${query}`} className="lift flex h-full min-h-[220px] flex-col gap-2 rounded-[26px] border border-transparent p-6 no-underline" style={{ background: TINT[TONES[i % 3]] }}>
                <span className="disp text-[13px] font-extrabold opacity-80">{String(i + 1).padStart(2, '0')}</span>
                <span lang="sa" className="text-[34px] leading-snug font-bold" style={{ fontFamily: font, color: DEEP[TONES[i % 3]] }}>{toScript(k.titleSa || '', sc)}</span>
                <span className="disp card-t text-[26px] leading-tight font-extrabold">{pick(lang, k.title)}</span>
                <span className="flex-1" />
                <span className="flex flex-wrap gap-1.5 text-[14px]">{k.words.slice(0, 4).map((w) => <span key={w.sa} className="rounded-full bg-paper/70 px-2.5 py-0.5" style={{ fontFamily: font }}>{toScript(w.sa, sc)}</span>)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}
