'use client'
import Link from 'next/link'
import { cellFor, iast, joinWords, toScript, WHENS, type PhraseLite } from '@/lib/grammar'
import { pick, sentence } from '@/lib/i18n'
import type { PackLite } from '@/lib/data'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Dock } from '@/components/samvada/Dock'
import { Word } from '@/components/samvada/Word'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'
import { StyleSwitch } from '@/components/samvada/StyleSwitch'

export function PackClient({ pack, others }: { pack: PackLite; others: PackLite[] }) {
  const { t, sc, tr, lang, subj, when, query, style, base } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const W = WHENS.find((x) => x.id === when)!
  const line = (p: PhraseLite) => {
    const cell = cellFor(p.dhatu, when, subj)
    if (!cell) return null
    const words = joinWords([subj.sk, ...p.words, cell.form])
    return { cell, words, pre: words.slice(0, -1).join(' ') + ' ' }
  }
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-10 pt-[clamp(24px,4vw,56px)] pb-[72px] outline-none">
        <div className="flex flex-col gap-2">
          <Link href={base + '/packs' + query} className="self-start text-sm font-semibold underline-offset-2 hover:underline">← {t('pk.all')}</Link>
          <span lang="sa" className="text-[clamp(28px,3vw,40px)] font-bold" style={{ fontFamily: font, color: deep }}>{toScript(pack.titleSa || '', sc)}</span>
          <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{pick(lang, pack.title)}</h1>
          <p className="m-0 text-lg">{t('pk.count', { w: pack.words.length, p: pack.phrases.length })}</p>
        </div>

        <section aria-labelledby="pk-w" className="flex flex-col gap-3">
          <h2 id="pk-w" className="disp m-0 border-b border-ink/25 pb-2 text-[clamp(26px,3vw,40px)] font-extrabold">{t('pk.words')}</h2>
          <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {pack.words.map((w) => (
              <li key={w.sa} className="flex min-w-0 flex-col gap-0.5 rounded-[20px] border border-ink/12 bg-paper px-4 py-3">
                <span className="flex items-center gap-2">
                  <span lang="sa" className="text-[24px] leading-normal font-bold" style={{ fontFamily: font }}>{toScript(w.sa, sc)}</span>
                  <Speak text={w.sa.replace(/\?$/, '')} className="size-8" />
                </span>
                <span className="text-[15px] font-semibold">{pick(lang, w.m)}{lang !== 'en' && <span className="font-normal opacity-80"> · {w.m[0]}</span>}</span>
                {tr && <span className="text-[13px] italic opacity-80">{iast(w.sa)}</span>}
                {w.noun && <Link href={base + `/noun/${w.noun}${query}`} className="mt-1 self-start text-[13px] font-semibold underline-offset-2 hover:underline">{t('pk.table')} →</Link>}
              </li>
            ))}
          </ul>
        </section>

        {pack.phrases.length > 0 && (
          <section aria-labelledby="pk-p" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/25 pb-2">
              <h2 id="pk-p" className="disp m-0 text-[clamp(26px,3vw,40px)] font-extrabold">{t('pk.phrases')}</h2>
              <StyleSwitch />
            </div>
            <div aria-live="polite" className="grid gap-3 lg:grid-cols-2">
              {pack.phrases.map((p, i) => {
                const l = line(p)
                if (!l) return null
                return (
                  <div key={p.id} className="flex min-w-0 flex-col gap-1 rounded-[22px] border border-ink/12 bg-paper px-5 py-4">
                    <p lang="sa" className="m-0 text-[clamp(22px,2.2vw,30px)] leading-[1.6] font-semibold" style={{ fontFamily: font }}>
                      {toScript(l.pre, sc)}<Word stem={l.cell.stem} end={l.cell.end} color={deep} delay={Math.min(i * 25, 400)} style={{ fontWeight: 700 }} />।
                    </p>
                    {tr && <p className="m-0 text-[14px] italic opacity-80">{iast(l.words.join(' '))}</p>}
                    <p className="disp m-0 text-[17px] font-semibold">{sentence(lang, subj, when, p.english, style)}</p>
                    <span className="mt-1 flex gap-2">
                      <Speak text={l.words.join(' ')} />
                      <ShareButton t={l.words.join(' ') + '।'} s={sentence(lang, subj, when, p.english, style)} k={`${W.name} · ${t(`when.${W.id}`)}`} />
                      <Link href={base + `/verb/${p.dhatu.slug}${query}`} className="ml-auto self-center rounded-full px-3 py-1 text-[13px] font-semibold no-underline" style={{ background: TINT[subj.color] }}>
                        <span style={{ fontFamily: font, color: deep }}>{toScript(p.dhatu.display, sc)}</span> →
                      </Link>
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <nav aria-label={t('pk.all')} className="flex flex-wrap gap-2 border-t border-ink/25 pt-5">
          {others.map((k) => (
            <Link key={k.slug} href={base + `/packs/${k.slug}${query}`} className="pill flex items-baseline gap-2 rounded-full border border-ink/20 bg-paper px-4 py-2 no-underline">
              <span className="font-bold" style={{ fontFamily: font }}>{toScript(k.titleSa || '', sc)}</span><span className="text-[13px]">{pick(lang, k.title)}</span>
            </Link>
          ))}
        </nav>
      </main>
      <Footer />
      <Dock />
    </>
  )
}
