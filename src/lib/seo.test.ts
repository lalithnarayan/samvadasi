import { describe, expect, it } from 'vitest'
import { alternates, langOf, plain, verbMeta, PAGES, breadcrumbs } from './seo'
import { verb } from '@/test/fixtures'

describe('search metadata', () => {
  it('links every page to its four language versions', () => {
    const a = alternates('/verb/01.1137', 'te')!
    expect(a.canonical).toBe('/te/verb/01.1137')
    expect(a.languages).toMatchObject({ en: '/verb/01.1137', te: '/te/verb/01.1137', kn: '/kn/verb/01.1137', ta: '/ta/verb/01.1137', 'x-default': '/verb/01.1137' })
    expect(alternates('', 'en')!.canonical).toBe('/')
  })
  it('spells roots the way people type them', () => {
    expect(plain('पठ्')).toBe('path')
    expect(plain('गम्')).toBe('gam')
  })
  it('puts "dhatu roop" and the present form in verb titles', () => {
    const gam = verb('01.1137')
    expect(verbMeta(gam, 'en', '01.1137').title).toMatch(/गम् \(gam\) dhatu roop — गच्छति/)
    expect(verbMeta(gam, 'te', '01.1137').title).toMatch(/^గమ్ ధాతు రూపాలు/)
  })
  it('has copy in four languages for every fixed page', () => {
    for (const [k, p] of Object.entries(PAGES)) {
      expect(p.title.length, k).toBe(4)
      expect(p.desc.every(Boolean), k).toBe(true)
    }
  })
  it('only accepts the three local languages', () => {
    expect(langOf('te')).toBe('te')
    expect(langOf('xx')).toBe('en')
  })
  it('builds breadcrumbs with absolute links', () => {
    const b = breadcrumbs('kn', [['verbs', '/verbs']])
    expect(b.itemListElement[1].item).toMatch(/\/kn\/verbs$/)
  })
})
