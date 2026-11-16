'use client'
import { useMemo, useState } from 'react'
import { cellFor, familyView, iast, joinWords, splitScript, subject, toScript, WHENS, type DhatuLite, type Num, type WhenId } from '@/lib/grammar'
import { meaningOf, nounMeaning, subjectLabel, type UIKey } from '@/lib/i18n'
import type { NounLite } from '@/lib/data'
import { cn } from '@/lib/utils'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Dock } from '@/components/samvada/Dock'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'

type Slot = 'object' | 'place' | 'with' | 'for' | 'from'
const CASE: Record<Slot, number> = { object: 1, place: 6, with: 2, for: 3, from: 4 }
const TIMES: { w: string; en: string; tense?: 'past' | 'future' }[] = [
  { w: 'अद्य', en: 'today' }, { w: 'इदानीम्', en: 'now' }, { w: 'प्रातः', en: 'in the morning' }, { w: 'सायम्', en: 'in the evening' },
  { w: 'सदा', en: 'always' }, { w: 'श्वः', en: 'tomorrow', tense: 'future' }, { w: 'ह्यः', en: 'yesterday', tense: 'past' },
]
const PAST: WhenId[] = ['kta', 'lan'], FUTURE: WhenId[] = ['lrt']
const PRON_SLUG = { u: 'asmad-m', m: 'yuzmad-m', r: { m: 'Bavat-m', f: 'BavatI-f' }, p: { m: 'tad-m', f: 'tad-f' } } as const

type V = DhatuLite
type Part = { text: string; stem?: string; end?: string; why: string; role: string }

