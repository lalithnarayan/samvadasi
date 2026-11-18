'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toScript } from '@/lib/grammar'
import type { TodayPool } from '@/lib/data'
import { buildSession, dueCount, finishDay, freezeReady, grade, learnedCount, liveStreak, load, PRON, save, today, type Ex, type Store } from '@/lib/practice'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'

const COL = { en: 0, te: 1, kn: 2, ta: 3 } as const
const clean = (s: string) => s.replace(/[।॥|?]/g, ' ').replace(/\s+/g, ' ').trim()

export function TodayClient({ pool }: { pool: TodayPool }) {
  const { t, lang, subj } = useSamvada()
  const col = COL[lang]
  const [store, setStore] = useState<Store | null>(null)
  const audio = useAudioSet()
  const [session, setSession] = useState<Ex[] | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  useEffect(() => { setStore(openStore()) }, [])

  const start = () => {
    if (!store || !audio) return
    const ex = buildSession(pool, store, col, Date.now() % 1e9, (sa) => audio.has(clean(sa)))
    if (!store.last && !store.days.length) track('first_practice')
    setSession(ex); setResult(null)
  }

  if (!store) return <Shell><p className="opacity-70">…</p></Shell>
  if (session && result) return <Shell><Summary store={store} result={result} onAgain={start} /></Shell>
  if (session) return <Shell><Runner session={session} store={store} setStore={setStore} onDone={setResult} onQuit={() => setSession(null)} /></Shell>

  // ── home ──
  const streak = liveStreak(store), d = today()
  const monday = d - ((d + 3) % 7)
  const due = dueCount(store), doneToday = store.last === d
  return (
    <Shell>
      <div className="flex flex-col gap-2">
        <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('td.title')}</span>
        <h1 className="disp m-0 text-[clamp(36px,6vw,64px)] leading-[1.05] font-extrabold">{doneToday ? t('td.doneToday') : t('td.lead')}</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat big={String(streak)} label={t('td.streakLabel')} sub={t('td.best', { n: store.best })} />
        <Stat big={String(due)} label={t('td.dueLabel')} sub={t('td.learned', { n: learnedCount(store) })} />
        <div className="flex flex-col gap-2 rounded-[22px] bg-paper p-5">
          <span className="text-sm font-semibold opacity-80">{t('td.week')}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, i) => monday + i).map((x) => (
              <span key={x} aria-label={store.days.includes(x) ? '✓' : ''} className={cn('h-8 flex-1 rounded-lg border', store.days.includes(x) ? 'border-transparent' : 'border-ink/15', x === d && 'ring-2 ring-ink/40')} style={store.days.includes(x) ? { background: DEEP[subj.color] } : undefined} />
            ))}
          </div>
          <span className="text-[13px] opacity-75">{freezeReady(store) ? t('td.freeze') : t('td.freezeUsed')}</span>
        </div>
      </div>
      <button onClick={start} disabled={!audio} className="pill disp min-h-[64px] self-start rounded-full bg-ink px-10 text-xl font-bold text-stone disabled:opacity-60">
        {doneToday ? t('td.again') : t('td.start')} →
      </button>
      <p className="m-0 max-w-[60ch] text-[15px] opacity-80">{t('td.how')}</p>
    </Shell>
  )
}

export type Result = { froze: boolean; score: number; of: number }

/** Load the store and report a day-2 return once. */
export function openStore(): Store {
  const s = load()
  if (s.first && today() === s.first + 1 && !s.returned) { track('day2_return'); const n = { ...s, returned: true }; save(n); return n }
  return s
}

/** The set of texts that have a voice clip (for listen-and-choose). null while loading. */
export function useAudioSet() {
  const [audio, setAudio] = useState<Set<string> | null>(null)
  useEffect(() => {
    let done = false
    const stop = setTimeout(() => { if (!done) setAudio(new Set()) }, 2500)
    fetch('/audio-index').then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((x: Record<string, unknown>) => { done = true; clearTimeout(stop); setAudio(new Set(Object.keys(x))) })
    return () => clearTimeout(stop)
  }, [])
  return audio
}
export const audioTest = (audio: Set<string>) => (sa: string) => audio.has(clean(sa))

