import { describe, expect, it } from 'vitest'
import { iast } from './grammar/script'
import { loose } from './loose'
import { searchLocal } from './verbSearch'

const rows = [
  ['01.1137', 'गम्', 'to go', '01.1137', 1, 1, 'गम्'],
  ['01.1137-A', 'आ + गम्', 'to come', '01.1137', 1, 1, 'गम्'],
  ['01.0381', 'पठ्', 'to read, study', '01.0381', 1, 1, 'पठ्'],
  ['01.0979', 'पत्', 'to fall', '01.0979', 1, 1, 'पत्'],
  ['06.0092', 'लिख्', 'to write', '06.0092', 6, 1, 'लिख्'],
  ['01.0512', 'गोम', 'उपलेपने', '01.0512', 1, 0, 'गोम'],
].map((r) => ({ r: r as never, key: loose(iast((r[6] || r[1]) as string)), m: (r[2] as string).toLowerCase() }))
const first = (q: string) => searchLocal(rows, q, 3)[0]?.display

describe('loose spelling', () => {
  it('matches the usual ways of typing a form', () => {
    for (const s of ['gacchati', 'gachchati', 'gachhati', 'gaccati']) expect(loose(s)).toBe(loose('gacchati'))
  })
})

describe('in-browser verb search', () => {
  it('finds roots in Roman, Devanagari and Telugu letters', () => {
    expect(first('gam')).toBe('गम्')
    expect(first('पठ्')).toBe('पठ्')
    expect(first('పఠ్')).toBe('पठ्')
  })
  it('puts a whole-word English meaning above a spelling prefix', () => {
    expect(first('go')).toBe('गम्')
    expect(first('write')).toBe('लिख्')
  })
  it('ranks the plain root above its prefixed verbs', () => {
    expect(searchLocal(rows, 'gam', 2).map((h) => h.display)).toEqual(['गम्', 'आ + गम्'])
  })
  it('finds by Dhātupāṭha number and returns nothing for nonsense', () => {
    expect(first('06.00')).toBe('लिख्')
    expect(searchLocal(rows, 'xyzq')).toEqual([])
  })
})
