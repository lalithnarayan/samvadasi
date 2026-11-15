import type { Gender, Num, PersonId, WhenId } from './types'

export const PERSONS: { id: PersonId; en: string; sk: string; color: 'u' | 'm' | 'p' }[] = [
  { id: 'u', en: 'I · we', sk: 'उत्तम', color: 'u' },
  { id: 'm', en: 'you', sk: 'मध्यम', color: 'm' },
  { id: 'r', en: 'you, respectful', sk: 'भवान् · भवती', color: 'p' }, // takes the he/she (प्रथम) ending
  { id: 'p', en: 'he · she', sk: 'प्रथम', color: 'p' },
]
export const NUMS = [{ id: 0 as Num, en: 'one', sk: 'एक' }, { id: 1 as Num, en: 'two', sk: 'द्वि' }, { id: 2 as Num, en: 'many', sk: 'बहु' }]
export const GENDERS = [{ id: 'm' as Gender, en: 'masc.', sk: 'पुं' }, { id: 'f' as Gender, en: 'fem.', sk: 'स्त्री' }]

export const WHENS: { id: WhenId; name: string; en: string; hint: string }[] = [
  { id: 'kta', name: 'क्तवतु', en: 'past · spoken', hint: 'How people say "went" in conversation. It agrees with gender and number, not person.' },
  { id: 'lan', name: 'लङ्', en: 'past · classical', hint: 'The classical past. Adds अ- in front of the stem.' },
  { id: 'lat', name: 'लट्', en: 'present', hint: 'Happening now, or every day.' },
  { id: 'lrt', name: 'लृट्', en: 'future', hint: 'Will happen. Adds -स्य- or -इष्य- to the root.' },
  { id: 'lot', name: 'लोट्', en: 'request', hint: 'Asking or telling: "go!", "please go", "let me go".' },
  { id: 'vidhi', name: 'विधिलिङ्', en: 'should', hint: 'Advice or duty: "should go".' },
]
export const LAKARA_NAMES: Record<string, { name: string; en: string; literary?: boolean }> = {
  lat: { name: 'लट्', en: 'present' }, lan: { name: 'लङ्', en: 'past · classical' }, lrt: { name: 'लृट्', en: 'future' },
  lot: { name: 'लोट्', en: 'request' }, vidhi: { name: 'विधिलिङ्', en: 'should' },
  lit: { name: 'लिट्', en: 'remote past', literary: true }, lut: { name: 'लुट्', en: 'set future', literary: true },
  lun: { name: 'लुङ्', en: 'aorist', literary: true }, ashir: { name: 'आशीर्लिङ्', en: 'blessing', literary: true },
  lrn: { name: 'लृङ्', en: 'would have', literary: true },
}

const PRON: Record<PersonId, Record<Gender, string[]>> = {
  u: { m: ['अहम्', 'आवाम्', 'वयम्'], f: ['अहम्', 'आवाम्', 'वयम्'] },
  m: { m: ['त्वम्', 'युवाम्', 'यूयम्'], f: ['त्वम्', 'युवाम्', 'यूयम्'] },
  r: { m: ['भवान्', 'भवन्तौ', 'भवन्तः'], f: ['भवती', 'भवत्यौ', 'भवत्यः'] },
  p: { m: ['सः', 'तौ', 'ते'], f: ['सा', 'ते', 'ताः'] },
}
const PEN: Record<PersonId, Record<Gender, string[]>> = {
  u: { m: ['I', 'We two', 'We'], f: ['I', 'We two', 'We'] },
  m: { m: ['You', 'You two', 'You all'], f: ['You', 'You two', 'You all'] },
  r: { m: ['You (sir)', 'You two (sirs)', 'You all (sirs)'], f: ['You (madam)', 'You two (madams)', 'You all (madams)'] },
  p: { m: ['He', 'They two', 'They'], f: ['She', 'They two', 'They'] },
}
const BASE: Record<PersonId, number> = { u: 6, m: 3, r: 0, p: 0 }

export type Subject = { per: PersonId; num: Num; gen: Gender; sk: string; en: string; idx: number; color: 'u' | 'm' | 'p'; s3: boolean }

export function subject(per: PersonId, num: Num, gen: Gender): Subject {
  return {
    per, num, gen,
    sk: PRON[per][gen][num], en: PEN[per][gen][num], idx: BASE[per] + num,
    color: PERSONS.find((p) => p.id === per)!.color, s3: per === 'p' && num === 0,
  }
}
export const colorOfIdx = (idx: number): 'u' | 'm' | 'p' => (idx >= 6 ? 'u' : idx >= 3 ? 'm' : 'p')
export const genderWords = (g: Gender, n: Num) => ({ m: ['a man', 'two men', 'men'], f: ['a woman', 'two women', 'women'] })[g][n]
