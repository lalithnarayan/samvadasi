/**
 * Script trainer: read Sanskrit in your own script (Telugu, Kannada, Tamil, or Roman letters) and
 * swap in Devanagari a few letters at a time. A syllable shows in Devanagari once every letter in it
 * belongs to a level you have reached.
 */
import { iast, toScript, type ScriptId } from './grammar/script'

type Four = [string, string, string, string]
export type Level = { name: Four; letters: string[] }

export const LEVELS: Level[] = [
  { name: ['Vowels', 'అచ్చులు', 'ಸ್ವರಗಳು', 'உயிர் எழுத்துகள்'], letters: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ा', 'ि', 'ी', 'ु', 'ू'] },
  { name: ['k kh g gh ṅ', 'క ఖ గ ఘ ఙ', 'ಕ ಖ ಗ ಘ ಙ', 'க வர்க்கம்'], letters: ['क', 'ख', 'ग', 'घ', 'ङ'] },
  { name: ['c ch j jh ñ', 'చ ఛ జ ఝ ఞ', 'ಚ ಛ ಜ ಝ ಞ', 'ச வர்க்கம்'], letters: ['च', 'छ', 'ज', 'झ', 'ञ'] },
  { name: ['ṭ ṭh ḍ ḍh ṇ', 'ట ఠ డ ఢ ణ', 'ಟ ಠ ಡ ಢ ಣ', 'ட வர்க்கம்'], letters: ['ट', 'ठ', 'ड', 'ढ', 'ण'] },
  { name: ['t th d dh n', 'త థ ద ధ న', 'ತ ಥ ದ ಧ ನ', 'த வர்க்கம்'], letters: ['त', 'थ', 'द', 'ध', 'न'] },
  { name: ['p ph b bh m', 'ప ఫ బ భ మ', 'ಪ ಫ ಬ ಭ ಮ', 'ப வர்க்கம்'], letters: ['प', 'फ', 'ब', 'भ', 'म'] },
  { name: ['y r l v', 'య ర ల వ', 'ಯ ರ ಲ ವ', 'ய ர ல வ'], letters: ['य', 'र', 'ल', 'व'] },
  { name: ['ś ṣ s h', 'శ ష స హ', 'ಶ ಷ ಸ ಹ', 'ஶ ஷ ஸ ஹ'], letters: ['श', 'ष', 'स', 'ह'] },
  { name: ['e ai o au ṛ, ṃ ḥ', 'ఏ ఐ ఓ ఔ ఋ, ం ః', 'ಏ ಐ ಓ ಔ ಋ, ಂ ಃ', 'ஏ ஐ ஓ ஔ ரு, ம் ஃ'], letters: ['ए', 'ऐ', 'ओ', 'औ', 'ऋ', 'ॠ', 'े', 'ै', 'ो', 'ौ', 'ृ', 'ॄ', 'ं', 'ः', 'ँ', 'ऽ'] },
  { name: ['Joined letters (्)', 'సంయుక్తాక్షరాలు (్)', 'ಸಂಯುಕ್ತಾಕ್ಷರಗಳು (್)', 'கூட்டெழுத்துகள் (்)'], letters: ['्'] },
]
export const MAX_LEVEL = LEVELS.length

/** Letters known at a level (level 0 = none, MAX_LEVEL = all). */
export const knownAt = (level: number) => new Set(LEVELS.slice(0, level).flatMap((l) => l.letters))

const isDeva = (c: string) => { const k = c.charCodeAt(0); return k >= 0x0900 && k <= 0x097f && c !== '।' && c !== '॥' && !(k >= 0x0966 && k <= 0x096f) }
const isCons = (c?: string) => !!c && /[\u0915-\u0939\u0958-\u095F]/.test(c)
const isMark = (c?: string) => !!c && /[\u0900-\u0903\u093A-\u094F\u0962\u0963]/.test(c) && c !== '\u093D'

/** Split Devanagari into syllables: consonants joined by virāma, then a vowel sign and marks; or a vowel with its marks. */
export function syllables(s: string): string[] {
  const out: string[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (!isDeva(c)) { out.push(c); i++; continue }
    let j = i + 1
    if (isCons(c)) {
      while (s[j] === '्' && isCons(s[j + 1])) j += 2
    }
    while (j < s.length && isMark(s[j])) j++
    out.push(s.slice(i, j)); i = j
  }
  return out
}

/** One syllable in the learner's own script: Telugu / Kannada / Tamil, or IAST for Roman readers. */
export const own = (syl: string, sc: ScriptId) => (sc === 'deva' ? iast(syl) : toScript(syl, sc))

export type Piece = { text: string; deva: boolean }
/** Text with the known syllables in Devanagari and the rest in the learner's script. */
export function mix(s: string, level: number, sc: ScriptId): Piece[] {
  const known = knownAt(level)
  const pieces: Piece[] = []
  for (const syl of syllables(s)) {
    // a final virāma (गम्) is easy; only joined letters (क्ष) wait for the last level
    const letters = level >= 2 && syl.endsWith('्') ? [...syl.slice(0, -1)] : [...syl]
    const deva = !isDeva(syl[0]) || letters.every((c) => known.has(c))
    const text = deva ? syl : own(syl, sc)
    const last = pieces[pieces.length - 1]
    if (last && last.deva === deva) last.text += text
    else pieces.push({ text, deva })
  }
  return pieces
}

/** Share of a text's letters already readable in Devanagari at this level. */
export function coverage(s: string, level: number) {
  const known = knownAt(level)
  const letters = [...s].filter(isDeva)
  return letters.length ? letters.filter((c) => known.has(c)).length / letters.length : 0
}

/** Quiz syllables for a level: its letters, consonants with the vowel signs learned so far. */
export function quizItems(level: number): string[] {
  const L = LEVELS[level - 1]
  if (!L) return []
  const known = knownAt(level)
  const signs = ['', 'ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ'].filter((m) => !m || known.has(m))
  const cons = L.letters.filter((c) => isCons(c))
  if (level === 1) return ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ']
  if (level === 9) return ['ए', 'ऐ', 'ओ', 'औ', 'ऋ', 'के', 'गो', 'मै', 'तौ', 'कृ', 'रं', 'नः']
  if (level === 10) return ['क्ष', 'त्र', 'ज्ञ', 'स्त', 'द्य', 'न्त', 'स्म', 'त्व', 'श्च', 'प्र']
  return cons.flatMap((c) => signs.slice(0, 4).map((m) => c + m))
}
