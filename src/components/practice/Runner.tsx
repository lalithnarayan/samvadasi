'use client'
import { useState } from 'react'
import { langIndex } from '@/lib/i18n'
import { finishDay, grade, save, type Ex, type Store } from '@/lib/practice'
import { track } from '@/lib/track'
import { useSamvada } from '@/components/samvada/state'
import { SessionHeader } from './ui'
import { Step } from './Step'

export type Result = { froze: boolean; score: number; of: number }

/** Steps through a session, saving every grade at once; finishing counts the day for the streak. */
export function Runner({ session, store, onDone, onQuit, unit }: { session: Ex[]; store: Store; onDone: (r: Result) => void; onQuit: () => void; unit?: number }) {
  const { t, lang } = useSamvada()
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [cur, setCur] = useState(store)
  const answer = (ids: string[], right: boolean) => {
    const s = ids.reduce((acc, id) => grade(acc, id, right), cur)
    setCur(s); save(s)
    if (right) setScore((n) => n + 1)
  }
  const next = () => {
    if (step + 1 < session.length) { setStep(step + 1); return }
    const { store: s, froze } = finishDay(cur)
    save(s)
    track('session_done', { streak: s.streak, right: score, of: session.length, ...(unit ? { unit } : {}) })
    if (s.streak === 7) track('streak_7')
    onDone({ froze, score, of: session.length })
  }
  if (!session.length) return <p className="m-0 text-lg">{t('pa.empty')}</p>
  return (
    <>
      <SessionHeader step={step} total={session.length} onQuit={onQuit} />
      <Step key={step} ex={session[step]} col={langIndex(lang)} onAnswer={answer} onNext={next} />
    </>
  )
}
