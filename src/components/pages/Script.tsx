'use client'
import { useEffect, useMemo, useState } from 'react'
import type { TodayPool } from '@/lib/data'
import { rng } from '@/lib/practice'
import { LEVELS, MAX_LEVEL, coverage, mix, own, quizItems } from '@/lib/scriptTrainer'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'
import { DEEP, useSamvada } from '@/components/samvada/state'
import { Shell } from './Today'

const KEY = 'samvada:script:v1'
const COL = { en: 0, te: 1, kn: 2, ta: 3 } as const
const PASS = 7, QN = 8

export function ScriptClient({ pool }: { pool: TodayPool }) {
  const { t, lang, sc, subj } = useSamvada()
  const col = COL[lang]
  const ownFont = sc === 'deva' ? undefined : `var(--font-sk-${sc})`
  const [level, setLevel] = useState(0)
  const [reveal, setReveal] = useState(false)
  const [quiz, setQuiz] = useState(false)
  useEffect(() => { try { const n = Number(localStorage.getItem(KEY)); if (n >= 0 && n <= MAX_LEVEL) setLevel(n) } catch {} }, [])
  const keep = (n: number) => { setLevel(n); try { localStorage.setItem(KEY, String(n)) } catch {} }

  // what to read: greetings and short words, then two verse lines
  const passage = useMemo(() => {
    const words = pool.words.filter((w) => w.tag === 'greet' || w.tag?.startsWith('pack:')).slice(0, 10).map((w) => w.sa)
    const vod = pool.verses.find((v) => v.slug === pool.verseOfDay) || pool.verses[0]
    return [...words, ...(vod ? vod.lines.slice(0, 2) : [])]
  }, [pool])
  const cov = Math.round(coverage(passage.join(' '), level) * 100)
  const nextL = LEVELS[level]
  const yourScript = t(sc === 'deva' ? 'sc.roman' : 'sc.yours')

  if (quiz && nextL) return <Shell><Quiz level={level + 1} onPass={() => { keep(level + 1); setQuiz(false); track('script_level', { level: level + 1 }) }} onQuit={() => setQuiz(false)} /></Shell>

  return (
    <Shell>
      <div className="flex flex-col gap-2">
        <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('sc.eyebrow')}</span>
        <h1 className="disp m-0 text-[clamp(34px,5.5vw,60px)] leading-[1.05] font-extrabold">{t('sc.h1')}</h1>
        <p className="m-0 max-w-[62ch] text-lg opacity-85">{t('sc.lead', { s: yourScript })}</p>
      </div>

      <div role="group" aria-label={t('sc.levels')} className="flex flex-wrap gap-1.5">
        {Array.from({ length: MAX_LEVEL + 1 }, (_, i) => (
          <button key={i} onClick={() => keep(i)} aria-pressed={i === level} title={i ? LEVELS[i - 1].name[col] || LEVELS[i - 1].name[0] : t('sc.none')}
            className={cn('pill min-h-11 min-w-11 rounded-full border text-sm font-bold', i === level ? 'border-transparent text-stone' : i < level ? 'border-ink/30' : 'border-ink/12 opacity-60')}
            style={i === level ? { background: DEEP[subj.color] } : undefined}>{i}</button>
        ))}
      </div>
      <p className="m-0 text-[15px]"><b>{t('sc.level', { n: level })}</b> · {level ? LEVELS[level - 1].name[col] || LEVELS[level - 1].name[0] : t('sc.none')} · {t('sc.cover', { p: cov })}</p>

      <section aria-labelledby="sc-read" className="flex flex-col gap-3 rounded-[24px] bg-paper p-[clamp(18px,3vw,28px)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="sc-read" className="disp m-0 text-[22px] font-extrabold">{t('sc.read')}</h2>
          <button onClick={() => setReveal(!reveal)} aria-pressed={reveal} className="pill min-h-10 rounded-full border border-ink/25 px-4 text-sm font-semibold">{reveal ? t('sc.hide') : t('sc.check', { s: yourScript })}</button>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {passage.map((x, i) => (
            <li key={i} className="flex flex-col">
              <span lang="sa" className="text-[clamp(22px,3.4vw,32px)] leading-[1.5]">
                {mix(x, level, sc).map((p, k) => <span key={k} style={{ fontFamily: p.deva ? 'var(--font-sk-deva)' : ownFont, color: p.deva ? undefined : DEEP[subj.color] }}>{p.text}</span>)}
              </span>
              {reveal && <span className="text-[15px] opacity-75" style={{ fontFamily: ownFont }}>{own(x, sc)}</span>}
            </li>
          ))}
        </ul>
        <p className="m-0 text-[13px] opacity-70">{t('sc.key', { s: yourScript })}</p>
      </section>

      {nextL ? (
        <section aria-labelledby="sc-next" className="flex flex-col gap-3">
          <h2 id="sc-next" className="disp m-0 text-[22px] font-extrabold">{t('sc.next')}: {nextL.name[col] || nextL.name[0]}</h2>
          <div className="flex flex-wrap gap-2">
            {nextL.letters.filter((c) => !/[ा-्ंःँ]/.test(c)).map((c) => (
              <span key={c} className="flex min-w-[64px] flex-col items-center rounded-[16px] bg-paper px-3 py-2">
                <span lang="sa" className="text-[34px] leading-[1.3]" style={{ fontFamily: 'var(--font-sk-deva)' }}>{c}</span>
                <span className="text-[17px] opacity-80" style={{ fontFamily: ownFont }}>{own(c, sc)}</span>
              </span>
            ))}
          </div>
          <button onClick={() => setQuiz(true)} className="pill disp min-h-[58px] self-start rounded-full bg-ink px-8 text-lg font-bold text-stone">{t('sc.learn')} →</button>
        </section>
      ) : <p className="m-0 text-lg font-semibold">{t('sc.all')}</p>}
    </Shell>
  )
}

