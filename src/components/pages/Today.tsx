'use client'
import { useState } from 'react'
import type { TodayPool } from '@/lib/data'
import { langIndex } from '@/lib/i18n'
import { buildSession, dueCount, freezeReady, learnedCount, liveStreak, today, usePracticeStore, type Ex } from '@/lib/practice'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'
import { DEEP, useSamvada } from '@/components/samvada/state'
import { PracticeShell, Runner, Stat, Summary, audioTest, useAudioSet, useDay2Return, type Result } from '@/components/practice'

/** Today: a 5-minute session drawn from everything, with streak, reviews due and this week. */
export function TodayClient({ pool }: { pool: TodayPool }) {
  const { t, lang, subj } = useSamvada()
  const store = usePracticeStore()
  const audio = useAudioSet()
  const [session, setSession] = useState<Ex[] | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  useDay2Return()

  const start = () => {
    if (!store || !audio) return
    if (!store.last && !store.days.length) track('first_practice')
    setSession(buildSession(pool, store, langIndex(lang), Date.now() % 1e9, audioTest(audio))); setResult(null)
  }

  if (!store) return <PracticeShell><TodaySkeleton /></PracticeShell>
  if (session && result) return <PracticeShell><Summary store={store} result={result} onAgain={start} /></PracticeShell>
  if (session) return <PracticeShell><Runner session={session} store={store} onDone={setResult} onQuit={() => setSession(null)} /></PracticeShell>

  const d = today(), monday = d - ((d + 3) % 7), doneToday = store.last === d
  return (
    <PracticeShell>
      <div className="flex flex-col gap-2">
        <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('td.title')}</span>
        <h1 className="disp m-0 text-[clamp(36px,6vw,64px)] leading-[1.05] font-extrabold">{doneToday ? t('td.doneToday') : t('td.lead')}</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat big={String(liveStreak(store))} label={t('td.streakLabel')} sub={t('td.best', { n: store.best })} />
        <Stat big={String(dueCount(store))} label={t('td.dueLabel')} sub={t('td.learned', { n: learnedCount(store) })} />
        <div className="flex flex-col gap-2 rounded-[22px] bg-paper p-5">
          <span className="text-sm font-semibold opacity-80">{t('td.week')}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, i) => monday + i).map((x) => {
              const on = store.days.includes(x)
              return <span key={x} aria-label={on ? '✓' : undefined} className={cn('h-8 flex-1 rounded-lg border', on ? 'border-transparent' : 'border-ink/15', x === d && 'ring-2 ring-ink/40')} style={on ? { background: DEEP[subj.color] } : undefined} />
            })}
          </div>
          <span className="text-[13px] opacity-75">{freezeReady(store) ? t('td.freeze') : t('td.freezeUsed')}</span>
        </div>
      </div>
      <button onClick={start} disabled={!audio} className="pill disp min-h-[64px] self-start rounded-full bg-ink px-10 text-xl font-bold text-stone disabled:opacity-60">
        {doneToday ? t('td.again') : t('td.start')} →
      </button>
      <p className="m-0 max-w-[60ch] text-[15px] opacity-80">{t('td.how')}</p>
    </PracticeShell>
  )
}

/** Same size as the real screen, so nothing jumps when progress loads. */
function TodaySkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-6">
      <div className="h-4 w-40 rounded bg-ink/10" />
      <div className="h-[clamp(72px,12vw,128px)] w-4/5 rounded-2xl bg-ink/10" />
      <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-[120px] rounded-[22px] bg-paper/70" />)}</div>
      <div className="h-[64px] w-44 rounded-full bg-ink/10" />
    </div>
  )
}