/** Steps through a session, grading as it goes; finishing counts the day for the streak. */
export function Runner({ session, store, setStore, onDone, onQuit, unit }: { session: Ex[]; store: Store; setStore: (s: Store) => void; onDone: (r: Result) => void; onQuit: () => void; unit?: number }) {
  const { t, lang, subj } = useSamvada()
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [cur, setCur] = useState(store)
  const answer = (ids: string[], right: boolean) => {
    let s = cur
    for (const id of ids) s = grade(s, id, right)
    setCur(s); setStore(s); save(s)
    if (right) setScore((n) => n + 1)
  }
  const next = () => {
    if (step + 1 < session.length) { setStep(step + 1); return }
    const { store: s, froze } = finishDay(cur)
    setStore(s); save(s)
    track('session_done', { streak: s.streak, right: score, of: session.length, ...(unit ? { unit } : {}) })
    if (s.streak === 7) track('streak_7')
    onDone({ froze, score, of: session.length })
  }
  if (!session.length) return <p className="m-0 text-lg">{t('pa.empty')}</p>
  const ex = session[step]
  return (
    <>
      <div className="flex items-center gap-3">
        <button onClick={onQuit} className="pill min-h-10 rounded-full border border-ink/25 px-4 text-sm font-semibold">{t('td.quit')}</button>
        <div aria-hidden className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${session.length}, minmax(0,1fr))` }}>
          {session.map((_, i) => <span key={i} className="h-1.5 rounded-sm" style={{ background: i < step ? 'var(--color-ink)' : i === step ? DEEP[subj.color] : 'rgb(36 33 29 / .15)' }} />)}
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">{t('td.progress', { i: step + 1, n: session.length })}</span>
      </div>
      <Step key={step} ex={ex} col={COL[lang]} onAnswer={answer} onNext={next} />
    </>
  )
}

export function Summary({ store, result, onAgain, extra }: { store: Store; result: Result; onAgain: () => void; extra?: React.ReactNode }) {
  const { t, subj, base, query } = useSamvada()
  const learned = learnedCount(store)
  return (
    <div className="flex flex-col gap-5 rounded-[28px] bg-paper p-[clamp(22px,4vw,40px)]">
      <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('td.doneToday')}</span>
      <p className="disp m-0 text-[clamp(44px,8vw,88px)] leading-none font-extrabold">{t('td.streak', { n: store.streak })}</p>
      <p className="m-0 text-lg">{t('td.summary', { r: result.score, n: result.of })} · {t('td.learned', { n: learned })}{result.froze ? ` · ${t('td.froze')}` : ''}</p>
      {extra}
      <p className="m-0 opacity-80">{t('td.comeBack')}</p>
      <div className="flex flex-wrap gap-3">
        <ShareButton t={`${store.streak} दिनानि`} s={t('td.shareLine', { n: store.streak, w: learned })} k="samvada.si/today" />
        <button onClick={onAgain} className="pill min-h-12 rounded-full border border-ink/30 px-6 font-semibold">{t('td.again')}</button>
        <Link href={base + '/path' + query} className="pill flex min-h-12 items-center rounded-full border border-ink/30 px-6 font-semibold no-underline">{t('nav.path')}</Link>
      </div>
    </div>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { subj } = useSamvada()
  return (
    <div className="min-h-screen transition-colors duration-700" style={{ background: TINT[subj.color] }}>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap outline-none pt-[clamp(20px,3vw,40px)] pb-[72px]">
        <div className="mx-auto flex max-w-[760px] flex-col gap-6">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

function Stat({ big, label, sub }: { big: string; label: string; sub: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[22px] bg-paper p-5">
      <span className="disp text-[44px] leading-none font-extrabold">{big}</span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[13px] opacity-75">{sub}</span>
    </div>
  )
}

/** One exercise. Calls onAnswer once (ids graded right/wrong), then onNext. */
export function Step({ ex, col, onAnswer, onNext }: { ex: Ex; col: number; onAnswer: (ids: string[], right: boolean) => void; onNext: () => void }) {
  const { sc, t, subj, base } = useSamvada()
  const font = `var(--font-sk-${sc})`
  const sk = (s: string) => toScript(s, sc)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState<null | boolean>(null)
  // order
  const [built, setBuilt] = useState<number[]>([])
  // match
  const [left, setLeft] = useState<number | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [miss, setMiss] = useState(false)
  const rightSide = useMemo(() => { if (ex.kind !== 'match') return []; const h = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); return [...ex.pairs.keys()].sort((a, b) => h(ex.pairs[a].m[0] + ex.pairs[b].sa) - h(ex.pairs[b].m[0] + ex.pairs[a].sa)) }, [ex])

  const finish = (right: boolean, ids: string[]) => { if (done !== null) return; setDone(right); onAnswer(ids, right) }
  const pick = (i: number, answer: number, id: string) => { if (done !== null) return; setPicked(i); finish(i === answer, [id]) }

  const opt = (label: React.ReactNode, i: number, answer: number, id: string, sanskrit: boolean) => (
    <button key={i} onClick={() => pick(i, answer, id)} disabled={done !== null}
      className={cn('pill flex min-h-[58px] items-center rounded-[18px] border-2 bg-paper px-5 text-left text-lg font-semibold',
        done === null ? 'border-ink/15' : i === answer ? 'border-[var(--color-good,#2F7D4F)]' : i === picked ? 'border-[var(--color-bad,#B3412E)]' : 'border-ink/10 opacity-60')}
      style={sanskrit ? { fontFamily: font } : undefined} lang={sanskrit ? 'sa' : undefined}>
      {label}
    </button>
  )
  const mean = (m: string[]) => m[col] || m[0]

  let q = '', body: React.ReactNode = null, answerText = ''
  if (ex.kind === 'meaning') {
    q = t('td.qMeaning'); answerText = ex.options[ex.answer]
    body = <>
      <div className="flex items-center gap-3"><p lang="sa" className="m-0 text-[clamp(40px,7vw,72px)] leading-[1.3]" style={{ fontFamily: font }}>{sk(ex.word.sa)}</p><Speak text={ex.word.sa} /></div>
      <div className="grid gap-2.5 sm:grid-cols-2">{ex.options.map((o, i) => opt(o, i, ex.answer, ex.id, false))}</div>
    </>
  } else if (ex.kind === 'reverse' || ex.kind === 'listen') {
    q = ex.kind === 'reverse' ? t('td.qReverse') : t('td.qListen'); answerText = sk(ex.options[ex.answer])
    body = <>
      {ex.kind === 'reverse' ? <p className="disp m-0 text-[clamp(28px,5vw,48px)] font-extrabold">{mean(ex.word.m)}</p> : <div className="self-start scale-125 origin-left"><Speak text={ex.word.sa} /></div>}
      <div className="grid gap-2.5 sm:grid-cols-2">{ex.options.map((o, i) => opt(sk(o), i, ex.answer, ex.id, true))}</div>
      {ex.kind === 'listen' && done !== null && <p className="m-0 opacity-80">{mean(ex.word.m)}</p>}
    </>
  } else if (ex.kind === 'ending') {
    q = t('td.qEnding'); answerText = sk(ex.options[ex.answer])
    body = <>
      <p className="m-0 text-lg"><span className="font-semibold">{mean(ex.verb.m)}</span> · <span style={{ fontFamily: font }}>{sk(ex.verb.display)}</span> · {t(ex.tense === 'lat' ? 'when.lat' : 'when.lrt')}</p>
      <p lang="sa" className="m-0 text-[clamp(36px,6vw,60px)] leading-[1.3]" style={{ fontFamily: font }}>{sk(PRON[ex.person])} <span className="opacity-40">____</span></p>
      <div className="grid gap-2.5 sm:grid-cols-2">{ex.options.map((o, i) => opt(sk(o), i, ex.answer, ex.id, true))}</div>
    </>
  } else if (ex.kind === 'spot') {
    q = t('td.qSpot'); const p = ex.answer; answerText = `${sk(PRON[p])} ${sk(ex.verb.lat[p])}`
    body = <>
      <p className="m-0 text-lg"><span className="font-semibold">{mean(ex.verb.m)}</span> · {t('when.lat')}</p>
      <div className="grid gap-2.5">{ex.lines.map((l, i) => opt(sk(l), i, ex.answer, ex.id, true))}</div>
    </>
  } else if (ex.kind === 'blank') {
    q = t('td.qBlank'); answerText = sk(ex.options[ex.answer])
    const toks = ex.line.split(/\s+/)
    body = <>
      <p lang="sa" className="m-0 text-[clamp(26px,4.4vw,42px)] leading-[1.5]" style={{ fontFamily: font }}>{toks.map((w, i) => <span key={i}>{i === ex.gap ? <span className="opacity-40">{done === null ? '_____' : sk(w)}</span> : sk(w)} </span>)}</p>
      <div className="grid gap-2.5 sm:grid-cols-2">{ex.options.map((o, i) => opt(sk(o), i, ex.answer, ex.id, true))}</div>
    </>
  } else if (ex.kind === 'order') {
    q = t('td.qOrder'); answerText = sk(ex.line)
    const target = ex.line.split(/\s+/)
    const tap = (i: number) => {
      if (done !== null || built.includes(i)) return
      const nb = [...built, i]; setBuilt(nb)
      if (nb.length === target.length) finish(nb.map((j) => ex.tokens[j]).join(' ') === target.join(' '), [ex.id])
    }
    body = <>
      <div className="flex min-h-[72px] flex-wrap items-center gap-2 rounded-[18px] border-2 border-dashed border-ink/20 bg-paper/60 p-3" lang="sa" style={{ fontFamily: font }}>
        {built.map((j, k) => <button key={k} disabled={done !== null} onClick={() => setBuilt(built.slice(0, k))} className="rounded-full bg-ink px-4 py-2 text-xl text-stone">{sk(ex.tokens[j])}</button>)}
      </div>
      <div className="flex flex-wrap gap-2" lang="sa" style={{ fontFamily: font }}>
        {ex.tokens.map((w, i) => <button key={i} disabled={built.includes(i) || done !== null} onClick={() => tap(i)} className={cn('pill rounded-full border-2 border-ink/20 bg-paper px-4 py-2 text-xl', built.includes(i) && 'opacity-25')}>{sk(w)}</button>)}
      </div>
      <Link href={base + `/subhashita/${ex.verse.slug}`} className="self-start text-sm font-semibold underline-offset-2 hover:underline">{t('sb.read')} ↗</Link>
    </>
  } else if (ex.kind === 'match') {
    q = t('td.qMatch')
    const tapRight = (j: number) => {
      if (left === null || done !== null || matched.includes(j)) return
      if (j === left) {
        const m = [...matched, j]; setMatched(m); setLeft(null)
        if (m.length === ex.pairs.length) finish(!miss, ex.ids)
      } else { setMiss(true); setLeft(null) }
    }
    body = (
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-2.5">
          {ex.pairs.map((w, i) => <button key={i} disabled={matched.includes(i)} onClick={() => setLeft(i)} lang="sa" style={{ fontFamily: font }}
            className={cn('pill min-h-[56px] rounded-[16px] border-2 bg-paper px-4 text-xl', left === i ? 'border-ink' : 'border-ink/15', matched.includes(i) && 'opacity-30')}>{sk(w.sa)}</button>)}
        </div>
        <div className="flex flex-col gap-2.5">
          {rightSide.map((j) => <button key={j} disabled={matched.includes(j)} onClick={() => tapRight(j)}
            className={cn('pill min-h-[56px] rounded-[16px] border-2 border-ink/15 bg-paper px-4 text-left text-[16px] font-semibold', matched.includes(j) && 'opacity-30')}>{mean(ex.pairs[j].m)}</button>)}
        </div>
      </div>
    )
  }

  return (
    <section aria-live="polite" className="flex flex-col gap-5">
      <h2 className="disp m-0 text-[clamp(22px,3vw,30px)] font-extrabold">{q}</h2>
      {body}
      {done !== null && (
        <div className="flex flex-wrap items-center gap-4 rounded-[20px] p-4" style={{ background: done ? 'rgb(47 125 79 / .12)' : 'rgb(179 65 46 / .1)' }}>
          <p className="m-0 flex-1 text-lg font-semibold">{done ? t('td.right') : ex.kind === 'match' ? t('td.matchMiss') : <>{t('td.wrong')} <span lang="sa" style={{ fontFamily: font }}>{answerText}</span></>}</p>
          <button autoFocus onClick={onNext} className="pill min-h-12 rounded-full px-7 font-bold text-stone" style={{ background: DEEP[subj.color] }}>{t('td.next')} →</button>
        </div>
      )}
    </section>
  )
}