/** Eight questions on the new letters (with earlier ones mixed in); seven right moves you up a level. */
function Quiz({ level, onPass, onQuit }: { level: number; onPass: () => void; onQuit: () => void }) {
  const { t, sc, subj } = useSamvada()
  const ownFont = sc === 'deva' ? undefined : `var(--font-sk-${sc})`
  const qs = useMemo(() => {
    const r = rng(Date.now() % 1e9)
    const fresh = quizItems(level), old = Array.from({ length: level - 1 }, (_, i) => quizItems(i + 1)).flat()
    const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]
    return Array.from({ length: QN }, (_, i) => {
      const syl = i < 6 || !old.length ? pick(fresh) : pick(old)
      const pool = [...new Set([...fresh, ...old].filter((x) => own(x, sc) !== own(syl, sc)))]
      const opts = [syl, ...pool.sort(() => r() - 0.5).slice(0, 3)].sort(() => r() - 0.5)
      return { syl, opts, answer: opts.indexOf(syl) }
    })
  }, [level, sc])
  const [i, setI] = useState(0)
  const [right, setRight] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const q = qs[i], done = i >= qs.length
  if (done) {
    const ok = right >= PASS
    return (
      <div className="flex flex-col gap-4 rounded-[26px] bg-paper p-6">
        <p className="disp m-0 text-[40px] font-extrabold">{t('td.summary', { r: right, n: QN })}</p>
        <p className="m-0 text-lg">{ok ? t('sc.passed', { n: level }) : t('sc.again', { n: PASS })}</p>
        <div className="flex gap-3">
          {ok ? <button onClick={onPass} className="pill min-h-12 rounded-full px-6 font-bold text-stone" style={{ background: DEEP[subj.color] }}>{t('sc.up', { n: level })} →</button>
            : <button onClick={() => { setI(0); setRight(0); setPicked(null) }} className="pill min-h-12 rounded-full bg-ink px-6 font-bold text-stone">{t('td.again')}</button>}
          <button onClick={onQuit} className="pill min-h-12 rounded-full border border-ink/30 px-6 font-semibold">{t('td.quit')}</button>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="flex items-center gap-3">
        <button onClick={onQuit} className="pill min-h-10 rounded-full border border-ink/25 px-4 text-sm font-semibold">{t('td.quit')}</button>
        <span className="flex-1 text-sm font-semibold">{t('sc.qTitle')}</span>
        <span className="text-sm font-semibold">{t('td.progress', { i: i + 1, n: QN })}</span>
      </div>
      <p lang="sa" className="m-0 text-center text-[clamp(72px,14vw,140px)] leading-[1.3]" style={{ fontFamily: 'var(--font-sk-deva)' }}>{q.syl}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {q.opts.map((o, k) => (
          <button key={k} disabled={picked !== null} onClick={() => { setPicked(k); if (k === q.answer) setRight((n) => n + 1) }}
            className={cn('pill min-h-[64px] rounded-[18px] border-2 bg-paper text-[28px]', picked === null ? 'border-ink/15' : k === q.answer ? 'border-[#2F7D4F]' : k === picked ? 'border-[#B3412E]' : 'border-ink/10 opacity-50')}
            style={{ fontFamily: ownFont }}>{own(o, sc)}</button>
        ))}
      </div>
      {picked !== null && <button autoFocus onClick={() => { setI(i + 1); setPicked(null) }} className="pill min-h-12 self-end rounded-full px-7 font-bold text-stone" style={{ background: DEEP[subj.color] }}>{t('td.next')} →</button>}
    </>
  )
}
