/**
 * Every text a play button can ask for (for the AI voice and the recording page).
 *   npx tsx --conditions=react-server --env-file=.env scripts/audio/texts.ts  → data/generated/audio-texts.json
 * Keys are normalised the same way the Speak button normalises (no danda, single spaces).
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { cellFor, joinWords, subject, tinCell, type DhatuLite, type WhenId } from '../../src/lib/grammar'
import { lite, SPOKEN } from '../../src/lib/data'

export const clean = (s: string) => s.replace(/[।॥|?]/g, ' ').replace(/\s+/g, ' ').trim()

async function main() {
  const payload = await getPayload({ config })
  const out = new Map<string, { text: string; kind: string; where: string }>()
  const add = (text: string | null | undefined, kind: string, where: string) => {
    if (!text) return
    const k = clean(text)
    if (k && !out.has(k)) out.set(k, { text: k, kind, where })
  }
  const all = async (collection: any, depth = 0) => (await payload.find({ collection, limit: 5000, depth, pagination: false })).docs as any[]

  for (const g of await all('greetings')) { add(g.text, 'greeting', '/greetings'); add(g.reply, 'greeting', '/greetings') }
  for (const s of await all('subhashitas')) add(s.text, 'verse', `/subhashita/${s.slug}`)
  for (const a of await all('avyayas')) { add(a.word, 'word', '/words'); add(a.example, 'phrase', '/words') }
  for (const k of await all('packs')) for (const w of k.words || []) add(w.sa, 'word', `/packs/${k.slug}`)
  for (const n of await all('nouns')) add(n.forms?.[0]?.[0]?.[0], 'noun', `/noun/${n.slug}`)

  const featured = (await payload.find({ collection: 'dhatus', where: { featured: { equals: true } }, limit: 500, depth: 0, pagination: false })).docs as any[]
  for (const d of featured) {
    const l = lite(d)
    for (const w of ['lat', 'lrt'] as const) add(tinCell(l, w, 0, l.preferredPada || l.padas[0])?.form, 'form', `/verb/${d.slug}`)
    for (const f of Object.values(d.krdanta || {}) as string[][]) add(f?.[0], 'form', `/verb/${d.slug}`)
  }

  // phrases (situations and packs) for the common subjects and tenses
  const subs = [subject('u', 0, 'm'), subject('m', 0, 'm'), subject('r', 0, 'm'), subject('p', 0, 'm'), subject('p', 0, 'f')]
  const whens: WhenId[] = ['lat', 'lrt', 'lan', 'lot', 'kta']
  for (const p of await all('phrases', 1)) {
    if (typeof p.dhatu !== 'object' || !p.dhatu) continue
    const d: DhatuLite = lite(p.dhatu, SPOKEN)
    for (const s of subs) for (const w of whens) {
      const c = cellFor(d, w, s)
      if (c) add(joinWords([s.sk, ...(p.words || []).map((x: any) => x.text), c.form]).join(' '), 'phrase', p.situation ? '/phrases' : '/packs')
    }
  }
  const list = [...out.values()]
  fs.writeFileSync(path.resolve('data/generated/audio-texts.json'), JSON.stringify(list, null, 0))
  const by = list.reduce((m: any, x) => ((m[x.kind] = (m[x.kind] || 0) + 1), m), {})
  console.log(list.length, 'texts', by)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
