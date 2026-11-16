import 'server-only'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { lookupSlugs, toDeva } from './lookup'
import type { DhatuLite, LakaraId, PhraseLite } from './grammar'

export const SPOKEN: LakaraId[] = ['lat', 'lan', 'lrt', 'lot', 'vidhi']
const payload = () => getPayload({ config })

type Doc = Record<string, any>

/** Trim a CMS dhatu to what the site needs (optionally only the spoken lakāras, to keep pages light). */
export function lite(d: Doc, lakaras?: LakaraId[], withDerived = false): DhatuLite & { aupadeshika: string; prefixes: string[] } {
  const forms: Doc = {}
  for (const [k, v] of Object.entries(d.forms || {})) if (!lakaras || lakaras.includes(k as LakaraId)) forms[k] = v
  return {
    id: d.id, slug: d.slug, root: d.root, display: d.display, meaning_en: d.meaning_en, artha_sa: d.artha_sa, gloss: d.gloss,
    gana: d.gana, code: d.code, padas: d.padas || [], preferredPada: d.preferredPada, irregular: d.irregular, status: d.status,
    forms, participle: d.participle || null, overrides: (d.overrides || []).map(({ id, ...o }: Doc) => o),
    aupadeshika: d.aupadeshika, prefixes: d.prefixes || [],
    meaning_te: d.meaning_te, meaning_kn: d.meaning_kn, meaning_ta: d.meaning_ta, commonPrefixed: !!d.commonPrefixed,
    derived: withDerived ? d.derived || null : undefined,
    krdanta: withDerived ? d.krdanta || null : undefined,
  }
}