export function BuilderClient({ nouns, verbs, pronouns }: { nouns: NounLite[]; verbs: V[]; pronouns: Record<string, string[]> }) {
  const { subj, when, sc, tr, t, lang } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const [verb, setVerb] = useState(verbs.find((v) => v.slug === '01.0381')?.slug || verbs[0]?.slug)
  const [pick, setPick] = useState<Record<Slot, string>>({ object: 'pustaka-n', place: 'gfha-n', with: '', for: '', from: '' })
  const [objNum, setObjNum] = useState<Num>(0)
  const [time, setTime] = useState('')
  const [voice, setVoice] = useState<'kartari' | 'karmani'>('kartari')
  const byslug = useMemo(() => new Map(nouns.map((n) => [n.slug, n])), [nouns])
  const v = verbs.find((x) => x.slug === verb)
  const W = WHENS.find((x) => x.id === when)!

  const result = useMemo(() => {
    if (!v) return null
    const parts: Part[] = []
    const passive = voice === 'karmani'
    const obj = pick.object ? byslug.get(pick.object) : undefined
    // doer
    const ps = PRON_SLUG[subj.per]
    const slug = typeof ps === 'string' ? ps : ps[subj.gen]
    if (passive) parts.push({ text: pronouns[slug]?.[subj.num] || subj.sk, why: t('b.wDoerP'), role: 'doer' })
    else parts.push({ text: subj.sk, why: t('b.wDoer'), role: 'doer' })
    const t0 = TIMES.find((x) => x.w === time)
    if (t0) parts.push({ text: t0.w, why: t('b.wTime'), role: 'time' })
    for (const s of ['from', 'place', 'with', 'for'] as Slot[]) {
      const n = pick[s] ? byslug.get(pick[s]) : undefined
      const f = n?.forms?.[CASE[s]]?.[0]?.[0]
      if (n && f) {
        parts.push({ text: f, why: t(({ place: 'b.wPlace', with: 'b.wWith', for: 'b.wFor', from: 'b.wFrom' } as const)[s as Exclude<Slot, 'object'>]), role: s })
        if (s === 'with') parts.push({ text: 'सह', why: '', role: 'with' })
      }
    }
    if (obj) {
      const f = obj.forms?.[passive ? 0 : 1]?.[objNum]?.[0]
      if (f) parts.push({ text: f, why: t(passive ? 'b.wObjP' : 'b.wObj'), role: 'object' })
    }
    // verb
    const view = passive ? familyView(v, 'mula', 'karmani', v.derived) : v
    const agree = passive ? subject('p', obj ? objNum : 0, 'm') : subj
    const vw = when === 'kta' && passive ? 'lan' : when
    const cell = view ? cellFor(view, vw, agree) : null
    if (!cell) return { parts, missing: true as const }
    const whoLabel = passive ? (obj ? toScript(obj.forms?.[0]?.[objNum]?.[0] || '', sc) : '—') : subjectLabel(lang, subj)
    parts.push({ text: cell.form, stem: cell.stem, end: cell.end, why: t('b.wVerb', { when: `${toScript(W.name, sc)} (${t(`when.${W.id}`)})`, who: whoLabel }), role: 'verb' })
    const joined = joinWords(parts.map((p) => p.text))
    joined.forEach((j, i) => { if (parts[i].role !== 'verb') parts[i] = { ...parts[i], text: j } })
    const clash = t0?.tense === 'past' && !PAST.includes(when) ? 'past' : t0?.tense === 'future' && !FUTURE.includes(when) ? 'future' : null
    return { parts, missing: false as const, clash }
  }, [v, voice, pick, objNum, time, subj, when, byslug, pronouns, t, lang, sc, W])

  const sentenceText = result ? result.parts.map((p) => p.text).join(' ') + '।' : ''
  const groups = useMemo(() => {
    const cats = [...new Set(nouns.map((n) => n.cat))]
    return cats.map((c) => ({ c, list: nouns.filter((n) => n.cat === c) }))
  }, [nouns])
  const sel = 'h-12 w-full min-w-0 rounded-2xl border border-ink/25 bg-paper px-3 text-[16px]'
  const nounSelect = (s: Slot) => (
    <select id={`b-${s}`} value={pick[s]} onChange={(e) => setPick((p) => ({ ...p, [s]: e.target.value }))} className={sel} style={{ fontFamily: `var(--font-sans), ${font}` }}>
      <option value="">{t('b.none')}</option>
      {groups.map((g) => (
        <optgroup key={g.c} label={t(`cat.${g.c}` as UIKey)}>
          {g.list.map((n) => <option key={n.slug} value={n.slug}>{toScript(n.forms?.[CASE[s]]?.[0]?.[0] || n.nom, sc)} · {nounMeaning(lang, n)}</option>)}
        </optgroup>
      ))}
    </select>
  )
  function surprise() {
    const r = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
    setVerb(r(verbs).slug)
    const places = nouns.filter((n) => n.cat === 'place' || n.cat === 'home')
    setPick({ object: r(nouns.filter((n) => ['food', 'study', 'home'].includes(n.cat))).slug, place: Math.random() < 0.6 ? r(places).slug : '', with: Math.random() < 0.3 ? r(nouns.filter((n) => n.cat === 'family')).slug : '', for: '', from: '' })
    setTime(Math.random() < 0.4 ? r(TIMES.filter((x) => !x.tense)).w : '')
  }
  const field = (id: string, label: string, el: React.ReactNode) => (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">{label}</label>{el}
    </div>
  )
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-8 pt-[clamp(24px,4vw,56px)] pb-[72px] outline-none">
        <div className="flex max-w-[820px] flex-col gap-3.5">
          <span className="eyebrow" style={{ color: deep }}>{t('b.eyebrow')}</span>
          <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('b.h1')}</h1>
          <p className="m-0 text-lg leading-relaxed">{t('b.p')}</p>
        </div>

        <section aria-live="polite" aria-label={t('b.eyebrow')} className="flex min-w-0 flex-col gap-3 rounded-[28px] border border-ink/12 bg-paper p-[clamp(20px,3vw,40px)]">
          {result && (
            <>
              <p lang="sa" className="m-0 text-[clamp(30px,4vw,56px)] leading-[1.55] font-semibold" style={{ fontFamily: font }}>
                {result.parts.map((p, i) => {
                  const color = undefined
                  if (p.role === 'verb' && p.stem !== undefined) { const [s, e] = splitScript(p.stem, p.end || '', sc); return <span key={i}>{s}<span style={{ color: deep }}>{e}</span>। </span> }
                  return <span key={i} style={{ color: p.role === 'doer' ? deep : color }}>{toScript(p.text, sc)} </span>
                })}
              </p>
              {tr && <p className="m-0 text-[16px] italic opacity-80">{iast(sentenceText)}</p>}
              <div className="flex flex-wrap items-center gap-2">
                <Speak text={sentenceText} />
                <ShareButton t={sentenceText} s={v ? meaningOf(v, 'en', 'deva').main : ''} k={`${W.name} · ${t(`when.${W.id}`)}`} />
                <span className="flex-1" />
                <button type="button" onClick={surprise} className="pill min-h-10 rounded-full border border-ink/25 px-4 text-[14px] font-semibold">{t('b.random')}</button>
              </div>
              {result.missing && <p className="m-0 text-[15px] italic">{t('b.noPassive')}</p>}
              {!result.missing && result.clash && <p className="m-0 rounded-2xl px-4 py-2.5 text-[15px]" style={{ background: TINT.m }}>{t('b.tense', { t: t(result.clash === 'past' ? 'b.past' : 'b.future'), when: `${toScript(W.name, sc)} (${t(`when.${W.id}`)})` })}</p>}
              <details className="mt-1" open>
                <summary className="cursor-pointer text-[15px] font-semibold">{t('b.why')}</summary>
                <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                  {result.parts.filter((p) => p.why).map((p, i) => (
                    <li key={i} className="flex flex-wrap items-baseline gap-x-3 text-[15px]">
                      <span lang="sa" className="min-w-[110px] text-[20px] font-bold" style={{ fontFamily: font }}>{toScript(p.text, sc)}</span>
                      <span>{p.why}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </section>

        <section aria-label={t('b.verb')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {field('b-verb', t('b.verb'), (
            <select id="b-verb" value={verb} onChange={(e) => setVerb(e.target.value)} className={sel} style={{ fontFamily: `var(--font-sans), ${font}` }}>
              {verbs.map((x) => <option key={x.slug} value={x.slug}>{toScript(x.display, sc)} · {meaningOf(x, lang, sc).main}</option>)}
            </select>
          ))}
          {field('b-object', t('b.object'), nounSelect('object'))}
          <div className="flex min-w-0 flex-col gap-1.5">
            <span id="b-objnum" className="text-[13px] font-semibold">{t('b.objNum')}</span>
            <div role="group" aria-labelledby="b-objnum" className="seg self-start">
              {([0, 1, 2] as Num[]).map((n) => <button key={n} type="button" aria-pressed={objNum === n} onClick={() => setObjNum(n)} className={cn('pill min-h-10 rounded-full px-4 text-[14px] font-semibold', objNum === n && 'bg-ink text-stone')}>{t(`n.${['sg', 'du', 'pl'][n]}` as UIKey)}</button>)}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span id="b-voice" className="text-[13px] font-semibold">{t('b.voice')}</span>
            <div role="group" aria-labelledby="b-voice" className="flex flex-col gap-1">
              {(['kartari', 'karmani'] as const).map((k) => (
                <button key={k} type="button" aria-pressed={voice === k} onClick={() => setVoice(k)} className={cn('pill min-h-10 rounded-2xl border border-ink/20 px-3 text-left text-[13px] font-semibold', voice === k && 'bg-ink text-stone')}>
                  <span style={{ fontFamily: font }}>{toScript(k === 'kartari' ? 'कर्तरि' : 'कर्मणि', sc)}</span> · {t(k === 'kartari' ? 'b.active' : 'b.passive')}
                </button>
              ))}
            </div>
          </div>
          {field('b-place', t('b.place'), nounSelect('place'))}
          {field('b-with', t('b.with'), nounSelect('with'))}
          {field('b-for', t('b.for'), nounSelect('for'))}
          {field('b-from', t('b.from'), nounSelect('from'))}
          {field('b-time', t('b.time'), (
            <select id="b-time" value={time} onChange={(e) => setTime(e.target.value)} className={sel} style={{ fontFamily: `var(--font-sans), ${font}` }}>
              <option value="">{t('b.none')}</option>
              {TIMES.map((x) => <option key={x.w} value={x.w}>{toScript(x.w, sc)} · {x.en}</option>)}
            </select>
          ))}
          <div className="flex items-end">
            <button type="button" onClick={() => { setPick({ object: '', place: '', with: '', for: '', from: '' }); setTime(''); setVoice('kartari'); setObjNum(0) }} className="pill min-h-12 rounded-full border border-ink/25 px-5 text-[14px] font-semibold">{t('b.reset')}</button>
          </div>
        </section>
      </main>
      <Footer />
      <Dock />
    </>
  )
}
