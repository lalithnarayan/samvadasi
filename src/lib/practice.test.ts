import { describe, expect, it } from 'vitest'
import { INTERVALS, buildSession, finishDay, freezeReady, grade, learnedCount, liveStreak, type Store } from './practice'
import { curatedPool } from '@/test/fixtures'

const empty = (): Store => ({ cards: {}, last: 0, streak: 0, best: 0, freezeWeek: -1, first: 0, days: [] })
const D = 20000 // a Thursday

describe('spaced review', () => {
  it('moves a right answer up a box and out by its interval', () => {
    let s = grade(empty(), 'w:x', true, D)
    expect(s.cards['w:x']).toMatchObject({ box: 1, due: D + INTERVALS[1] })
    s = grade(s, 'w:x', true, D)
    expect(s.cards['w:x']).toMatchObject({ box: 2, due: D + INTERVALS[2] })
    expect(learnedCount(s)).toBe(1)
  })
  it('sends a wrong answer back to box 0, due tomorrow', () => {
    let s = grade(grade(grade(empty(), 'w:x', true, D), 'w:x', true, D), 'w:x', false, D)
    expect(s.cards['w:x']).toMatchObject({ box: 0, due: D + 1, seen: 3, right: 2 })
    s = grade(s, 'w:x', true, D)
    expect(s.cards['w:x'].box).toBe(1)
  })
  it('never goes past box 5', () => {
    let s = empty()
    for (let i = 0; i < 10; i++) s = grade(s, 'w:x', true, D)
    expect(s.cards['w:x'].box).toBe(5)
  })
})

describe('streak', () => {
  it('starts at 1 and grows on consecutive days', () => {
    let s = finishDay(empty(), D).store
    expect(s.streak).toBe(1)
    s = finishDay(s, D + 1).store
    expect(s).toMatchObject({ streak: 2, best: 2, first: D })
  })
  it('counts a day once', () => {
    const s = finishDay(finishDay(empty(), D).store, D).store
    expect(s.streak).toBe(1)
    expect(s.days).toEqual([D])
  })
  it('covers one missed day with the weekly freeze, once a week', () => {
    const a = finishDay(empty(), D).store
    const b = finishDay(a, D + 2)
    expect(b.froze).toBe(true)
    expect(b.store.streak).toBe(2)
    expect(freezeReady(b.store, D + 2)).toBe(false) // used for this week
    expect(freezeReady(b.store, D + 9)).toBe(true) // ready again next week
  })
  it('breaks after two missed days', () => {
    const a = finishDay(empty(), D).store
    expect(finishDay(a, D + 3).store.streak).toBe(1)
    expect(liveStreak(a, D + 3)).toBe(0)
    expect(liveStreak(a, D + 1)).toBe(1)
  })
})

describe('session builder', () => {
  const pool = curatedPool()
  const s = buildSession(pool, empty(), 0, 42, () => false)
  it('builds a 5-minute session of about 10 steps', () => {
    expect(s.length).toBeGreaterThanOrEqual(8)
    expect(s.length).toBeLessThanOrEqual(12)
  })
  it('always offers the right answer among distinct options', () => {
    for (const e of s) {
      if (!('options' in e)) continue
      expect(new Set(e.options).size).toBe(e.options.length)
      expect(e.options[e.answer]).toBeDefined()
    }
  })
  it('mixes kinds and uses only known items', () => {
    const kinds = new Set(s.map((e) => e.kind))
    expect(kinds.size).toBeGreaterThanOrEqual(3)
    const ids = new Set([...pool.words, ...pool.verbs, ...pool.verses].map((x) => x.id))
    for (const e of s) for (const id of 'ids' in e ? e.ids : [e.id]) expect(ids.has(id)).toBe(true)
  })
  it('puts due reviews first', () => {
    const w = pool.words[5]
    const st = { ...empty(), cards: { [w.id]: { box: 2, due: 1, seen: 2, right: 2 } } }
    const ex = buildSession(pool, st, 0, 7, () => false)
    expect(ex.some((e) => 'word' in e && e.word.id === w.id)).toBe(true)
  })
  it('is the same for the same seed', () => {
    expect(buildSession(pool, empty(), 0, 42, () => false)).toEqual(s)
  })
})
