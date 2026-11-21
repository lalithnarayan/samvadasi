import { describe, expect, it } from 'vitest'
import { SECTIONS, UNITS, mastery, nextUnit, unitPool, PLACEMENT_UNITS } from './path'
import { buildSession } from './practice'
import { curatedPool } from '@/test/fixtures'

const pool = curatedPool()
const empty = { cards: {}, last: 0, streak: 0, best: 0, freezeWeek: -1, first: 0, days: [] }

describe('learning path', () => {
  it('numbers units 1–30 and puts each in exactly one section', () => {
    expect(UNITS.map((u) => u.n)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
    expect(SECTIONS.flatMap((s) => s.units).sort((a, b) => a - b)).toEqual(UNITS.map((u) => u.n))
  })
  it('gives every unit enough to practise', () => {
    const thin = UNITS.filter((u) => { const p = unitPool(u, pool); return p.words.length + p.verbs.length + p.verses.length < 4 }).map((u) => u.n)
    expect(thin).toEqual([])
  })
  it('builds a lesson for every unit', () => {
    for (const u of UNITS) {
      const ex = buildSession(unitPool(u, pool), empty, 0, u.n, () => false, { ...u.plan, distract: pool.words })
      expect(ex.length, `unit ${u.n}`).toBeGreaterThanOrEqual(4)
    }
  })
  it('places only units that have words to ask', () => {
    for (const n of PLACEMENT_UNITS) expect(unitPool(UNITS.find((u) => u.n === n)!, pool).words.length, `unit ${n}`).toBeGreaterThan(0)
  })
  it('suggests the first unmastered unit after the placement', () => {
    expect(nextUnit(pool, empty)).toBe(1)
    expect(nextUnit(pool, empty, 5)).toBe(6)
    const u1 = unitPool(UNITS[0], pool)
    const cards = Object.fromEntries(u1.words.map((w) => [w.id, { box: 2, due: 99999, seen: 2, right: 2 }]))
    expect(mastery(UNITS[0], pool, { ...empty, cards })).toBe(1)
    expect(nextUnit(pool, { ...empty, cards })).toBe(2)
  })
})
