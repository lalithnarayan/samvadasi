export type LakaraId = 'lat' | 'lan' | 'lrt' | 'lot' | 'vidhi' | 'lit' | 'lut' | 'lun' | 'ashir' | 'lrn'
export type WhenId = 'kta' | 'lat' | 'lan' | 'lrt' | 'lot' | 'vidhi'
export type PadaId = 'P' | 'A'
export type PersonId = 'u' | 'm' | 'r' | 'p' // I/we · you · you (respectful) · he/she
export type Gender = 'm' | 'f'
export type Num = 0 | 1 | 2

/** forms[lakara][pada] = 9 cells (he, they two, they, you, you two, you all, I, we two, we); each cell = variants */
export type FormTable = Partial<Record<LakaraId, Partial<Record<PadaId, string[][]>>>>
export type Participle = { kta: string[]; m: string[][]; f: string[][] } | null

export type Override = {
  scope: 'tinanta' | 'participle'
  lakara?: LakaraId | null
  pada?: PadaId | null
  index?: number | null
  form?: string | null
  label: 'colloquial' | 'classical' | 'alternative' | 'correction'
  showFirst?: boolean | null
  note: string
}

export type DhatuLite = {
  id: number | string
  slug: string
  root: string
  display: string
  meaning_en?: string | null
  artha_sa?: string | null
  gloss?: string | null
  gana: number
  code: string
  padas: PadaId[]
  preferredPada?: PadaId | null
  irregular?: boolean | null
  status?: string | null
  forms: FormTable
  participle: Participle
  overrides: Override[]
  meaning_te?: string | null
  meaning_kn?: string | null
  meaning_ta?: string | null
  commonPrefixed?: boolean | null
  derived?: Derived | null
  krdanta?: Krdanta | null
}

/** The verb family (सनादि) and voice (प्रयोग) of one dhātu, from Vidyut. Passive tables are आत्मनेपद: forms[lak]['A']. */
export type FamilyId = 'mula' | 'nic' | 'san' | 'yan'
export type VoiceId = 'kartari' | 'karmani'
export type DerivedEntry = { padas: PadaId[]; forms: FormTable; passive?: FormTable; participle: Participle }
export type Derived = { mula?: { passive?: FormTable }; nic?: DerivedEntry; san?: DerivedEntry; yan?: DerivedEntry }

/** Kṛdanta forms from Vidyut: गत्वा / आगत्य, गन्तुम्, गच्छन्, (शानच्), गन्तव्यम्, गमनीयम्. */
export type KrdantaId = 'ktva' | 'tumun' | 'shatr' | 'shanac' | 'tavya' | 'aniya'
export type Krdanta = Partial<Record<KrdantaId, string[]>>

/** Telugu / Kannada / Tamil wording for a phrase: [verb key of the translation engine, words before the verb]. */
export type LocalWording = Partial<Record<'te' | 'kn' | 'ta', [string, string]>>

export type PhraseLite = {
  id: number | string
  dhatu: DhatuLite
  words: string[]
  english: { base: string; third: string; past: string; tail?: string | null; local?: LocalWording | null }
  note?: string | null
}
