import { describe, expect, it } from 'vitest'
import { UI } from './ui'
import { readFileSync } from 'fs'
import path from 'path'
import { langIndex, makeT } from '.'
import { LANGS, dictSource } from '../../../scripts/i18n/build-dicts'
import en from './dict/en'
import te from './dict/te'

describe('interface strings', () => {
  const entries = Object.entries(UI) as [string, readonly string[]][]
  it('has English, Telugu, Kannada and Tamil for every key', () => {
    const missing = entries.filter(([, v]) => v.length !== 4 || v.some((x) => !x || !x.trim())).map(([k]) => k)
    expect(missing).toEqual([])
  })
  it('keeps every {placeholder} in every language', () => {
    const broken = entries.filter(([, v]) => {
      const want = (v[0].match(/\{\w+\}/g) || []).sort().join()
      return v.some((x) => (x.match(/\{\w+\}/g) || []).sort().join() !== want)
    }).map(([k]) => k)
    expect(broken).toEqual([])
  })
  it('fills placeholders and falls back to English', () => {
    expect(makeT(en)('td.streak', { n: 3 })).toBe('3-day streak')
    expect(makeT(te)('td.streak', { n: 3 })).toContain('3')
    expect(langIndex('ta')).toBe(3)
  })
})

describe('per-language dictionaries', () => {
  it('are up to date with ui.ts (run `npx tsx scripts/i18n/build-dicts.ts`)', () => {
    LANGS.forEach((l, i) => expect(readFileSync(path.join(__dirname, 'dict', `${l}.ts`), 'utf8'), l).toBe(dictSource(i)))
  })
})
