'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { cellFor, iast, joinWords, ktaCell, padaOf, subject, toScript, WHENS, type Gender, type Num, type PersonId, type PhraseLite, type WhenId } from '@/lib/grammar'
import { genderWordsIn, sentence, subjectLabel } from '@/lib/i18n'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'

type Card = { person: PersonId; number: number; gender: Gender; lakara: WhenId; phrase: PhraseLite }
const PNAME = { u: ['उत्तम', 'per.u'], m: ['मध्यम', 'per.m'], p: ['प्रथम', 'per.p'] } as const

export function PracticeClient({ cards }: { cards: Card[] }) {
  const { sc, tr, query, t, lang } = useSamvada()
  const [deck, setDeck] = useState(() => cards.map((c, i) => ({ ...c, key: i })))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [said, setSaid] = useState(0)
  const [first, setFirst] = useState(0)
  const [missed, setMissed] = useState<Set<number>>(new Set())
  const total = cards.length
  const done = pos >= deck.length
  const it = deck[done ? 0 : pos]
  const s = subject(it.person, it.number as Num, it.gender)
  const cell = cellFor(it.phrase.dhatu, it.lakara, s)
  const words = joinWords([s.sk, ...it.phrase.words, cell?.form || ''])
  const W = WHENS.find((w) => w.id === it.lakara)!
  const deep = DEEP[s.color], font = `var(--font-sk-${sc})`
  const gw = genderWordsIn(lang, it.gender, it.number as Num)
  const who = subjectLabel(lang, s).replace(/\s*\(.*\)/, '') + (it.person === 'r' ? `, ${t('resp')}` : '') + (it.person === 'r' || it.lakara === 'kta' || (it.person === 'p' && it.number > 0) ? ` (${gw})` : '')
  const why = useMemo(() => {
    const d = it.phrase.dhatu
    if (it.lakara === 'kta') { const k = ktaCell(d, it.gender, it.number); return t('pr.whyKta', { stem: toScript(k?.stem || '', sc), end: toScript(k?.end || '', sc), g: gw }) }
    if (it.person === 'r') return t('pr.whyResp')
    const [pk, pl] = PNAME[s.color]
    return (d.irregular ? t('pr.irr') : padaOf(d) === 'A' ? t('pr.atm') : '') + `${toScript(pk, sc)} (${t(pl)}) + ${toScript(W.name, sc)} (${t(`when.${W.id}`)}).`
  }, [it, gw, s.color, W, t, sc])

  const next = (gotIt: boolean) => {
    if (gotIt) { setSaid((n) => n + 1); if (!missed.has(it.key)) setFirst((n) => n + 1) }
    else { setDeck((d) => [...d, it]); setMissed((m) => new Set(m).add(it.key)) }
    setFlipped(false); setPos((p) => p + 1)
  }
  const restart = () => { setDeck(cards.map((c, i) => ({ ...c, key: i }))); setPos(0); setFlipped(false); setSaid(0); setFirst(0); setMissed(new Set()) }

  return (
    <div className="min-h-screen transition-colors duration-700" style={{ background: TINT[s.color] }}>
      <SiteNav />
      <main className="wrap pt-[clamp(20px,3vw,40px)] pb-[72px]">
        <div className="mx-auto flex max-w-[720px] flex-col gap-[22px]">
          {!done ? <>
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="eyebrow" style={{ color: deep }}>{t('pr.eyebrow', { n: pos + 1 })}</span>
                <span className="text-sm font-semibold">{t('pr.said', { s: said, t: total })}</span>
              </div>
              <div aria-hidden className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0,1fr))` }}>
                {Array.from({ length: total }, (_, i) => <span key={i} className="h-1 rounded-sm" style={{ background: i < said ? 'var(--color-ink)' : 'rgb(36 33 29 / .15)' }} />)}
              </div>
            </div>
            <div className="relative h-[clamp(420px,52vh,500px)] [perspective:1600px]">
              <span aria-hidden className="absolute inset-x-6 top-[22px] -bottom-3.5 rounded-[30px] border border-ink/8 bg-paper/50" />
              <span aria-hidden className="absolute inset-x-3 top-[11px] -bottom-[7px] rounded-[30px] border border-ink/10 bg-paper/75" />
              <button onClick={() => setFlipped((f) => !f)} aria-label={flipped ? t('pr.turnBack') : t('pr.turnOver')} className="absolute inset-0 text-left">
                <span className="flip absolute inset-0 block" style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
                  <span className="face absolute inset-0 flex flex-col gap-4 rounded-[30px] border border-ink/14 bg-paper p-[clamp(24px,4vw,40px)]">
                    <span className="eyebrow text-xs opacity-60">{t('pr.sayAloud')}</span>
                    <span className="disp text-[clamp(30px,4.4vw,52px)] leading-[1.08] font-extrabold">{sentence(lang, s, it.lakara, it.phrase.english)}</span>
                    <span className="flex-1" />
                    <span className="flex flex-wrap gap-2 text-[13px]">
                      <span className="rounded-full px-3 py-1.5 font-bold" style={{ background: TINT[s.color], color: deep }}>{t('pr.who')} · {who}</span>
                      <span className="rounded-full border border-ink/20 px-3 py-1.5">{t('pr.when')} · <span className="font-bold" style={{ fontFamily: font }}>{toScript(W.name, sc)}</span> {t(`when.${W.id}`)}</span>
                      <span className="rounded-full border border-ink/20 px-3 py-1.5">{t('pr.verb')} · <span className="font-bold" style={{ fontFamily: font }}>{toScript(it.phrase.dhatu.display, sc)}</span></span>
                    </span>
                    <span className="text-[13px] opacity-60">{t('pr.tap')}</span>
                  </span>
                  <span className="face absolute inset-0 flex flex-col gap-3 rounded-[30px] border border-ink/14 bg-paper p-[clamp(24px,4vw,40px)] [transform:rotateY(180deg)]">
                    <span className="eyebrow text-xs opacity-60">{t('pr.didYou')}</span>
                    <span lang="sa" className="text-[clamp(32px,4.4vw,50px)] leading-[1.55] font-semibold" style={{ fontFamily: font }}>
                      {toScript(words.slice(0, -1).join(' ') + ' ' + (cell?.stem || ''), sc)}<span style={{ color: deep }}>{toScript(cell?.end || '', sc)}</span>।
                    </span>
                    {tr && <span className="text-base italic opacity-65">{iast(words.join(' '))}</span>}
                    <span className="flex-1" />
                    <span className="rounded-[18px] px-4 py-3.5 text-[15px] leading-normal" style={{ background: TINT[s.color] }}>{why}</span>
                  </span>
                </span>
              </button>
            </div>
            <div className="mt-3.5 grid grid-cols-2 gap-3" style={{ visibility: flipped ? 'visible' : 'hidden' }}>
              <button onClick={() => next(false)} className="pill min-h-[58px] rounded-full border border-ink text-base font-semibold">{t('pr.notYet')}</button>
              <button onClick={() => next(true)} className="pill min-h-[58px] rounded-full border border-ink bg-ink text-base font-semibold text-stone">{t('pr.gotIt')}</button>
            </div>
            <p className="m-0 text-center text-sm opacity-70">{t('pr.notYetHint')}</p>
          </> : (
            <section className="flex flex-col gap-4 pt-[clamp(24px,6vw,80px)]">
              <span className="eyebrow" style={{ color: deep }}>{t('pr.end')}</span>
              <h1 className="disp m-0 text-[clamp(44px,6vw,84px)] leading-[0.98] font-extrabold">{t('pr.first', { f: first, t: total })}</h1>
              <p className="m-0 max-w-[520px] text-[19px] leading-relaxed">{missed.size === 0 ? t('pr.none') : t(missed.size === 1 ? 'pr.some1' : 'pr.someN', { n: missed.size })}</p>
              <div className="mt-2.5 flex flex-wrap gap-3">
                <button onClick={restart} className="pill min-h-[58px] rounded-full border border-ink bg-ink px-7 text-base font-semibold text-stone">{t('pr.again')}</button>
                <Link href={'/phrases' + query} className="pill flex min-h-[58px] items-center rounded-full border border-ink px-7 text-base font-semibold no-underline">{t('pr.back')}</Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
