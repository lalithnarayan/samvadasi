'use client'
import Link from 'next/link'
import { iast, toScript } from '@/lib/grammar'
import { pick, type UIKey } from '@/lib/i18n'
import type { SubhLite, WordLink } from '@/lib/data'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'

const L = ['English', 'తెలుగు', 'ಕನ್ನಡ', 'தமிழ்']

export function SubhashitaClient({ s, links, prev, next }: { s: SubhLite; links: WordLink[]; prev: SubhLite; next: SubhLite }) {
  const { t, sc, tr, lang, subj, query } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const order = [lang === 'en' ? 0 : lang === 'te' ? 1 : lang === 'kn' ? 2 : 3, 0, 1, 2, 3].filter((v, i, a) => a.indexOf(v) === i)
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-8 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="flex flex-col gap-2">
          <Link href={'/subhashitas' + query} className="self-start text-sm font-semibold underline-offset-2 hover:underline">← {t('sb.all')}</Link>
          <span className="eyebrow" style={{ color: deep }}>{t(`th.${s.theme}` as UIKey)}{s.source ? ` · ${s.source}` : ''}</span>
        </div>
        <section aria-label={t('nav.subh')} className="flex min-w-0 flex-col gap-3 rounded-[28px] p-[clamp(22px,3.6vw,48px)]" style={{ background: TINT[subj.color] }}>
          <p lang="sa" className="m-0 text-[clamp(19px,3.6vw,52px)] leading-[1.6] font-semibold whitespace-pre-line [overflow-wrap:anywhere]" style={{ fontFamily: font }}>{toScript(s.text, sc)}</p>
          {tr && <p className="m-0 text-[16px] italic whitespace-pre-line opacity-80">{iast(s.text)}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Speak text={s.text} className="size-11" />
            <ShareButton t={s.text} s={pick(lang, s.meaning).slice(0, 120)} k={`सुभाषितम् · ${s.source || ''}`} className="size-11" />
          </div>
        </section>

        {links.length > 0 && (
          <section aria-labelledby="sb-words" className="flex flex-col gap-3">
            <h2 id="sb-words" className="disp m-0 text-[clamp(24px,2.6vw,34px)] font-extrabold">{t('sb.words')}</h2>
            <p className="m-0 -mt-1 text-[15px] opacity-80">{t('sb.wordsP')}</p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {links.map((l, i) => {
                const target = l.verb ? { href: `/verb/${l.verb.slug}`, kind: t('sb.verb'), d: l.verb.display, m: l.verb.meaning } : l.noun ? { href: `/noun/${l.noun.slug}`, kind: t('sb.noun'), d: l.noun.display, m: l.noun.meaning } : null
                const word = <span lang="sa" className="text-[22px] font-semibold" style={{ fontFamily: font }}>{toScript(l.w, sc)}</span>
                return (
                  <li key={i}>
                    {target ? (
                      <Link href={target.href + query} className="pill flex flex-col rounded-2xl border border-ink/25 bg-paper px-3.5 py-1.5 no-underline">
                        <span className="underline decoration-dotted underline-offset-4">{word}</span>
                        <span className="text-[12px]"><span className="font-semibold" style={{ color: deep }}>{target.kind}</span> · <span style={{ fontFamily: font }}>{toScript(target.d, sc)}</span>{target.m ? ` · ${target.m.replace(/^to /, '')}` : ''}</span>
                      </Link>
                    ) : (
                      <span className="flex flex-col rounded-2xl border border-ink/10 px-3.5 py-1.5">{word}{tr && <span className="text-[12px] italic opacity-80">{iast(l.w)}</span>}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="sb-m" className="flex flex-col gap-3">
          <h2 id="sb-m" className="disp m-0 text-[clamp(24px,2.6vw,34px)] font-extrabold">{t('sb.meaning')}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {order.map((i) => s.meaning[i] ? (
              <div key={i} className="rounded-[22px] border border-ink/12 bg-paper px-5 py-4">
                <span className="eyebrow text-[11px] opacity-80">{L[i]}</span>
                <p className="m-0 mt-1 text-[17px] leading-relaxed">{s.meaning[i]}</p>
              </div>
            ) : null)}
          </div>
          {!s.reviewed && <p className="m-0 text-[13px] italic opacity-80">{t('sb.unreviewed')}</p>}
        </section>

        <nav aria-label={t('sb.all')} className="grid gap-3 border-t border-ink/25 pt-5 sm:grid-cols-2">
          {[{ x: prev, l: t('sb.prev'), a: '←' }, { x: next, l: t('sb.next'), a: '→' }].map(({ x, l, a }) => (
            <Link key={l} href={`/subhashita/${x.slug}${query}`} className="lift flex flex-col gap-1 rounded-[20px] border border-ink/12 bg-paper px-5 py-3 no-underline">
              <span className="text-[13px] font-semibold opacity-80">{a} {l}</span>
              <span lang="sa" className="truncate text-[18px] font-semibold" style={{ fontFamily: font }}>{toScript(x.text.split('\n')[0], sc)}</span>
            </Link>
          ))}
        </nav>
      </main>
      <Footer />
    </>
  )
}
