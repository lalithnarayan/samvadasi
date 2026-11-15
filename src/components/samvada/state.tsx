'use client'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { subject, type Gender, type Num, type PersonId, type ScriptId, type Subject, type WhenId } from '@/lib/grammar'

/**
 * WHO / WHEN state shared by every page. Lives in the layout (so it survives navigation)
 * and is mirrored into the URL (?who=r&num=0&gen=f&when=kta&sc=deva) so links reopen the same view.
 */
type State = { per: PersonId; num: Num; gen: Gender; when: WhenId; sc: ScriptId; tr: boolean }
type Ctx = State & {
  subj: Subject
  morph: number // bumps on every change → endings replay their animation
  wipe: { n: number; ox: string; oy: string; from: 'u' | 'm' | 'p' }
  set: (patch: Partial<State>, origin?: { x: number; y: number }) => void
  query: string
}
const DEFAULT: State = { per: 'u', num: 0, gen: 'm', when: 'lat', sc: 'deva', tr: true }
const C = createContext<Ctx | null>(null)

const PERS = ['u', 'm', 'r', 'p'], WH = ['kta', 'lat', 'lan', 'lrt', 'lot', 'vidhi'], SC = ['deva', 'telu', 'knda', 'taml']

function fromUrl(): Partial<State> {
  if (typeof window === 'undefined') return {}
  const q = new URLSearchParams(window.location.search), o: Partial<State> = {}
  const who = q.get('who'), num = q.get('num'), gen = q.get('gen'), when = q.get('when'), sc = q.get('sc'), tr = q.get('tr')
  if (who && PERS.includes(who)) o.per = who as PersonId
  if (num && ['0', '1', '2'].includes(num)) o.num = Number(num) as Num
  if (gen === 'm' || gen === 'f') o.gen = gen
  if (when && WH.includes(when)) o.when = when as WhenId
  if (sc && SC.includes(sc)) o.sc = sc as ScriptId
  if (tr === '0') o.tr = false
  return o
}
const toQuery = (s: State) => {
  const q = new URLSearchParams()
  if (s.per !== DEFAULT.per) q.set('who', s.per)
  if (s.num !== DEFAULT.num) q.set('num', String(s.num))
  if (s.gen !== DEFAULT.gen) q.set('gen', s.gen)
  if (s.when !== DEFAULT.when) q.set('when', s.when)
  if (s.sc !== DEFAULT.sc) q.set('sc', s.sc)
  if (!s.tr) q.set('tr', '0')
  const str = q.toString()
  return str ? '?' + str : ''
}

export function SamvadaStateProvider({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<State>(DEFAULT)
  const [morph, setMorph] = useState(0)
  const [wipe, setWipe] = useState<Ctx['wipe']>({ n: 0, ox: '50%', oy: '90%', from: 'u' })
  const ready = useRef(false)

  useEffect(() => { setSt((s) => ({ ...s, ...fromUrl() })); ready.current = true }, [])
  useEffect(() => {
    if (!ready.current) return
    const url = window.location.pathname + toQuery(st) + window.location.hash
    window.history.replaceState(window.history.state, '', url)
  }, [st])

  const set = useCallback<Ctx['set']>((patch, origin) => {
    setSt((s) => {
      const next = { ...s, ...patch }
      const before = subject(s.per, s.num, s.gen).color, after = subject(next.per, next.num, next.gen).color
      const visible = ['per', 'num', 'gen', 'when'].some((k) => (patch as Record<string, unknown>)[k] !== undefined && (patch as Record<string, unknown>)[k] !== (s as Record<string, unknown>)[k])
      if (visible) setMorph((m) => m + 1)
      if (before !== after) {
        const ox = origin ? Math.round((origin.x / window.innerWidth) * 100) + '%' : '50%'
        const oy = origin ? Math.round((origin.y / window.innerHeight) * 100) + '%' : '90%'
        setWipe((w) => ({ n: w.n + 1, ox, oy, from: before }))
      }
      return next
    })
  }, [])

  const value = useMemo<Ctx>(() => ({ ...st, subj: subject(st.per, st.num, st.gen), morph, wipe, set, query: toQuery(st) }), [st, morph, wipe, set])
  return <C.Provider value={value}>{children}</C.Provider>
}

export function useSamvada() {
  const c = useContext(C)
  if (!c) throw new Error('useSamvada must be used inside SamvadaStateProvider')
  return c
}

export const TINT = { u: 'var(--color-u-tint)', m: 'var(--color-m-tint)', p: 'var(--color-p-tint)' } as const
export const DEEP = { u: 'var(--color-u-deep)', m: 'var(--color-m-deep)', p: 'var(--color-p-deep)' } as const
