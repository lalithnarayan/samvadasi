'use client'
import { useEffect, useMemo, useState } from 'react'
import { cellFor, familyView, iast, joinWords, splitScript, subject, toScript, WHENS, type DhatuLite, type Num, type WhenId } from '@/lib/grammar'
import { meaningOf, nounMeaning, subjectLabel, type UIKey } from '@/lib/i18n'
import type { NounLite } from '@/lib/data'
import { cn } from '@/lib/utils'
import { countable, englishSentence, FRAMES, framePlace, nounEn, nounPhrase, POSSESSED, type Frame } from '@/lib/builder'
import { Combo, type ComboOption } from '@/components/samvada/Combo'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Dock } from '@/components/samvada/Dock'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'

type Slot = 'object' | 'place' | 'with' | 'for' | 'from'
const CASE: Record<Slot, number> = { object: 1, place: 6, with: 2, for: 3, from: 4 }
const FALLBACK: Frame = { en: { base: 'do', third: 'does', past: 'did', pp: 'done', ing: 'doing' }, place: true, with: true }
const POSS: Record<string, string[]> = { u: ['my', 'our', 'our'], m: ['your', 'your', 'your'], r: ['your', 'your', 'your'], pm: ['his', 'their', 'their'], pf: ['her', 'their', 'their'] }
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
  const frame: Frame = (verb && FRAMES[verb]) || FALLBACK
  const allowed = useMemo(() => ({
    object: (frame.object || []).filter((x) => byslug.has(x)),
    place: framePlace(frame).filter((x) => byslug.has(x)),
    with: frame.with ? nouns.filter((n) => ['family', 'people'].includes(n.cat)).map((n) => n.slug) : [],
    for: (frame.for || []).filter((x) => byslug.has(x)),
    from: (frame.from || []).filter((x) => byslug.has(x)),
  }) as Record<Slot, string[]>, [frame, byslug, nouns])
  // drop picks that do not fit the chosen verb
  useEffect(() => {
    setPick((p) => {
      const n = { ...p }
      for (const k of Object.keys(n) as Slot[]) if (n[k] && !allowed[k].includes(n[k])) n[k] = ''
      if (!n.object && allowed.object.length) n.object = allowed.object[0]
      return n
    })
    if (!frame.object) setVoice('kartari')
  }, [allowed, frame])
  useEffect(() => { if (pick.object && !countable(pick.object)) setObjNum(0) }, [pick.object])

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
    const poss = POSS[subj.per === 'p' ? 'p' + subj.gen : subj.per][subj.num]
    const np = (slug: string, num: Num = 0) => { const n = byslug.get(slug); return n ? nounPhrase(n.meaning_en || '', num, POSSESSED.has(slug) ? poss : 'the') : '' }
    const english = englishSentence(frame, subj, when, {
      obj: obj ? np(obj.slug, objNum) : undefined, objNum,
      place: pick.place ? np(pick.place) : undefined, with: pick.with ? np(pick.with) : undefined,
      for: pick.for ? np(pick.for) : undefined, from: pick.from ? np(pick.from) : undefined, time: t0?.en,
    }, passive)
    return { parts, missing: false as const, clash, english }
  }, [v, voice, pick, objNum, time, subj, when, byslug, pronouns, t, lang, sc, W, frame])

  const sentenceText = result ? result.parts.map((p) => p.text).join(' ') + '।' : ''
  const groups = useMemo(() => {
    const cats = [...new Set(nouns.map((n) => n.cat))]
    return cats.map((c) => ({ c, list: nouns.filter((n) => n.cat === c) }))
  }, [nouns])
  const sel = 'h-12 w-full min-w-0 rounded-2xl border border-ink/25 bg-paper px-3 text-[16px]'
  const nounOpts = (s: Slot): ComboOption[] => allowed[s].map((slug) => byslug.get(slug)!).filter(Boolean).map((n) => ({
    value: n.slug, label: toScript(n.forms?.[CASE[s]]?.[0]?.[0] || n.nom, sc), sub: nounMeaning(lang, n), group: t(`cat.${n.cat}` as UIKey),
    search: `${n.display} ${iast(n.display)} ${n.meaning_en || ''} ${nounEn(n.meaning_en)}`,
  }))
  const nounSelect = (s: Slot) => (
    <Combo id={`b-${s}`} value={pick[s]} onChange={(v) => setPick((p) => ({ ...p, [s]: v }))} options={nounOpts(s)} placeholder={t('b.search')} none={t('b.none')} empty={t('b.noMatch')} font={font} />
  )
  function surprise() {
    const r = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
    const vv = r(verbs.filter((x) => FRAMES[x.slug] && !['04.0044', '04.0091'].includes(x.slug)))
    const f = FRAMES[vv.slug]
    const ok = (xs: string[] = []) => xs.filter((x) => byslug.has(x))
    const maybe = (xs: string[], p: number) => (xs.length && Math.random() < p ? r(xs) : '')
    setVerb(vv.slug)
    const people = nouns.filter((n) => ['family', 'people'].includes(n.cat)).map((n) => n.slug)
    const ob = maybe(ok(f.object), 0.9)
    setObjNum(ob && countable(ob) && Math.random() > 0.7 ? (Math.random() < 0.5 ? 1 : 2) : 0)
    const needMore = !ob
    setPick({ object: ob, place: maybe(ok(framePlace(f)), needMore ? 0.85 : 0.45), with: f.with ? maybe(people, 0.25) : '', for: maybe(ok(f.for), 0.3), from: maybe(ok(f.from), 0.25) })

    setTime(Math.random() < 0.35 ? r(TIMES.filter((x) => !x.tense)).w : '')
  }
  const wordOf = (role: string) => result?.parts.filter((x) => x.role === role).map((x) => x.text).join(' ')
  const slotCard = (role: string, label: UIKey, caseName: string, el: React.ReactNode, isVerb = false) => (
    <li className="flex min-w-0 flex-col gap-1.5 rounded-[20px] border bg-paper p-3" style={{ borderColor: isVerb ? deep : 'rgb(36 33 29 / .12)' }}>
      <label htmlFor={`b-${role}`} className="text-[12px] font-semibold"><span style={{ fontFamily: font, color: deep }}>{toScript(caseName, sc)}</span> · {t(label)}</label>
      {el}
      {wordOf(role) && <span lang="sa" className="text-[15px] opacity-80" style={{ fontFamily: font }}>→ {toScript(wordOf(role)!, sc)}</span>}
    </li>
  )
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
              {!result.missing && result.english && <p className="disp m-0 text-[clamp(18px,1.8vw,24px)] font-semibold"><span className="sr-only">{t('b.english')}: </span>{result.english}</p>}
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

        <section aria-labelledby="b-strip" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="b-strip" className="disp m-0 text-[clamp(22px,2.4vw,30px)] font-extrabold">{t('b.strip')}</h2>
              <p className="m-0 text-[14px] opacity-80">{t('b.fit')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label={t('b.voice')} className="seg">
                {(['kartari', 'karmani'] as const).map((k) => (
                  <button key={k} type="button" aria-pressed={voice === k} disabled={k === 'karmani' && !frame.object} onClick={() => setVoice(k)} title={t(k === 'kartari' ? 'b.activeHint' : 'b.passiveHint')}
                    className={cn('pill min-h-10 rounded-full px-4 text-[14px] font-semibold disabled:opacity-40', voice === k && 'bg-ink text-stone')}>
                    <span style={{ fontFamily: font }}>{toScript(k === 'kartari' ? 'कर्तरि' : 'कर्मणि', sc)}</span> · {t(k === 'kartari' ? 'b.activeS' : 'b.passiveS')}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setPick({ object: allowed.object[0] || '', place: '', with: '', for: '', from: '' }); setTime(''); setVoice('kartari'); setObjNum(0) }} className="pill min-h-10 rounded-full border border-ink/25 px-4 text-[14px] font-semibold">{t('b.reset')}</button>
            </div>
          </div>
          {!frame.object && <p className="m-0 text-[13px] italic opacity-80">{t('b.noObj')}</p>}
          <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {/* same order as the words of the sentence */}
            <li className="flex min-w-0 flex-col gap-1.5 rounded-[20px] border border-ink/12 bg-paper p-3">
              <span className="text-[12px] font-semibold"><span style={{ fontFamily: font, color: deep }}>{toScript(voice === 'karmani' ? 'तृतीया' : 'प्रथमा', sc)}</span> · {t('b.doer')}</span>
              <span lang="sa" className="text-[22px] font-bold" style={{ fontFamily: font, color: deep }}>{toScript(result?.parts[0]?.text || subj.sk, sc)}</span>
              <span className="text-[12px] opacity-80">{t('b.doerHint')}</span>
            </li>
            {slotCard('time', 'b.time', 'अव्ययम्', (
              <Combo id="b-time" value={time} onChange={setTime} placeholder={t('b.search')} none={t('b.none')} empty={t('b.noMatch')} font={font}
                options={TIMES.map((x) => ({ value: x.w, label: toScript(x.w, sc), sub: x.en, search: iast(x.w) }))} />
            ))}
            {allowed.from.length > 0 && slotCard('from', 'b.from', 'पञ्चमी', nounSelect('from'))}
            {allowed.place.length > 0 && slotCard('place', 'b.place', 'सप्तमी', nounSelect('place'))}
            {allowed.with.length > 0 && slotCard('with', 'b.with', 'तृतीया + सह', nounSelect('with'))}
            {allowed.for.length > 0 && slotCard('for', 'b.for', 'चतुर्थी', nounSelect('for'))}
            {allowed.object.length > 0 && slotCard('object', 'b.object', voice === 'karmani' ? 'प्रथमा' : 'द्वितीया', (
              <>
                {nounSelect('object')}
                {pick.object && countable(pick.object) && (
                  <div role="group" aria-label={t('b.objNum')} className="seg self-start">
                    {([0, 1, 2] as Num[]).map((n) => <button key={n} type="button" aria-pressed={objNum === n} onClick={() => setObjNum(n)} className={cn('pill min-h-9 rounded-full px-3 text-[13px] font-semibold', objNum === n && 'bg-ink text-stone')}>{t(`n.${['sg', 'du', 'pl'][n]}` as UIKey)}</button>)}
                  </div>
                )}
              </>
            ))}
            {slotCard('verb', 'b.verb', 'क्रियापदम्', (
              <Combo id="b-verb" value={verb || ''} onChange={(x) => x && setVerb(x)} placeholder={t('b.search')} empty={t('b.noMatch')} font={font}
                options={verbs.map((x) => ({ value: x.slug, label: toScript(x.display, sc), sub: meaningOf(x, lang, sc).main, search: `${x.display} ${iast(x.root)} ${x.meaning_en || ''}` }))} />
            ), true)}
          </ol>
        </section>
      </main>
      <Footer />
      <Dock />
    </>
  )
}
