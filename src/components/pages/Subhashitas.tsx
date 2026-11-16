'use client'
import Link from 'next/link'
import { iast, toScript } from '@/lib/grammar'
import { pick, type UIKey } from '@/lib/i18n'
import type { SubhLite } from '@/lib/data'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'

const THEMES = ['learning', 'effort', 'speech', 'kindness', 'friendship', 'life', 'world']

export function SubhashitasClient({ list, today }: { list: SubhLite[]; today?: string }) {
  const { t, sc, tr, lang, subj, query } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const day = list.find((x) => x.slug === today)
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-12 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="flex max-w-[820px] flex-col gap-3.5">
          <span className="eyebrow" style={{ color: deep }}>{t('sb.eyebrow')}</span>
          <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('sb.h1')}</h1>
          <p className="m-0 text-lg leading-relaxed">{t('sb.p')}</p>
        </div>
        {day && (
          <section aria-labelledby="sb-today" className="flex min-w-0 flex-col gap-3 rounded-[28px] p-[clamp(22px,3.4vw,44px)]" style={{ background: TINT[subj.color] }}>
            <span id="sb-today" className="eyebrow" style={{ color: deep }}>{t('sb.today')}</span>
            <p lang="sa" className="m-0 text-[clamp(19px,3vw,40px)] leading-[1.6] font-semibold whitespace-pre-line [overflow-wrap:anywhere]" style={{ fontFamily: font }}>{toScript(day.text, sc)}</p>
            {tr && <p className="m-0 text-[15px] italic whitespace-pre-line opacity-80">{iast(day.text)}</p>}
            <p className="disp m-0 max-w-[820px] text-[clamp(18px,1.6vw,22px)] font-semibold">{pick(lang, day.meaning)}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Speak text={day.text} />
              <ShareButton t={day.text} s={pick(lang, day.meaning).slice(0, 120)} k={`सुभाषितम् · ${day.source || ''}`} />
              <Link href={`/subhashita/${day.slug}${query}`} className="pill ml-auto rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-stone no-underline">{t('sb.read')} →</Link>
            </div>
          </section>
        )}
        {THEMES.map((th) => {
          const xs = list.filter((x) => x.theme === th)
          if (!xs.length) return null
          return (
            <section key={th} aria-labelledby={`th-${th}`} className="flex flex-col gap-3">
              <h2 id={`th-${th}`} className="disp m-0 border-b border-ink/25 pb-2 text-[clamp(26px,3vw,40px)] font-extrabold">{t(`th.${th}` as UIKey)}</h2>
              <ul className="m-0 grid list-none gap-3 p-0 lg:grid-cols-2">
                {xs.map((x) => (
                  <li key={x.slug} className="min-w-0">
                    <Link href={`/subhashita/${x.slug}${query}`} className="lift flex h-full flex-col gap-2 rounded-[22px] border border-ink/12 bg-paper px-5 py-4 no-underline">
                      <span lang="sa" className="text-[clamp(19px,1.8vw,24px)] leading-[1.6] font-semibold whitespace-pre-line [overflow-wrap:anywhere]" style={{ fontFamily: font }}>{toScript(x.text, sc)}</span>
                      <span className="text-[15px] leading-snug">{pick(lang, x.meaning)}</span>
                      {x.source && <span className="text-[12px] font-semibold opacity-80">{x.source}</span>}
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
