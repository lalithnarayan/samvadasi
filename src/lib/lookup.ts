import 'server-only'
import data from '../../data/generated/lookup.json'
import { iast } from './grammar/script'

/**
 * Loose spelling key, the same for a Devanagari form (via IAST) and for what someone types:
 * gacchati, gachchati, gachhati, gacChati (Harvard-Kyoto), gaccati all → "gacati".
 */
export function loose(s: string): string {
  let t = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  t = t.replace(/x/g, 'ks').replace(/w/g, 'v').replace(/z/g, 's')
  t = t.replace(/c+h+/g, 'c').replace(/ch/g, 'c').replace(/sh/g, 's').replace(/([kgjtdpb])h/g, '$1')
  t = t.replace(/([^aeiou])r[iu](?=[^aeiou]|$)/g, '$1r')
  t = t.replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/ai/g, 'e').replace(/au/g, 'o')
  t = t.replace(/(.)\1+/g, '$1').replace(/[^a-z]/g, '')
  return t.replace(/h$/, '')
}

const OFF: [number, number][] = [[0x0c00, 0x300], [0x0c80, 0x380]] // Telugu, Kannada → Devanagari
/** Sanskrit typed in Telugu or Kannada letters → Devanagari (same Unicode layout). */
export function toDeva(s: string): string {
  let o = ''
  for (const ch of s) {
    const k = ch.charCodeAt(0)
    const hit = OFF.find(([b]) => k >= b && k < b + 0x80)
    o += hit ? String.fromCharCode(k - hit[1]) : ch
  }
  return o
}

let byForm: Map<string, number[]> | null = null
let byLoose: Map<string, number[]> | null = null
function build() {
  byForm = new Map(); byLoose = new Map()
  for (const [f, ...ids] of data.forms as [string, ...number[]][]) {
    byForm.set(f, ids)
    const k = loose(iast(f))
    const prev = byLoose.get(k)
    byLoose.set(k, prev ? [...new Set([...prev, ...ids])] : ids)
  }
}

/** Verb slugs whose root or one of whose spoken forms matches the query. */
export function lookupSlugs(q: string, max = 40): string[] {
  const t = q.trim()
  if (!t) return []
  if (!byForm) build()
  const ids = new Set<number>()
  const deva = toDeva(t)
  if (/[ऀ-ॿ]/.test(deva)) {
    for (const w of deva.split(/\s+/)) for (const v of [w, w.replace(/।$/, '')]) byForm!.get(v)?.forEach((i) => ids.add(i))
    if (!ids.size) { const k = loose(iast(deva)); byLoose!.get(k)?.forEach((i) => ids.add(i)) }
  } else if (/[a-z]/i.test(t)) {
    const k = loose(t)
    if (k.length >= 2) {
      byLoose!.get(k)?.forEach((i) => ids.add(i))
      if (ids.size < 5 && k.length >= 4) for (const [lk, v] of byLoose!) { if (lk.startsWith(k)) v.forEach((i) => ids.add(i)); if (ids.size >= max) break }
    }
  }
  return [...ids].slice(0, max).map((i) => data.slugs[i])
}
