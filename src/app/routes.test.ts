import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ROUTES, pathsFor } from '@/lib/revalidate'

const app = path.resolve(__dirname)
const pagesIn = (dir: string, base = ''): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    if (statSync(p).isDirectory()) return pagesIn(p, `${base}/${f}`)
    return f === 'page.tsx' ? [base || '/'] : []
  })
const english = pagesIn(path.join(app, '(frontend)'))
const local = new Set(pagesIn(path.join(app, '(loc)', '[lang]')))
// pages that stay English-only on purpose
const ENGLISH_ONLY = ['/offline', '/record']

describe('localized routes', () => {
  it('give every English page a Telugu/Kannada/Tamil twin', () => {
    const missing = english.filter((r) => !ENGLISH_ONLY.includes(r) && !local.has(r))
    expect(missing).toEqual([])
  })
  it('keep each twin’s cache settings in step with the English page', () => {
    for (const r of local) {
      const read = (tree: string) => readFileSync(path.join(app, tree, r === '/' ? '' : r, 'page.tsx'), 'utf8')
      const setting = (s: string) => s.match(/export const revalidate = (\d+)/)?.[1]
      expect(setting(read('(loc)/[lang]')), r).toBe(setting(read('(frontend)')))
      if (read('(frontend)').includes('generateStaticParams')) expect(read('(loc)/[lang]'), r).toContain('generateStaticParams')
    }
  })
})

describe('refresh after CMS edits', () => {
  it('covers every collection', () => {
    const slugs = readdirSync(path.resolve(app, '../collections')).map((f) => readFileSync(path.resolve(app, '../collections', f), 'utf8').match(/slug: '([\w-]+)'/)?.[1]).filter((s): s is string => !!s && s !== 'users')
    expect(slugs.filter((s) => !(s in ROUTES))).toEqual([])
  })
  it('names only routes that exist, in both trees', () => {
    for (const c of Object.keys(ROUTES)) for (const [p] of pathsFor(c)) {
      const file = path.join(app, p.replace('/(frontend)', '(frontend)').replace('/(loc)', '(loc)'), 'page.tsx')
      expect(existsSync(file), `${c}: ${p}`).toBe(true)
    }
  })
})
