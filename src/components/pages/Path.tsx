'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toScript } from '@/lib/grammar'
import type { TodayPool, TodayWord } from '@/lib/data'
import { buildSession, rng, save, type Ex, type Store } from '@/lib/practice'
import { MASTERED, PLACEMENT_UNITS, SECTIONS, UNITS, mastery, nextUnit, unitPool, type Unit } from '@/lib/path'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { Runner, Shell, Step, Summary, audioTest, openStore, useAudioSet, type Result } from './Today'

const COL = { en: 0, te: 1, kn: 2, ta: 3 } as const
const TONES = ['u', 'm', 'p'] as const

/** A ring that fills with mastery (0–1). */
function Ring({ value, size = 76, tone, children, current }: { value: number; size?: number; tone: 'u' | 'm' | 'p'; children: React.ReactNode; current?: boolean }) {
  const r = size / 2 - 5, c = 2 * Math.PI * r
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg aria-hidden width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill={value >= MASTERED ? DEEP[tone] : 'var(--color-paper)'} stroke="rgb(36 33 29 / .14)" strokeWidth="6" />
        {value > 0 && value < MASTERED && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={DEEP[tone]} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(c * value) / MASTERED} ${c}`} />}
      </svg>
      {current && <span aria-hidden className="absolute -inset-1.5 animate-pulse rounded-full border-2" style={{ borderColor: DEEP[tone] }} />}
      <span className={cn('relative text-center leading-tight', value >= MASTERED && 'text-stone')}>{children}</span>
    </span>
  )
}

export function PathClient({ pool }: { pool: TodayPool }) {
  const { t, lang, sc, base, query, subj } = useSamvada()
  const col = COL[lang], font = `var(--font-sk-${sc})`
  const [store, setStore] = useState<Store | null>(null)
  const [placing, setPlacing] = useState(false)
  useEffect(() => { setStore(openStore()) }, [])
  const m = useMemo(() => Object.fromEntries(UNITS.map((u) => [u.n, store ? mastery(u, pool, store) : 0])), [store, pool])
  if (!store) return <Shell><h1 className="disp m-0 text-[clamp(36px,6vw,64px)] font-extrabold">{t('pa.h1')}</h1></Shell>
  const placed = store.placed || 0
  const next = nextUnit(pool, store, placed)
  const done = UNITS.filter((u) => m[u.n] >= MASTERED || u.n <= placed).length
  const nu = UNITS.find((u) => u.n === next)!
  const fresh = !placed && !Object.keys(store.cards).length

  if (placing) return <Shell><Placement pool={pool} onDone={(n) => { const s = { ...store, placed: n }; save(s); setStore(s); setPlacing(false); track('placement_done', { unit: n }) }} onQuit={() => setPlacing(false)} /></Shell>

  return (
    <Shell>
      <div className="flex flex-col gap-2">
        <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('pa.eyebrow')}</span>
        <h1 className="disp m-0 text-[clamp(36px,6vw,64px)] leading-[1.05] font-extrabold">{t('pa.h1')}</h1>
        <p className="m-0 text-lg opacity-85">{t('pa.lead', { d: done, n: UNITS.length })}</p>
      </div>
      <Link href={base + `/path/${next}` + query} className="lift flex flex-wrap items-center gap-4 rounded-[26px] bg-charcoal p-5 text-chalk no-underline">
        <Ring value={m[next]} tone={TONES[next % 3]} current><span className="text-lg font-bold text-ink">{next}</span></Ring>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm opacity-80">{t('pa.continue')}</span>
          <span className="disp text-2xl font-extrabold">{nu.title[col] || nu.title[0]}</span>
        </span>
        <span className="pill rounded-full bg-chalk px-6 py-3 font-bold text-ink">{t('td.start')} →</span>
      </Link>
      <Link href={base + '/script' + query} className="flex items-center gap-3 rounded-[18px] border border-ink/12 px-5 py-3 text-[15px] no-underline hover:underline">
        <span lang="sa" className="text-2xl" style={{ fontFamily: 'var(--font-sk-deva)' }}>अ</span><span className="flex-1">{t('pa.script')}</span><span aria-hidden>→</span>
      </Link>
      {fresh && (
        <div className="flex flex-wrap items-center gap-4 rounded-[22px] border border-ink/15 bg-paper p-5">
          <p className="m-0 flex-1 text-[15px]">{t('pa.placeAsk')}</p>
          <button onClick={() => setPlacing(true)} className="pill min-h-12 rounded-full border border-ink/30 px-6 font-semibold">{t('pa.placeBtn')}</button>
        </div>
      )}

      {SECTIONS.map((sec, si) => (
        <section key={si} aria-labelledby={`sec-${si}`} className="flex flex-col gap-4">
          <h2 id={`sec-${si}`} className="disp m-0 mt-4 text-[clamp(22px,3vw,30px)] font-extrabold">{t('pa.section', { n: si + 1 })} · {sec.title[col] || sec.title[0]}</h2>
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {sec.units.map((n, k) => {
              const u = UNITS.find((x) => x.n === n)!, v = m[n], tone = TONES[n % 3]
              const tested = n <= placed && v < MASTERED
              return (
                <li key={n} style={{ marginLeft: `${[0, 12, 24, 12][k % 4]}%` }}>
                  <Link href={base + `/path/${n}` + query} className={cn('flex items-center gap-4 rounded-full py-1 pr-5 no-underline', n > next && !tested && v === 0 && 'opacity-60')} aria-current={n === next ? 'step' : undefined}>
                    <Ring value={tested ? 1 : v} tone={tone} current={n === next}><span lang="sa" className="block max-w-[56px] truncate text-[13px] font-semibold" style={{ fontFamily: font }}>{toScript(u.sa, sc)}</span></Ring>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-semibold opacity-70">{t('pa.unit', { n })}{tested ? ` · ${t('pa.tested')}` : v >= MASTERED ? ` · ${t('pa.mastered')}` : v > 0 ? ` · ${Math.round(v * 100)}%` : ''}</span>
                      <span className="disp text-lg font-bold">{u.title[col] || u.title[0]}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
      <p className="m-0 mt-4 max-w-[60ch] text-[14px] opacity-75">{t('pa.how')}</p>
    </Shell>
  )
}

/** Placement: one meaning question from a spread of units; the second miss ends it. */
function Placement({ pool, onDone, onQuit }: { pool: TodayPool; onDone: (unit: number) => void; onQuit: () => void }) {
  const { t, lang } = useSamvada()
  const col = COL[lang]
  const qs = useMemo(() => {
    const r = rng(Date.now() % 1e9)
    const mean = (w: TodayWord) => w.m[col] || w.m[0]
    const all = pool.words.map(mean)
    return PLACEMENT_UNITS.map((n) => {
      const ws = unitPool(UNITS.find((u) => u.n === n)!, pool).words.filter(mean)
      const w = ws[Math.floor(r() * ws.length)]
      if (!w) return null
      const others = [...new Set(all.filter((x) => x && x !== mean(w)))].sort(() => r() - 0.5).slice(0, 3)
      const options = [mean(w), ...others].sort(() => r() - 0.5)
      return { n, ex: { kind: 'meaning', id: w.id, word: w, options, answer: options.indexOf(mean(w)) } as Ex }
    }).filter(Boolean) as { n: number; ex: Ex }[]
  }, [pool, col])
  const [i, setI] = useState(0)
  const [miss, setMiss] = useState(0)
  const [passed, setPassed] = useState(0)
  const [last, setLast] = useState<boolean | null>(null)
  const q = qs[i]
  const next = () => {
    const m2 = miss + (last ? 0 : 1)
    const p2 = last ? q.n : passed // the furthest unit answered right, with at most one miss so far
    if (m2 >= 2 || i + 1 >= qs.length) { onDone(p2); return }
    setMiss(m2); setPassed(p2); setI(i + 1); setLast(null)
  }
  if (!q) return null
  return (
    <>
      <div className="flex items-center gap-3">
        <button onClick={onQuit} className="pill min-h-10 rounded-full border border-ink/25 px-4 text-sm font-semibold">{t('td.quit')}</button>
        <span className="flex-1 text-sm font-semibold">{t('pa.placeTitle')}</span>
        <span className="text-sm font-semibold">{t('td.progress', { i: i + 1, n: qs.length })}</span>
      </div>
      <Step key={i} ex={q.ex} col={col} onAnswer={(_, right) => setLast(right)} onNext={next} />
    </>
  )
}

export function UnitClient({ pool, n }: { pool: TodayPool; n: number }) {
  const { t, lang, sc, base, query, subj } = useSamvada()
  const col = COL[lang], font = `var(--font-sk-${sc})`
  const u = UNITS.find((x) => x.n === n) as Unit
  const up = useMemo(() => unitPool(u, pool), [u, pool])
  const [store, setStore] = useState<Store | null>(null)
  const audio = useAudioSet()
  const [session, setSession] = useState<Ex[] | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  useEffect(() => { setStore(openStore()) }, [])
  const v = store ? mastery(u, pool, store) : 0
  const start = () => {
    if (!store || !audio) return
    if (!store.last && !store.days.length) track('first_practice')
    setSession(buildSession(up, store, col, Date.now() % 1e9, audioTest(audio), { ...u.plan, distract: pool.words })); setResult(null)
  }
  const nu = UNITS.find((x) => x.n === n + 1)
  const tone = TONES[n % 3]
  const mean = (m: string[]) => m[col] || m[0]

  if (store && session && result) return (
    <Shell>
      <Summary store={store} result={result} onAgain={start} extra={
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold">{t('pa.unitMastery', { p: Math.round(v * 100) })}</span>
          {nu && <Link href={base + `/path/${nu.n}` + query} className="pill rounded-full px-5 py-2.5 font-bold text-stone no-underline" style={{ background: DEEP[subj.color] }}>{t('pa.nextUnit')}: {nu.title[col] || nu.title[0]} →</Link>}
        </div>
      } />
    </Shell>
  )
  if (store && session) return <Shell><Runner session={session} store={store} setStore={setStore} onDone={setResult} onQuit={() => setSession(null)} unit={n} /></Shell>

  return (
    <Shell>
      <Link href={base + '/path' + query} className="self-start text-sm font-semibold underline-offset-2 hover:underline">← {t('nav.path')}</Link>
      <div className="flex flex-wrap items-center gap-5">
        <Ring value={v} tone={tone} size={104}><span lang="sa" className="text-lg font-semibold" style={{ fontFamily: font }}>{toScript(u.sa, sc)}</span></Ring>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="eyebrow" style={{ color: DEEP[tone] }}>{t('pa.unit', { n })}</span>
          <h1 className="disp m-0 text-[clamp(32px,5vw,56px)] leading-[1.05] font-extrabold">{u.title[col] || u.title[0]}</h1>
          <span className="text-[15px] opacity-80">{store ? t('pa.unitMastery', { p: Math.round(v * 100) }) : ''}</span>
        </div>
      </div>
      <button onClick={start} disabled={!audio || !store} className="pill disp min-h-[64px] self-start rounded-full bg-ink px-10 text-xl font-bold text-stone disabled:opacity-60">{v > 0 ? t('pa.practise') : t('td.start')} →</button>

      <section aria-labelledby="u-items" className="flex flex-col gap-3">
        <h2 id="u-items" className="disp m-0 text-[22px] font-extrabold">{t('pa.inUnit')}</h2>
        <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
          {up.words.map((w) => (
            <li key={w.id} className="flex items-baseline gap-3 rounded-[16px] px-4 py-2.5" style={{ background: (store?.cards[w.id]?.box || 0) >= 2 ? TINT[tone] : 'var(--color-paper)' }}>
              <span lang="sa" className="text-xl" style={{ fontFamily: font }}>{toScript(w.sa, sc)}</span>
              <span className="text-[15px] opacity-85">{mean(w.m)}</span>
            </li>
          ))}
          {up.verbs.map((x) => (
            <li key={x.id} className="flex flex-col rounded-[16px] px-4 py-2.5" style={{ background: (store?.cards[x.id]?.box || 0) >= 2 ? TINT[tone] : 'var(--color-paper)' }}>
              <Link href={base + `/verb/${x.slug}` + query} className="flex items-baseline gap-3 no-underline hover:underline"><span lang="sa" className="text-xl" style={{ fontFamily: font }}>{toScript(x.display, sc)}</span><span className="text-[15px] opacity-85">{mean(x.m)}</span></Link>
              <span lang="sa" className="text-[15px] opacity-80" style={{ fontFamily: font }}>{toScript(`${x.lat[2]} · ${x.lat[1]} · ${x.lat[0]}`, sc)}</span>
            </li>
          ))}
          {up.verses.map((x) => (
            <li key={x.id} className="rounded-[16px] px-4 py-2.5 sm:col-span-2" style={{ background: (store?.cards[x.id]?.box || 0) >= 2 ? TINT[tone] : 'var(--color-paper)' }}>
              <Link href={base + `/subhashita/${x.slug}` + query} lang="sa" className="text-lg no-underline hover:underline" style={{ fontFamily: font }}>{toScript(x.lines[0], sc)} …</Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  )
}