export async function getDhatu(slug: string) {
  const p = await payload()
  const r = await p.find({ collection: 'dhatus', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return r.docs[0] ? lite(r.docs[0], undefined, true) : null
}

/** The common prefixed verbs (आ + गम् …), for the "With prefixes" tab. */
export async function getPrefixed() {
  const p = await payload()
  const r = await p.find({ collection: 'dhatus', where: { commonPrefixed: { equals: true } }, sort: 'display', limit: 1000, depth: 0, pagination: false })
  return r.docs.map((d) => lite(d, SPOKEN))
}

/** A verb's family by prefix: its root and the common prefixed verbs built on the same dhātu. */
export async function getRelatives(code: string, slug: string) {
  const p = await payload()
  const r = await p.find({ collection: 'dhatus', where: { and: [{ code: { equals: code } }, { or: [{ commonPrefixed: { equals: true } }, { slug: { equals: code } }] }, { slug: { not_equals: slug } }] }, sort: 'display', limit: 40, depth: 0, pagination: false })
  return r.docs.map((d) => lite(d, ['lat']))
}

export async function getFeatured() {
  const p = await payload()
  const r = await p.find({ collection: 'dhatus', where: { featured: { equals: true } }, sort: 'order', limit: 500, depth: 0, pagination: false })
  return r.docs.map((d) => lite(d, SPOKEN))
}

export async function searchDhatus(q: string, limit = 20, page = 1) {
  const p = await payload()
  const t = q.trim()
  const slugs = lookupSlugs(t)
  const dv = toDeva(t)
  const where: Where = t
    ? { or: [...(slugs.length ? [{ slug: { in: slugs } }] : []), ...(dv !== t ? [{ root: { like: dv } }, { display: { like: dv } }] : []), { root: { like: t } }, { display: { like: t } }, { meaning_en: { like: t } }, { artha_sa: { like: t } }, { code: { like: t } }, { aupadeshika: { like: t } },
        { meaning_te: { like: t } }, { meaning_kn: { like: t } }, { meaning_ta: { like: t } }] }
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
      .map((x: Doc) => ({ id: x.id, dhatu: lite(x.dhatu, SPOKEN), words: (x.words || []).map((w: Doc) => w.text), english: { ...x.english, local: x.local || null }, note: x.note })),
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

export async function prefixedCount() {
  const p = await payload()
  return (await p.count({ collection: 'dhatus', where: { commonPrefixed: { equals: true } } })).totalDocs
}

export async function dhatuCount() {
  const p = await payload()
  return (await p.count({ collection: 'dhatus' })).totalDocs
}

/** Slugs for the sitemap. */
export async function allSlugs() {
  const p = await payload()
  const r = await p.find({ collection: 'dhatus', limit: 5000, depth: 0, pagination: false, select: { slug: true, featured: true, commonPrefixed: true } })
  return { dhatus: r.docs.map((d) => d.slug as string), featured: new Set(r.docs.filter((d) => d.featured || d.commonPrefixed).map((d) => d.slug as string)) }
}

// ── nouns, avyayas, packs, greetings ────────────────────────────────────
export type NounLite = {
  slug: string; display: string; gender: 'm' | 'f' | 'n'; kind: 'noun' | 'pronoun'; cat: string
  meaning_en?: string | null; meaning_te?: string | null; meaning_kn?: string | null; meaning_ta?: string | null
  nom: string; forms?: string[][][]; stemSlp1: string; gloss?: string | null
}
const nounLite = (n: Doc, withForms = false): NounLite => ({
  slug: n.slug, display: n.display, gender: n.gender, kind: n.kind || 'noun', cat: n.cat || 'life', stemSlp1: n.stemSlp1,
  meaning_en: n.meaning_en, meaning_te: n.meaning_te, meaning_kn: n.meaning_kn, meaning_ta: n.meaning_ta, gloss: n.gloss,
  nom: n.forms?.[0]?.[0]?.[0] || n.display, forms: withForms ? n.forms : undefined,
})

export async function getNouns() {
  const p = await payload()
  const r = await p.find({ collection: 'nouns', sort: 'order', limit: 1000, depth: 0, pagination: false })
  return r.docs.map((n) => nounLite(n))
}

export async function getNoun(slug: string) {
  const p = await payload()
  const r = await p.find({ collection: 'nouns', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return r.docs[0] ? nounLite(r.docs[0], true) : null
}

export async function getAvyayas() {
  const p = await payload()
  const r = await p.find({ collection: 'avyayas', sort: 'order', limit: 500, depth: 0, pagination: false })
  return r.docs.map((a: Doc) => ({ word: a.word, category: a.category, meaning_en: a.meaning_en, meaning_te: a.meaning_te, meaning_kn: a.meaning_kn, meaning_ta: a.meaning_ta, example: a.example, example_en: a.example_en }))
}
export type AvyayaLite = Awaited<ReturnType<typeof getAvyayas>>[number]

export async function getGreetings() {
  const p = await payload()
  const r = await p.find({ collection: 'greetings', sort: 'order', limit: 500, depth: 0, pagination: false })
  return r.docs.map((g: Doc) => ({ text: g.text, kind: g.kind, gender: g.gender, reply: g.reply, meaning: [g.meaning_en, g.meaning_te, g.meaning_kn, g.meaning_ta], when: [g.when_en, g.when_te, g.when_kn, g.when_ta] }))
}
export type GreetingLite = Awaited<ReturnType<typeof getGreetings>>[number]

export type PackLite = { slug: string; title: string[]; titleSa?: string | null; words: { sa: string; m: string[]; noun?: string | null }[]; phrases: PhraseLite[] }
const packLite = (k: Doc, phrases: Doc[] = []): PackLite => ({
  slug: k.slug, title: [k.title, k.title_te, k.title_kn, k.title_ta], titleSa: k.titleSa,
  words: (k.words || []).map((w: Doc) => ({ sa: w.sa, m: [w.en, w.te, w.kn, w.ta], noun: typeof w.noun === 'object' && w.noun ? w.noun.slug : null })),
  phrases: phrases.filter((x) => typeof x.dhatu === 'object').map((x) => ({ id: x.id, dhatu: lite(x.dhatu, SPOKEN), words: (x.words || []).map((w: Doc) => w.text), english: { ...x.english, local: x.local || null }, note: x.note })),
})

export async function getPacks() {
  const p = await payload()
  const r = await p.find({ collection: 'packs', sort: 'order', limit: 100, depth: 0, pagination: false })
  return r.docs.map((k) => packLite(k))
}

export async function getPack(slug: string) {
  const p = await payload()
  const r = await p.find({ collection: 'packs', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  const k = r.docs[0]
  if (!k) return null
  const ph = await p.find({ collection: 'phrases', where: { pack: { equals: k.id } }, sort: 'order', limit: 100, depth: 1, pagination: false })
  return packLite(k, ph.docs)
}

/** Verbs and nouns for the sentence builder. */
export async function getBuilderData() {
  const p = await payload()
  const [nouns, verbs] = await Promise.all([
    p.find({ collection: 'nouns', where: { kind: { equals: 'noun' } }, sort: 'order', limit: 1000, depth: 0, pagination: false }),
    p.find({ collection: 'dhatus', where: { featured: { equals: true } }, sort: 'order', limit: 200, depth: 0, pagination: false }),
  ])
  const pron = await p.find({ collection: 'nouns', where: { slug: { in: ['asmad-m', 'yuzmad-m', 'Bavat-m', 'BavatI-f', 'tad-m', 'tad-f'] } }, limit: 10, depth: 0, pagination: false })
  return {
    nouns: nouns.docs.map((n) => nounLite(n, true)),
    pronouns: Object.fromEntries(pron.docs.map((n) => [n.slug as string, (n.forms as string[][][])?.[2]?.map((c) => c[0]) || []])),
    verbs: verbs.docs.map((d: Doc) => ({ ...lite(d, SPOKEN), derived: d.derived?.mula?.passive ? { mula: { passive: d.derived.mula.passive } } : null })),
  }
}
