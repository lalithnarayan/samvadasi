/** Devanagari → Telugu / Kannada / Tamil (by Unicode block offset) and → IAST. */
export type ScriptId = 'deva' | 'telu' | 'knda' | 'taml'

export const SCRIPTS: { id: ScriptId; short: string; name: string; font: string; display: string }[] = [
  { id: 'deva', short: 'दे', name: 'Devanagari', font: 'var(--font-sk-deva)', display: 'var(--font-display)' },
  { id: 'telu', short: 'తె', name: 'Telugu', font: 'var(--font-sk-telu)', display: 'var(--font-sk-telu)' },
  { id: 'knda', short: 'ಕ', name: 'Kannada', font: 'var(--font-sk-knda)', display: 'var(--font-sk-knda)' },
  { id: 'taml', short: 'த', name: 'Tamil', font: 'var(--font-sk-taml)', display: 'var(--font-sk-taml)' },
]

const CONS: Record<string, string> = { क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'ṅ', च: 'c', छ: 'ch', ज: 'j', झ: 'jh', ञ: 'ñ', ट: 'ṭ', ठ: 'ṭh', ड: 'ḍ', ढ: 'ḍh', ण: 'ṇ', त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n', प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm', य: 'y', र: 'r', ल: 'l', व: 'v', श: 'ś', ष: 'ṣ', स: 's', ह: 'h' }
const VOW: Record<string, string> = { अ: 'a', आ: 'ā', इ: 'i', ई: 'ī', उ: 'u', ऊ: 'ū', ऋ: 'ṛ', ॠ: 'ṝ', ऌ: 'ḷ', ए: 'e', ऐ: 'ai', ओ: 'o', औ: 'au' }
const MAT: Record<string, string> = { 'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū', 'ृ': 'ṛ', 'ॄ': 'ṝ', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au' }

export function iast(s: string): string {
  let o = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (CONS[c]) {
      o += CONS[c]
      const n = s[i + 1]
      if (MAT[n]) { o += MAT[n]; i++ } else if (n === '्') { i++ } else { o += 'a' }
    } else if (VOW[c]) o += VOW[c]
    else if (c === 'ं') o += 'ṃ'
    else if (c === 'ः') o += 'ḥ'
    else if (c === 'ँ') o += 'm̐'
    else if (c === 'ऽ') o += "'"
    else if (c === '।') o += ' |'
    else o += c
  }
  return o
}

const TSUP: Record<string, [string, string]> = { ख: ['क', '²'], ग: ['क', '³'], घ: ['क', '⁴'], छ: ['च', '²'], झ: ['ज', '²'], ठ: ['ट', '²'], ड: ['ट', '³'], ढ: ['ट', '⁴'], थ: ['त', '²'], द: ['त', '³'], ध: ['त', '⁴'], फ: ['प', '²'], ब: ['प', '³'], भ: ['प', '⁴'] }
const shift = (c: string, d: number) => {
  const k = c.charCodeAt(0)
  return k >= 0x0900 && k <= 0x094f && k !== 0x0964 && k !== 0x0965 ? String.fromCharCode(k + d) : c
}
const isMat = (c?: string) => !!c && c.charCodeAt(0) >= 0x093e && c.charCodeAt(0) <= 0x094d

export function toScript(s: string, sc: ScriptId): string {
  if (sc === 'deva' || !s) return s
  let o = ''
  if (sc === 'telu' || sc === 'knda') {
    const d = sc === 'telu' ? 0x300 : 0x380
    for (const c of s) o += shift(c, d)
    return o
  }
  // Tamil: no letters for aspirated/voiced stops, so add the conventional superscripts (க² க³ க⁴)
  for (let i = 0; i < s.length; i++) {
    const c = s[i], n = s[i + 1]
    if (TSUP[c]) {
      const b = shift(TSUP[c][0], 0x280), sup = TSUP[c][1]
      if (isMat(n)) { o += b + (n === 'ृ' ? '்ரு' : shift(n, 0x280)) + sup; i++ } else o += b + sup
    } else if (c === 'ृ') o += '்ரு'
    else if (c === 'ऋ') o += 'ரு'
    else if (c === 'ं') o += 'ம்'
    else if (c === 'ः') o += 'ஃ'
    else o += shift(c, 0x280)
  }
  return o
}

/** Convert stem and ending separately but keep Tamil superscripts with their syllable. */
export function splitScript(stem: string, end: string, sc: ScriptId): [string, string] {
  if (sc !== 'taml') return [toScript(stem, sc), toScript(end, sc)]
  const full = toScript(stem + end, sc)
  let s = toScript(stem, sc)
  if (!full.startsWith(s)) s = s.replace(/[²³⁴]$/, '')
  return full.startsWith(s) ? [s, full.slice(s.length)] : ['', full]
}
