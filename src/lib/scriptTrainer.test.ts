import { describe, expect, it } from 'vitest'
import { MAX_LEVEL, coverage, mix, quizItems, syllables } from './scriptTrainer'

const join = (l: number, sc: 'telu' | 'deva') => mix('विद्या ददाति विनयं', l, sc).map((p) => p.text).join('')

describe('script trainer', () => {
  it('splits into syllables, keeping joined letters together', () => {
    expect(syllables('विद्या')).toEqual(['वि', 'द्या'])
    expect(syllables('गम्')).toEqual(['ग', 'म्'])
    expect(syllables('क्षमा')).toEqual(['क्ष', 'मा'])
  })
  it('shows everything in the reader’s script at level 0 and in Devanagari at the top', () => {
    expect(join(0, 'telu')).toBe('విద్యా దదాతి వినయం')
    expect(join(MAX_LEVEL, 'telu')).toBe('विद्या ददाति विनयं')
    expect(join(0, 'deva')).toBe('vidyā dadāti vinayaṃ')
  })
  it('swaps in more Devanagari at every level', () => {
    const c = Array.from({ length: MAX_LEVEL + 1 }, (_, l) => coverage('विद्या ददाति विनयं', l))
    for (let i = 1; i < c.length; i++) expect(c[i]).toBeGreaterThanOrEqual(c[i - 1])
    expect(c[0]).toBe(0)
    expect(c[MAX_LEVEL]).toBe(1)
  })
  it('has quiz items for every level', () => {
    for (let l = 1; l <= MAX_LEVEL; l++) expect(quizItems(l).length, `level ${l}`).toBeGreaterThanOrEqual(4)
  })
})
