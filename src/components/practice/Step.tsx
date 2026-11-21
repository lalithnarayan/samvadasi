'use client'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toScript } from '@/lib/grammar'
import type { UIKey } from '@/lib/i18n'
import { PRON, type Ex } from '@/lib/practice'
import { cn } from '@/lib/utils'
import { DEEP, useSamvada } from '@/components/samvada/state'
import { Speak } from '@/components/samvada/Speak'
import { ChoiceButton, choiceState } from './ui'

type Kind = Ex['kind']
type ChoiceEx = Extract<Ex, { options: string[]; answer: number }> | Extract<Ex, { kind: 'spot' }>
/** What an exercise renderer gets: the exercise, whether it is answered, and how to answer it. */
type Ctx<E extends Ex = Ex> = { ex: E; done: boolean | null; finish: (right: boolean, ids: string[]) => void; sk: (s: string) => string; font: string; mean: (m: string[]) => string }

/**
 * The question line for each kind of exercise. Adding a kind means one entry here, one builder
 * in lib/practice.ts and, if it is not multiple choice, one renderer below.
 */
const QUESTION: Record<Kind, UIKey> = {
  meaning: 'td.qMeaning', reverse: 'td.qReverse', listen: 'td.qListen', ending: 'td.qEnding',
  spot: 'td.qSpot', blank: 'td.qBlank', order: 'td.qOrder', match: 'td.qMatch',
}

/** Multiple choice: meaning, reverse, listen, pick the ending, spot the mistake, fill the blank. */
function Choice({ ex, done, finish, sk, font, mean }: Ctx<ChoiceEx>) {
  const { t } = useSamvada()
  const [picked, setPicked] = useState<number | null>(null)
  const options = ex.kind === 'spot' ? ex.lines : ex.options
  const sanskrit = ex.kind !== 'meaning'
  const pick = (i: number) => { if (done !== null) return; setPicked(i); finish(i === ex.answer, [ex.id]) }
  const prompt = (() => {
    switch (ex.kind) {
      case 'meaning': return <div className="flex items-center gap-3"><p lang="sa" className="m-0 text-[clamp(40px,7vw,72px)] leading-[1.3]" style={{ fontFamily: font }}>{sk(ex.word.sa)}</p><Speak text={ex.word.sa} /></div>
      case 'reverse': return <p className="disp m-0 text-[clamp(28px,5vw,48px)] font-extrabold">{mean(ex.word.m)}</p>
      case 'listen': return <div className="origin-left scale-125 self-start"><Speak text={ex.word.sa} /></div>
      case 'ending': return <>
        <p className="m-0 text-lg"><span className="font-semibold">{mean(ex.verb.m)}</span> · <span style={{ fontFamily: font }}>{sk(ex.verb.display)}</span> · {t(ex.tense === 'lat' ? 'when.lat' : 'when.lrt')}</p>
        <p lang="sa" className="m-0 text-[clamp(36px,6vw,60px)] leading-[1.3]" style={{ fontFamily: font }}>{sk(PRON[ex.person])} <span className="opacity-40">____</span></p>
      </>
      case 'spot': return <p className="m-0 text-lg"><span className="font-semibold">{mean(ex.verb.m)}</span> · {t('when.lat')}</p>
      case 'blank': return <p lang="sa" className="m-0 text-[clamp(26px,4.4vw,42px)] leading-[1.5]" style={{ fontFamily: font }}>
        {ex.line.split(/\s+/).map((w, i) => <span key={i}>{i === ex.gap ? <span className="opacity-40">{done === null ? '_____' : sk(w)}</span> : sk(w)} </span>)}
      </p>
    }
  })()
  return <>
    {prompt}
    <div className={cn('grid gap-2.5', ex.kind !== 'spot' && 'sm:grid-cols-2')}>
      {options.map((o, i) => (
        <ChoiceButton key={i} state={choiceState(done !== null, i, ex.answer, picked)} onClick={() => pick(i)} disabled={done !== null}
          lang={sanskrit ? 'sa' : undefined} style={sanskrit ? { fontFamily: font } : undefined}>{sanskrit ? sk(o) : o}</ChoiceButton>
      ))}
    </div>
    {ex.kind === 'listen' && done !== null && <p className="m-0 opacity-80">{mean(ex.word.m)}</p>}
  </>
}

