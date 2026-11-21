import { describe, expect, it } from 'vitest'
import { restoreArrays } from './jsonField'

describe('JSON fields survive partial updates', () => {
  it('turns objects keyed 0, 1, 2 back into arrays, at any depth', () => {
    const damaged = [{ 0: ['सः'], 1: ['तौ'], 2: ['ते'] }, { 0: ['तम्'], 1: ['तौ'], 2: ['तान्'] }]
    expect(restoreArrays(damaged)).toEqual([[['सः'], ['तौ'], ['ते']], [['तम्'], ['तौ'], ['तान्']]])
    expect(restoreArrays({ lat: { P: { 0: ['गच्छति'] } } })).toEqual({ lat: { P: [['गच्छति']] } })
  })
  it('leaves good data and real objects alone', () => {
    const good = { lat: { P: [['गच्छति']] }, m: 'x', '1x': 2 }
    expect(restoreArrays(good)).toEqual(good)
    expect(restoreArrays(null)).toBe(null)
    expect(restoreArrays({})).toEqual({})
  })
})
