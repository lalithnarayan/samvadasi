import 'server-only'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { DhatuLite, LakaraId, PhraseLite } from './grammar'

export const SPOKEN: LakaraId[] = ['lat', 'lan', 'lrt', 'lot', 'vidhi']
const payload = () => getPayload({ config })

type Doc = Record<string, any>

/** Trim a CMS dhatu to what the site needs (optionally only the spoken lakāras, to keep pages light). */
export function lite(d: Doc, lakaras?: LakaraId[]): DhatuLite & { aupadeshika: string; prefixes: string[] } {
  const forms: Doc = {}
  for (const [k, v] of Object.entries(d.forms || {})) if (!lakaras || lakaras.includes(k as LakaraId)) forms[k] = v
  return {
    id: d.id, slug: d.slug, root: d.root, display: d.display, meaning_en: d.meaning_en, artha_sa: d.artha_sa, gloss: d.gloss,
    gana: d.gana, code: d.code, padas: d.padas || [], preferredPada: d.preferredPada, irregular: d.irregular, status: d.status,
    forms, participle: d.participle || null, overrides: (d.overrides || []).map(({ id, ...o }: Doc) => o),
    aupadeshika: d.aupadeshika, prefixes: d.prefixes || [],
  }
}

export async function getDhatu(slug: string) {
  const p = await payload()
  const r = await p.find({ collection: 'dhatus', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return r.docs[0] ? lite(r.docs[0]) : null
}

export async function getFeatured() {
  const p = await payload()
  const r = await p.find({ collection: 'dhatus', where: { featured: { equals: true } }, sort: 'order', limit: 500, depth: 0, pagination: false })
  return r.docs.map((d) => lite(d, SPOKEN))
}

export async function searchDhatus(q: string, limit = 20, page = 1) {
  const p = await payload()
  const t = q.trim()
  const where: Where = t
    ? { or: [{ root: { like: t } }, { display: { like: t } }, { meaning_en: { like: t } }, { artha_sa: { like: t } }, { code: { like: t } }, { aupadeshika: { like: t } }] }
    : {}
  const r = await p.find({ collection: 'dhatus', where, sort: '-featured', limit, page, depth: 0 })
  return { total: r.totalDocs, pages: r.totalPages, page: r.page || 1, docs: r.docs.map((d) => lite(d, SPOKEN)) }
}

export async function getSituations(): Promise<{ id: any; title: string; titleSa?: string | null; phrases: PhraseLite[] }[]> {
  const p = await payload()
  const sits = await p.find({ collection: 'situations', sort: 'order', limit: 100, depth: 0, pagination: false })
  const ph = await p.find({ collection: 'phrases', sort: 'order', limit: 1000, depth: 1, pagination: false })
  return sits.docs.map((s) => ({
    id: s.id, title: s.title, titleSa: s.titleSa,
    phrases: ph.docs.filter((x: Doc) => (typeof x.situation === 'object' ? x.situation?.id : x.situation) === s.id && typeof x.dhatu === 'object')
      .map((x: Doc) => ({ id: x.id, dhatu: lite(x.dhatu, SPOKEN), words: (x.words || []).map((w: Doc) => w.text), english: x.english, note: x.note })),
  }))
}

export async function getDeck() {
  const p = await payload()
  const r = await p.find({ collection: 'practice-decks', where: { isDefault: { equals: true } }, limit: 1, depth: 2 })
  const deck = r.docs[0]
  if (!deck) return null
  return {
    title: deck.title,
    cards: (deck.cards || []).filter((c: Doc) => typeof c.phrase === 'object' && typeof c.phrase.dhatu === 'object').map((c: Doc) => ({
      person: c.person, number: Number(c.number), gender: c.gender, lakara: c.lakara,
      phrase: { id: c.phrase.id, dhatu: lite(c.phrase.dhatu, SPOKEN), words: (c.phrase.words || []).map((w: Doc) => w.text), english: c.phrase.english, note: c.phrase.note } as PhraseLite,
    })),
  }
}

export async function getExamples(dhatuId: string | number) {
  const p = await payload()
  const r = await p.find({ collection: 'examples', where: { dhatu: { equals: dhatuId } }, sort: '-reviewed', limit: 4, depth: 0 })
  return r.docs.map((e) => ({ text: e.text, source: e.source, url: e.url, form: e.form, token: e.token, translation: e.translation, reviewed: !!e.reviewed, licence: e.licence }))
}

export async function dhatuCount() {
  const p = await payload()
  return (await p.count({ collection: 'dhatus' })).totalDocs
}
