'use client'
import { iast } from './grammar/script'
import { loose } from './loose'

/** [slug, display, meaning, code, gana, everyday (1/0), root] */
type Row = readonly [string, string, string, string, number, number, string]
export type Hit = { slug: string; display: string; meaning: string; gana: number; code: string }
type Indexed = { r: Row; key: string; m: string }

let index: Promise<Indexed[]> | null = null
/** Fetched once per visit, then every keystroke is answered in the browser. */
export const loadIndex = () => (index ??= fetch('/search-index').then((x) => (x.ok ? x.json() : [])).then((rows: Row[]) => rows.map((r) => ({ r, key: loose(iast(r[6] || r[1])), m: r[2].toLowerCase() }))).catch(() => { index = null; return [] }))

const tel = (s: string) => s.replace(/[ఀ-౿ಀ-೿]/g, (c) => String.fromCharCode(c.charCodeAt(0) - (c.charCodeAt(0) < 0x0c80 ? 0x300 : 0x380)))

/** Root spelling (any script or loose Roman), English meaning, or Dhātupāṭha number. */
export function searchLocal(rows: Indexed[], q: string, max = 20): Hit[] {
  const t = tel(q.trim())
  if (!t) return rows.filter((x) => x.r[5]).slice(0, max).map(hit)
  const deva = /[ऀ-ॿ]/.test(t), num = /^\d/.test(t)
  const k = deva ? loose(iast(t)) : loose(t), lower = t.toLowerCase()
  const scored: [number, Indexed][] = []
  for (const x of rows) {
    const [, display, , code, , everyday, root] = x.r
    let s = -1
    if (num) { if (code.startsWith(t)) s = 3 }
    else if (deva && (display === t || root === t)) s = 0
    else if (k && x.key === k) s = 1
    else if (!deva && lower.length >= 2 && new RegExp(`\\b${lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(x.m)) s = 1.5
    else if (deva ? display.includes(t) : k.length >= 2 && x.key.startsWith(k)) s = 2
    else if (!deva && lower.length >= 3 && x.m.includes(lower)) s = 3
    if (s >= 0) scored.push([s - everyday * 0.5 + (display.includes('+') ? 0.3 : 0), x])
  }
  return scored.sort((a, b) => a[0] - b[0]).slice(0, max).map(([, x]) => hit(x))
}
const hit = (x: Indexed): Hit => ({ slug: x.r[0], display: x.r[1], meaning: x.r[2], code: x.r[3], gana: x.r[4] })
