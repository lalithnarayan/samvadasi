'use client'
import Link from 'next/link'
import { cellFor, iast, joinWords, noteFor, toScript, WHENS, type PhraseLite } from '@/lib/grammar'
import { meaningOf, sentence, situationTitle, subjectLabel, type UIKey } from '@/lib/i18n'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { Word } from '@/components/samvada/Word'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Dock } from '@/components/samvada/Dock'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'
import { StyleSwitch } from '@/components/samvada/StyleSwitch'
import { Footer } from '@/components/samvada/Footer'

type Sit = { id: any; title: string; titleSa?: string | null; phrases: PhraseLite[] }

export function PhrasesClient({ situations }: { situations: Sit[] }) {
  const { subj, when, sc, tr, query, t, lang, style, base } = useSamvada()
  const w = WHENS.find((x) => x.id === when)!
  const deep = DEEP[subj.color], font = `var(--font-sk-${sc})`
  let n = 0
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap outline-none pt-[clamp(24px,4vw,56px)] pb-[72px]">
        <div className="mb-[clamp(32px,5vw,64px)] grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div className="flex flex-col gap-3.5">
            <span className="eyebrow" style={{ color: deep }}>{t('nav.phrases')}</span>
            <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('ph.h1')}</h1>
            <p className="m-0 max-w-[560px] text-lg leading-relaxed">{t('ph.p')} <strong style={{ color: deep, fontFamily: font }}>{toScript(subj.sk, sc)}</strong> {subjectLabel(lang, subj)}, <strong style={{ fontFamily: font }}>{toScript(w.name, sc)}</strong> {t(`when.${w.id}`)}.</p>
          </div>
          <aside className="flex flex-col gap-2.5 pt-2 text-sm leading-relaxed">
            <span className="eyebrow text-[11px] opacity-80">{t('ph.how')}</span>
            <span>{lang === 'en' ? <>The coloured part is the ending. Change <strong>who</strong> and only it moves. Change <strong>when</strong> and the stem moves too.</> : t('ph.howBody')}</span>
            <span className="italic opacity-80">{t(`hint.${w.id}`)}</span>
            <StyleSwitch className="mt-1" />
          </aside>
        </div>

        <div aria-live="polite" className="flex flex-col gap-[clamp(48px,6vw,88px)]">
          {situations.map((s, si) => (
            <section key={s.id} className="flex flex-col gap-3.5">
              <div className="grid items-end border-b border-ink/25 pb-2.5 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
                <div className="flex flex-wrap items-baseline gap-3.5">
                  <span className="disp text-[15px] font-extrabold" style={{ color: deep }}>{String(si + 1).padStart(2, '0')}</span>
                  <h2 className="disp m-0 text-[clamp(28px,3.4vw,44px)] leading-none font-extrabold">{situationTitle(lang, s.title)}</h2>
                  {s.titleSa && <span className="text-xl opacity-75" style={{ fontFamily: font }}>{toScript(s.titleSa, sc)}</span>}
                </div>
                <span className="eyebrow hidden text-[11px] opacity-75 lg:block">{t('ph.notes')}</span>
              </div>
              {s.phrases.map((p) => {
                const cell = cellFor(p.dhatu, when, subj)
                if (!cell) return null
                const words = joinWords([subj.sk, ...p.words, cell.form])
                const pre = words.slice(0, -1).join(' ') + ' '
                const note = noteFor(p.dhatu, when, subj, cell.note, t, lang) || p.note || ''
                const i = n++
                return (
                  <div key={p.id} className="grid gap-1.5 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
                    <Link href={base + `/verb/${p.dhatu.slug}${query}`} className="lift relative block rounded-[22px] border border-ink/12 bg-paper px-[clamp(20px,2.4vw,32px)] py-[clamp(18px,2vw,26px)] no-underline">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="disp text-[13px] font-extrabold opacity-75">{String(i + 1).padStart(2, '0')}</span>
                        <span className="flex items-baseline gap-2 rounded-full px-3 py-1 text-[13px]" style={{ background: TINT[subj.color] }}>
                          <span className="text-[15px] font-bold" style={{ color: deep, fontFamily: font }}>{toScript(p.dhatu.display, sc)}</span>{meaningOf(p.dhatu, lang, sc).main} <span className="arr" aria-hidden>→</span>
                        </span>
                      </div>
                      <p lang="sa" className="m-0 text-[clamp(26px,2.6vw,38px)] leading-[1.6] font-semibold" style={{ fontFamily: font }}>
                        {toScript(pre, sc)}<Word stem={cell.stem} end={cell.end} color={deep} delay={Math.min(i * 25, 500)} style={{ fontWeight: 700 }} />।
                      </p>
                      {tr && <p className="m-0 text-[15px] italic opacity-75">{iast(words.join(' '))}</p>}
                      <p className="disp mt-1.5 mb-0 text-[clamp(17px,1.5vw,20px)] font-semibold">{sentence(lang, subj, when, p.english, style)}</p>
                      {cell.also.length > 0 && <p className="mt-1 mb-0 text-sm opacity-75">{t('ph.also')}: {cell.also.map((a) => `${toScript(a.form, sc)} (${t(`lbl.${a.label}` as UIKey)})`).join(', ')}</p>}
                    </Link>
                    <aside className="flex flex-col gap-2 pt-1 lg:pt-3.5">
                      <span className="flex gap-2">
                        <Speak text={words.join(' ')} />
                        <ShareButton t={words.join(' ') + '।'} s={sentence(lang === 'en' ? 'en' : lang, subj, when, p.english, style)} k={`${w.name} · ${t(`when.${w.id}`)}`} />
                      </span>
                      <span className="text-sm leading-relaxed italic opacity-85">{note}</span>
                    </aside>
                  </div>
                )
              })}
            </section>
          ))}
        </div>
        <Link href={base + '/practice' + query} className="lift mt-[72px] flex max-w-[calc(100%-320px)] items-center justify-between gap-4 rounded-[26px] border border-transparent bg-charcoal px-8 py-7 text-chalk no-underline max-lg:max-w-none">
          <span className="flex flex-col gap-1.5"><span className="disp text-[clamp(26px,3vw,40px)] leading-none font-extrabold">{t('ph.ctaH')}</span><span className="text-[15px] text-[#B9B2A6]">{t('ph.ctaP')}</span></span>
          <span className="arr text-[34px] [transform:rotate(-45deg)]" aria-hidden>→</span>
        </Link>
      </main>
      <Footer />
      <Dock />
    </>
  )
}
