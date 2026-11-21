import type { ScriptId } from '../grammar/script'
import { toScript } from '../grammar/script'
import type { DhatuLite, Gender, Num, WhenId } from '../grammar/types'
import { genderWords, type Subject } from '../grammar/subjects'
import { englishLine } from '../grammar/english'
import type { UIKey } from './ui'
import { GENDER_WORDS, localLine, MEANINGS, pronounLabel, SITUATIONS, type LocalLang, type Style } from './local'
export type { Style }

export type Lang = 'en' | LocalLang
export type { UIKey }
export const LANG_OF: Record<ScriptId, Lang> = { deva: 'en', telu: 'te', knda: 'kn', taml: 'ta' }
const COL: Record<Lang, number> = { en: 0, te: 1, kn: 2, ta: 3 }
/** Column of a language in every [en, te, kn, ta] tuple. */
export const langIndex = (lang: Lang) => COL[lang]
export type Localized = [en: string, te: string, kn: string, ta: string]

export type T = (key: UIKey, vars?: Record<string, string | number>) => string
/** One language's strings (generated from ui.ts into ./dict, so a page ships only its own). */
export type Dict = Record<UIKey, string>
export function makeT(dict: Dict): T {
  return (key, vars) => {
    let s: string = dict[key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
}
/** Load another language's strings on demand (a separate small chunk per language). */
export const loadDict = (lang: Lang): Promise<Dict> => import(`./dict/${lang}`).then((m) => m.default as Dict)

/** The phrase in the UI language, conjugated for WHO and WHEN. Falls back to English. */
export function sentence(lang: Lang, s: Subject, when: WhenId, e: { base: string; third: string; past: string; tail?: string | null; local?: Partial<Record<LocalLang, [string, string]>> | null }, style: Style = 'written'): string {
  if (lang !== 'en') { const l = localLine(lang, s, when, e, style); if (l) return l }
  return englishLine(s, when, e)
}

export const subjectLabel = (lang: Lang, s: Subject) => (lang === 'en' ? s.en : pronounLabel(lang, s))
export const genderWordsIn = (lang: Lang, g: Gender, n: Num) => (lang === 'en' ? genderWords(g, n) : GENDER_WORDS[lang][g][n])
export const situationTitle = (lang: Lang, title: string) => (lang === 'en' ? title : SITUATIONS[title]?.[lang] || title)

/**
 * A verb's meaning in the UI language. Everyday verbs have a hand-written meaning;
 * other roots show the Dhātupāṭha's Sanskrit meaning in the lipi, with English beneath.
 */
export function meaningOf(d: Pick<DhatuLite, 'slug' | 'meaning_en' | 'artha_sa'> & Partial<Pick<DhatuLite, 'meaning_te' | 'meaning_kn' | 'meaning_ta'>>, lang: Lang, sc: ScriptId): { main: string; sub?: string; sanskrit?: boolean } {
  const en = (d.meaning_en || '').replace(/^to /, '')
  if (lang === 'en') return en ? { main: en } : { main: d.artha_sa || '', sanskrit: true }
  const m = (lang === 'te' ? d.meaning_te : lang === 'kn' ? d.meaning_kn : d.meaning_ta) || MEANINGS[d.slug]?.[COL[lang] - 1]
  if (m) return { main: m }
  if (d.artha_sa) return { main: toScript(d.artha_sa, sc), sub: en || undefined, sanskrit: true }
  return { main: en }
}

/** Pick the UI-language entry of [en, te, kn, ta], falling back to English. */
export const pick = (lang: Lang, xs: (string | null | undefined)[]) => xs[COL[lang]] || xs[0] || ''
/** A noun's meaning in the UI language. */
export const nounMeaning = (lang: Lang, n: { meaning_en?: string | null; meaning_te?: string | null; meaning_kn?: string | null; meaning_ta?: string | null }) =>
  pick(lang, [n.meaning_en, n.meaning_te, n.meaning_kn, n.meaning_ta])