/** Tap the words of a verse line in order; tap a placed word to take it (and the rest) back. */
function Order({ ex, done, finish, sk, font }: Ctx<Extract<Ex, { kind: 'order' }>>) {
  const { t, base } = useSamvada()
  const [built, setBuilt] = useState<number[]>([])
  const target = ex.line.split(/\s+/)
  const tap = (i: number) => {
    if (done !== null || built.includes(i)) return
    const nb = [...built, i]; setBuilt(nb)
    if (nb.length === target.length) finish(nb.map((j) => ex.tokens[j]).join(' ') === target.join(' '), [ex.id])
  }
  return <>
    <div className="flex min-h-[72px] flex-wrap items-center gap-2 rounded-[18px] border-2 border-dashed border-ink/20 bg-paper/60 p-3" lang="sa" style={{ fontFamily: font }}>
      {built.map((j, k) => <button key={k} disabled={done !== null} onClick={() => setBuilt(built.slice(0, k))} className="rounded-full bg-ink px-4 py-2 text-xl text-stone">{sk(ex.tokens[j])}</button>)}
    </div>
    <div className="flex flex-wrap gap-2" lang="sa" style={{ fontFamily: font }}>
      {ex.tokens.map((w, i) => <button key={i} disabled={built.includes(i) || done !== null} onClick={() => tap(i)} className={cn('pill rounded-full border-2 border-ink/20 bg-paper px-4 py-2 text-xl', built.includes(i) && 'opacity-25')}>{sk(w)}</button>)}
    </div>
    <Link href={base + `/subhashita/${ex.verse.slug}`} className="self-start text-sm font-semibold underline-offset-2 hover:underline">{t('sb.read')} ↗</Link>
  </>
}

/** Four Sanskrit words, four meanings in a stable shuffled order; any wrong tap marks the round. */
function Match({ ex, done, finish, sk, font, mean }: Ctx<Extract<Ex, { kind: 'match' }>>) {
  const [left, setLeft] = useState<number | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [miss, setMiss] = useState(false)
  const rightSide = useMemo(() => {
    const h = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
    return [...ex.pairs.keys()].sort((a, b) => h(ex.pairs[a].m[0]) - h(ex.pairs[b].m[0]))
  }, [ex])
  const tapRight = (j: number) => {
    if (left === null || done !== null || matched.includes(j)) return
    if (j !== left) { setMiss(true); setLeft(null); return }
    const m = [...matched, j]; setMatched(m); setLeft(null)
    if (m.length === ex.pairs.length) finish(!miss, ex.ids)
  }
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="flex flex-col gap-2.5">
        {ex.pairs.map((w, i) => <button key={i} disabled={matched.includes(i)} onClick={() => setLeft(i)} aria-pressed={left === i} lang="sa" style={{ fontFamily: font }}
          className={cn('pill min-h-[56px] rounded-[16px] border-2 bg-paper px-4 text-xl', left === i ? 'border-ink' : 'border-ink/15', matched.includes(i) && 'opacity-30')}>{sk(w.sa)}</button>)}
      </div>
      <div className="flex flex-col gap-2.5">
        {rightSide.map((j) => <button key={j} disabled={matched.includes(j)} onClick={() => tapRight(j)}
          className={cn('pill min-h-[56px] rounded-[16px] border-2 border-ink/15 bg-paper px-4 text-left text-[16px] font-semibold', matched.includes(j) && 'opacity-30')}>{mean(ex.pairs[j].m)}</button>)}
      </div>
    </div>
  )
}

/** The text shown after a wrong answer. */
function answerOf(ex: Ex, sk: (s: string) => string): string {
  switch (ex.kind) {
    case 'meaning': return ex.options[ex.answer]
    case 'spot': return `${sk(PRON[ex.answer])} ${sk(ex.verb.lat[ex.answer])}`
    case 'order': return sk(ex.line)
    case 'match': return ''
    default: return sk(ex.options[ex.answer])
  }
}

/** One exercise: question, body, then feedback with Next. Calls onAnswer once. */
export function Step({ ex, col, onAnswer, onNext }: { ex: Ex; col: number; onAnswer: (ids: string[], right: boolean) => void; onNext: () => void }) {
  const { sc, t, subj } = useSamvada()
  const [done, setDone] = useState<boolean | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, []) // each new question takes focus, for keyboard and screen readers
  const ctx = {
    done, font: `var(--font-sk-${sc})`, sk: (s: string) => toScript(s, sc), mean: (m: string[]) => m[col] || m[0],
    finish: (right: boolean, ids: string[]) => { if (done !== null) return; setDone(right); onAnswer(ids, right) },
  }
  const body = ex.kind === 'order' ? <Order {...ctx} ex={ex} /> : ex.kind === 'match' ? <Match {...ctx} ex={ex} /> : <Choice {...ctx} ex={ex} />
  return (
    <section aria-live="polite" className="flex flex-col gap-5">
      <h2 ref={heading} tabIndex={-1} className="disp m-0 text-[clamp(22px,3vw,30px)] font-extrabold outline-none">{t(QUESTION[ex.kind])}</h2>
      {body}
      {done !== null && (
        <div className={cn('flex flex-wrap items-center gap-4 rounded-[20px] p-4', done ? 'bg-good/12' : 'bg-bad/10')}>
          <p className="m-0 flex-1 text-lg font-semibold">
            {done ? <>✓ {t('td.right')}</> : ex.kind === 'match' ? t('td.matchMiss') : <>✗ {t('td.wrong')} <span lang="sa" style={{ fontFamily: ctx.font }}>{answerOf(ex, ctx.sk)}</span></>}
          </p>
          <button autoFocus onClick={onNext} className="pill min-h-12 rounded-full px-7 font-bold text-stone" style={{ background: DEEP[subj.color] }}>{t('td.next')} →</button>
        </div>
      )}
    </section>
  )
}
