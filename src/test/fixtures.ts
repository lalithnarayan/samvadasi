/** Small, real data for tests: गम् from the generated verb file, plus curated words and verses. */
import { readFileSync } from 'fs'
import path from 'path'
import type { DhatuLite } from '@/lib/grammar'
import type { TodayPool, TodayWord } from '@/lib/data'

const root = path.resolve(__dirname, '../..')
const read = (p: string) => JSON.parse(readFileSync(path.join(root, p), 'utf8'))

let verbs: Record<string, DhatuLite> | null = null
/** A verb from data/generated/dhatus.json in the shape the pages use. */
export function verb(slug: string): DhatuLite {
  verbs ??= Object.fromEntries((read('data/generated/dhatus.json').dhatus as Record<string, unknown>[]).map((d) => [d.slug as string, d as unknown as DhatuLite]))
  const d = verbs[slug]
  if (!d) throw new Error(`no verb ${slug}`)
  return { ...d, overrides: d.overrides ?? [], preferredPada: d.preferredPada ?? d.padas?.[0], display: d.display ?? d.root }
}

/** The practice pool built the same way getTodayPool does, from the curated JSON files. */
export function curatedPool(): TodayPool {
  const words: TodayWord[] = [], seen = new Set<string>()
  const add = (sa: string, m: (string | undefined)[], tag: string) => { if (!sa || seen.has(sa) || !m[0]) return; seen.add(sa); words.push({ id: 'w:' + sa, sa, m: m.map((x) => x || ''), tag }) }
  for (const g of read('data/curated/greetings.json')) if (g.kind === 'greeting') add(g.text, [g.meaning_en, g.meaning_te, g.meaning_kn, g.meaning_ta], 'greet')
  for (const k of read('data/curated/packs.json')) for (const w of k.words) add(w.sa, [w.en, w.te, w.kn, w.ta], 'pack:' + k.slug)
  for (const n of read('data/curated/nouns.json')) if ((n.kind || 'noun') === 'noun') add(n.display, [n.meaning_en, n.meanings?.te, n.meanings?.kn, n.meanings?.ta], 'noun:' + n.cat)
  for (const a of read('data/curated/avyayas.json')) add(a.word, [a.meaning_en, a.meaning_te, a.meaning_kn, a.meaning_ta], 'avy:' + a.category)
  const vs = (read('data/curated/verbs.json') as { display: string; code: string; meaning_en: string }[]).map((v, i) => ({
    id: 'v:' + i, n: i + 1, slug: String(i), display: v.display, m: [v.meaning_en.replace(/^to /, ''), '', '', ''],
    lat: [`${v.display}ति`, `${v.display}सि`, `${v.display}मि`], lrt: [`${v.display}ष्यति`, `${v.display}ष्यसि`, `${v.display}ष्यामि`],
  }))
  const verses = (read('data/curated/subhashitas.json') as { slug: string; theme: string; text: string }[]).map((s) => ({ id: 's:' + s.slug, slug: s.slug, theme: s.theme, lines: s.text.split('\n').map((l) => l.replace(/[।॥|]|\d+/g, '').trim()).filter(Boolean) }))
  return { words, verbs: vs, verses }
}
