import { describe, expect, it } from 'vitest'
import { iast, toScript, tinCell, ktaCell, subject } from '@/lib/grammar'
import { verb } from '@/test/fixtures'

describe('scripts', () => {
  it('writes Devanagari as IAST', () => {
    expect(iast('गच्छति')).toBe('gacchati')
    expect(iast('संस्कृतम्')).toBe('saṃskṛtam')
  })
  it('shifts Devanagari into Telugu and Kannada letter for letter', () => {
    expect(toScript('गच्छति', 'telu')).toBe('గచ్ఛతి')
    expect(toScript('गच्छति', 'knda')).toBe('ಗಚ್ಛತಿ')
  })
  it('marks Tamil aspirates and voiced stops with superscripts', () => {
    expect(toScript('गच्छति', 'taml')).toBe('க³ச்ச²தி')
  })
  it('leaves Devanagari alone', () => expect(toScript('गम्', 'deva')).toBe('गम्'))
})

describe('verb forms', () => {
  const gam = verb('01.1137')
  it('gives he / you / I in the present', () => {
    expect(tinCell(gam, 'lat', 0)?.form).toBe('गच्छति')
    expect(tinCell(gam, 'lat', 3)?.form).toBe('गच्छसि')
    expect(tinCell(gam, 'lat', 6)?.form).toBe('गच्छामि')
  })
  it('gives the future and the past', () => {
    expect(tinCell(gam, 'lrt', 0)?.form).toBe('गमिष्यति')
    expect(tinCell(gam, 'lan', 0)?.form).toBe('अगच्छत्')
  })
  it('splits stem and ending so only the ending changes colour', () => {
    const c = tinCell(gam, 'lat', 0)!
    expect(c.stem + c.end).toBe('गच्छति')
    expect(c.end.length).toBeGreaterThan(0)
  })
  it('agrees the past participle with gender', () => {
    expect(ktaCell(gam, 'm', 0)?.form).toBe('गतवान्')
    expect(ktaCell(gam, 'f', 0)?.form).toBe('गतवती')
  })
  it('gives the respectful you (भवान्) third-person forms and colour', () => {
    expect(subject('r', 0, 'm').color).toBe('p')
    expect(subject('m', 0, 'm').color).toBe('m')
  })
})
