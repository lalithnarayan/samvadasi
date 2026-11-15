import type { Derived, DhatuLite, FamilyId, LakaraId, PadaId, VoiceId, WhenId } from './types'
import type { Subject } from './subjects'

export type Cell = { form: string; stem: string; end: string; also: { form: string; label: string }[]; note?: string }

export const padaOf = (d: DhatuLite): PadaId => (d.preferredPada && d.padas.includes(d.preferredPada) ? d.preferredPada : d.padas[0] || 'P')

/** Longest common prefix of a lakara's nine forms = the stem that stays. Too short (irregular) → whole word moves. */
export function stemOf(nine: string[]): string {
  if (!nine.length) return ''
  let p = nine[0]
  for (const f of nine) while (p && !f.startsWith(p)) p = p.slice(0, -1)
  // Never split inside a conjunct: if any form continues with a virama (जग|्मतुः), drop that consonant too.
  // Nor before a vowel sign, anusvara or visarga: an ending must never start with a combining mark (◌ि).
  const mark = (c?: string) => !!c && /[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963]/.test(c)
  while (p && (p.endsWith('्') || nine.some((f) => mark(f[p.length])))) p = p.slice(0, -1)
  return [...p].length <= 1 ? '' : p
}

function overridesFor(d: DhatuLite, scope: 'tinanta' | 'participle', lak?: LakaraId, pada?: PadaId, idx?: number) {
  return (d.overrides || []).filter((o) => o.scope === scope && (scope === 'participle' || (o.lakara === lak && (o.pada || pada) === pada && o.index === idx)))
}

export function tinCell(d: DhatuLite, lak: LakaraId, idx: number, pada: PadaId = padaOf(d)): Cell | null {
  const table = d.forms?.[lak]?.[pada]
  if (!table) return null
  const variants = table[idx] || []
  const stem = stemOf(table.map((v) => v[0] || ''))
  let form = variants[0] || ''
  const also = variants.slice(1).map((f) => ({ form: f, label: 'also' }))
  let note: string | undefined
  for (const o of overridesFor(d, 'tinanta', lak, pada, idx)) {
    if (!o.form) continue
    if (o.showFirst) { also.unshift({ form, label: 'Vidyut' }); form = o.form } else also.push({ form: o.form, label: o.label })
    note = o.note
  }
  const s = form.startsWith(stem) ? stem : ''
  return { form, stem: s, end: form.slice(s.length), also, note }
}

/** Spoken past (क्तवतु): participle stem + वान् / वती …, agreeing with gender and number. */
export function ktaCell(d: DhatuLite, gen: 'm' | 'f', num: number): Cell | null {
  const p = d.participle
  if (!p) return null
  const vid = p[gen]?.[num]?.[0] || ''
  const vidStem = p.kta?.[0] || ''
  let form = vid, stem = vidStem
  const also: Cell['also'] = []
  let note: string | undefined
  for (const o of overridesFor(d, 'participle')) {
    if (!o.form) continue
    const alt = o.form + vid.slice(vidStem.length)
    if (o.showFirst) { also.push({ form: vid, label: o.label === 'colloquial' ? 'classical' : 'Vidyut' }); form = alt; stem = o.form } else also.push({ form: alt, label: o.label })
    note = o.note
  }
  const s = form.startsWith(stem) ? stem : ''
  return { form, stem: s, end: form.slice(s.length), also, note }
}

/**
 * The same verb seen as another member of its family or in the passive: a DhatuLite whose tables are the
 * causative / desiderative / intensive (कर्तरि) or the passive (कर्मणि) ones, so every table helper works unchanged.
 * null = Vidyut has no such form for this root. Overrides belong to the root form only.
 */
export function familyView(d: DhatuLite, fam: FamilyId, voice: VoiceId, derived?: Derived | null): DhatuLite | null {
  if (fam === 'mula' && voice === 'kartari') return d
  if (!derived) return null
  if (fam === 'mula') {
    const f = derived.mula?.passive
    return f && Object.keys(f).length ? { ...d, forms: f, padas: ['A'], preferredPada: 'A', participle: null, overrides: [], irregular: false } : null
  }
  const e = derived[fam]
  if (!e) return null
  if (voice === 'karmani') return e.passive && Object.keys(e.passive).length ? { ...d, forms: e.passive, padas: ['A'], preferredPada: 'A', participle: null, overrides: [], irregular: false } : null
  const pref = d.preferredPada && e.padas.includes(d.preferredPada) ? d.preferredPada : e.padas[0]
  return { ...d, forms: e.forms, padas: e.padas, preferredPada: pref, participle: e.participle, overrides: [], irregular: false }
}

export function cellFor(d: DhatuLite, when: WhenId, subj: Subject): Cell | null {
  return when === 'kta' ? ktaCell(d, subj.gen, subj.num) : tinCell(d, when, subj.idx)
}

/** Final म् before a consonant → anusvara; anusvara before a vowel → म् (अहं गच्छामि · गृहम् आगच्छति). */
export function joinWords(ws: string[]): string[] {
  const out = ws.slice()
  const vowelStart = (w: string) => { const k = w.charCodeAt(0); return k >= 0x0904 && k <= 0x0914 }
  for (let i = 0; i < out.length - 1; i++) {
    const a = out[i], b = out[i + 1]
    if (!b) continue
    if (a.endsWith('म्') && !vowelStart(b)) out[i] = a.slice(0, -2) + 'ं'
    else if (a.endsWith('ं') && vowelStart(b)) out[i] = a.slice(0, -1) + 'म्'
  }
  return out
}
