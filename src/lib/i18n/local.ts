/**
 * Telugu, Kannada and Tamil translations of the phrase sentences, conjugated for
 * person × number × gender × tense, plus pronouns, gender words, situation titles.
 *
 * Each verb is a handful of stems; endings are attached by table. Stems end in a consonant
 * letter with its inherent "a", so a vowel sign ending (ా, ೆ, ே …) replaces that "a".
 * Present (लट्) uses the progressive in Telugu/Kannada ("am going"), because their simple
 * present is also their future (लृट्). Tamil has a distinct present and future.
 */
import type { Gender, Num, PersonId, WhenId } from '../grammar/types'
import type { Subject } from '../grammar/subjects'

export type LocalLang = 'te' | 'kn' | 'ta'
type Slot = '1s' | '1p' | '2s' | '2p' | '3m' | '3f' | '3p'

const slotOf = (s: { per: PersonId; num: Num; gen: Gender }): Slot =>
  s.per === 'u' ? (s.num === 0 ? '1s' : '1p')
    : s.per === 'm' ? (s.num === 0 ? '2s' : '2p')
      : s.per === 'r' ? '2p'
        : s.num === 0 ? (s.gen === 'm' ? '3m' : '3f') : '3p'

// ── pronouns ─────────────────────────────────────────────────────────────
const PRON: Record<LocalLang, Record<PersonId, Record<Gender, string[]>>> = {
  te: {
    u: { m: ['నేను', 'మేమిద్దరం', 'మేము'], f: ['నేను', 'మేమిద్దరం', 'మేము'] },
    m: { m: ['నువ్వు', 'మీరిద్దరూ', 'మీరు'], f: ['నువ్వు', 'మీరిద్దరూ', 'మీరు'] },
    r: { m: ['మీరు', 'మీరిద్దరూ', 'మీరందరూ'], f: ['మీరు', 'మీరిద్దరూ', 'మీరందరూ'] },
    p: { m: ['అతను', 'వాళ్ళిద్దరూ', 'వాళ్ళు'], f: ['ఆమె', 'వాళ్ళిద్దరూ', 'వాళ్ళు'] },
  },
  kn: {
    u: { m: ['ನಾನು', 'ನಾವಿಬ್ಬರು', 'ನಾವು'], f: ['ನಾನು', 'ನಾವಿಬ್ಬರು', 'ನಾವು'] },
    m: { m: ['ನೀನು', 'ನೀವಿಬ್ಬರು', 'ನೀವು'], f: ['ನೀನು', 'ನೀವಿಬ್ಬರು', 'ನೀವು'] },
    r: { m: ['ನೀವು', 'ನೀವಿಬ್ಬರು', 'ನೀವೆಲ್ಲರೂ'], f: ['ನೀವು', 'ನೀವಿಬ್ಬರು', 'ನೀವೆಲ್ಲರೂ'] },
    p: { m: ['ಅವನು', 'ಅವರಿಬ್ಬರು', 'ಅವರು'], f: ['ಅವಳು', 'ಅವರಿಬ್ಬರು', 'ಅವರು'] },
  },
  ta: {
    u: { m: ['நான்', 'நாங்கள் இருவரும்', 'நாங்கள்'], f: ['நான்', 'நாங்கள் இருவரும்', 'நாங்கள்'] },
    m: { m: ['நீ', 'நீங்கள் இருவரும்', 'நீங்கள்'], f: ['நீ', 'நீங்கள் இருவரும்', 'நீங்கள்'] },
    r: { m: ['நீங்கள்', 'நீங்கள் இருவரும்', 'நீங்கள் அனைவரும்'], f: ['நீங்கள்', 'நீங்கள் இருவரும்', 'நீங்கள் அனைவரும்'] },
    p: { m: ['அவன்', 'அவர்கள் இருவரும்', 'அவர்கள்'], f: ['அவள்', 'அவர்கள் இருவரும்', 'அவர்கள்'] },
  },
}
const RESP: Record<LocalLang, Record<Gender, string>> = { te: { m: 'అయ్యా', f: 'అమ్మా' }, kn: { m: 'ಸರ್', f: 'ಮೇಡಂ' }, ta: { m: 'ஐயா', f: 'அம்மா' } }

/** "మీరు (అయ్యా)" — the subject as shown in the bar. */
export function pronounLabel(lang: LocalLang, s: Subject): string {
  const p = PRON[lang][s.per][s.gen][s.num]
  return s.per === 'r' ? `${p} (${RESP[lang][s.gen]})` : p
}

export const GENDER_WORDS: Record<LocalLang, Record<Gender, string[]>> = {
  te: { m: ['ఒక మగవాడు', 'ఇద్దరు మగవాళ్ళు', 'మగవాళ్ళు'], f: ['ఒక ఆడమనిషి', 'ఇద్దరు ఆడవాళ్ళు', 'ఆడవాళ్ళు'] },
  kn: { m: ['ಒಬ್ಬ ಗಂಡಸು', 'ಇಬ್ಬರು ಗಂಡಸರು', 'ಗಂಡಸರು'], f: ['ಒಬ್ಬ ಹೆಂಗಸು', 'ಇಬ್ಬರು ಹೆಂಗಸರು', 'ಹೆಂಗಸರು'] },
  ta: { m: ['ஓர் ஆண்', 'இரண்டு ஆண்கள்', 'ஆண்கள்'], f: ['ஒரு பெண்', 'இரண்டு பெண்கள்', 'பெண்கள்'] },
}

export const SITUATIONS: Record<string, Record<LocalLang, string>> = {
  'Morning at home': { te: 'ఇంట్లో ఉదయం', kn: 'ಮನೆಯಲ್ಲಿ ಬೆಳಗ್ಗೆ', ta: 'வீட்டில் காலை' },
  'Going out': { te: 'బయటకు', kn: 'ಹೊರಗೆ', ta: 'வெளியே' },
  Food: { te: 'భోజనం', kn: 'ಊಟ', ta: 'உணவு' },
  Talking: { te: 'మాటలు', kn: 'ಮಾತುಕತೆ', ta: 'பேச்சு' },
  Work: { te: 'పని', kn: 'ಕೆಲಸ', ta: 'வேலை' },
  'More everyday': { te: 'మరికొన్ని', kn: 'ಇನ್ನಷ್ಟು', ta: 'மேலும் சில' },
}

// ── Telugu ───────────────────────────────────────────────────────────────
// hab: habitual/future stem ending in ా (వెళ్తా-ను), habF: 3rd sg. non-masculine (వెళ్తుంది),
// past / pastF likewise, let: stem for "-నివ్వు" (let him …), should: "-ాలి" form,
// imp / impPl: "వెళ్ళు" / "వెళ్ళండి", hort: "let's" (వెళ్దాం).
type TeV = { hab: string; habF: string; past: string; pastF: string; let: string; should: string; imp: string; impPl: string; hort: string }
const TE: Record<string, TeV> = {
  getup: { hab: 'లేస్తా', habF: 'లేస్తుంది', past: 'లేచా', pastF: 'లేచింది', let: 'లేవ', should: 'లేవాలి', imp: 'లే', impPl: 'లేవండి', hort: 'లేద్దాం' },
  wash: { hab: 'కడుగుతా', habF: 'కడుగుతుంది', past: 'కడిగా', pastF: 'కడిగింది', let: 'కడగ', should: 'కడగాలి', imp: 'కడుగు', impPl: 'కడగండి', hort: 'కడుగుదాం' },
  drink: { hab: 'తాగుతా', habF: 'తాగుతుంది', past: 'తాగా', pastF: 'తాగింది', let: 'తాగ', should: 'తాగాలి', imp: 'తాగు', impPl: 'తాగండి', hort: 'తాగుదాం' },
  read: { hab: 'చదువుతా', habF: 'చదువుతుంది', past: 'చదివా', pastF: 'చదివింది', let: 'చదవ', should: 'చదవాలి', imp: 'చదువు', impPl: 'చదవండి', hort: 'చదువుదాం' },
  go: { hab: 'వెళ్తా', habF: 'వెళ్తుంది', past: 'వెళ్ళా', pastF: 'వెళ్ళింది', let: 'వెళ్ళ', should: 'వెళ్ళాలి', imp: 'వెళ్ళు', impPl: 'వెళ్ళండి', hort: 'వెళ్దాం' },
  come: { hab: 'వస్తా', habF: 'వస్తుంది', past: 'వచ్చా', pastF: 'వచ్చింది', let: 'రా', should: 'రావాలి', imp: 'రా', impPl: 'రండి', hort: 'వద్దాం' },
  walk: { hab: 'నడుస్తా', habF: 'నడుస్తుంది', past: 'నడిచా', pastF: 'నడిచింది', let: 'నడవ', should: 'నడవాలి', imp: 'నడువు', impPl: 'నడవండి', hort: 'నడుద్దాం' },
  eat: { hab: 'తింటా', habF: 'తింటుంది', past: 'తిన్నా', pastF: 'తిన్నది', let: 'తిన', should: 'తినాలి', imp: 'తిను', impPl: 'తినండి', hort: 'తిందాం' },
  bring: { hab: 'తెస్తా', habF: 'తెస్తుంది', past: 'తెచ్చా', pastF: 'తెచ్చింది', let: 'తే', should: 'తేవాలి', imp: 'తీసుకురా', impPl: 'తీసుకురండి', hort: 'తెద్దాం' },
  speak: { hab: 'మాట్లాడుతా', habF: 'మాట్లాడుతుంది', past: 'మాట్లాడా', pastF: 'మాట్లాడింది', let: 'మాట్లాడ', should: 'మాట్లాడాలి', imp: 'మాట్లాడు', impPl: 'మాట్లాడండి', hort: 'మాట్లాడదాం' },
  ask: { hab: 'అడుగుతా', habF: 'అడుగుతుంది', past: 'అడిగా', pastF: 'అడిగింది', let: 'అడగ', should: 'అడగాలి', imp: 'అడుగు', impPl: 'అడగండి', hort: 'అడుగుదాం' },
  tell: { hab: 'చెప్తా', habF: 'చెప్తుంది', past: 'చెప్పా', pastF: 'చెప్పింది', let: 'చెప్ప', should: 'చెప్పాలి', imp: 'చెప్పు', impPl: 'చెప్పండి', hort: 'చెబుదాం' },
  do: { hab: 'చేస్తా', habF: 'చేస్తుంది', past: 'చేశా', pastF: 'చేసింది', let: 'చేయ', should: 'చేయాలి', imp: 'చెయ్యి', impPl: 'చేయండి', hort: 'చేద్దాం' },
  know: { hab: 'తెలుసుకుంటా', habF: 'తెలుసుకుంటుంది', past: 'తెలుసుకున్నా', pastF: 'తెలుసుకుంది', let: 'తెలుసుకో', should: 'తెలుసుకోవాలి', imp: 'తెలుసుకో', impPl: 'తెలుసుకోండి', hort: 'తెలుసుకుందాం' },
  write: { hab: 'రాస్తా', habF: 'రాస్తుంది', past: 'రాశా', pastF: 'రాసింది', let: 'రాయ', should: 'రాయాలి', imp: 'రాయి', impPl: 'రాయండి', hort: 'రాద్దాం' },
  get: { hab: 'పొందుతా', habF: 'పొందుతుంది', past: 'పొందా', pastF: 'పొందింది', let: 'పొంద', should: 'పొందాలి', imp: 'పొందు', impPl: 'పొందండి', hort: 'పొందుదాం' },
  sit: { hab: 'కూర్చుంటా', habF: 'కూర్చుంటుంది', past: 'కూర్చున్నా', pastF: 'కూర్చుంది', let: 'కూర్చో', should: 'కూర్చోవాలి', imp: 'కూర్చో', impPl: 'కూర్చోండి', hort: 'కూర్చుందాం' },
  see: { hab: 'చూస్తా', habF: 'చూస్తుంది', past: 'చూశా', pastF: 'చూసింది', let: 'చూడ', should: 'చూడాలి', imp: 'చూడు', impPl: 'చూడండి', hort: 'చూద్దాం' },
}
const TE_END: Record<Exclude<Slot, '3f'>, string> = { '1s': 'ను', '1p': 'ము', '2s': 'వు', '2p': 'రు', '3m': 'డు', '3p': 'రు' }
const TE_OBJ: Record<string, string> = { u0: 'నన్ను', pm0: 'అతన్ని', pf0: 'ఆమెను', p1: 'వాళ్ళిద్దర్నీ', p2: 'వాళ్ళని' }

// Spoken Telugu drops the final syllable of the person ending: వెళ్తున్నా, వెళ్తున్నాం, వెళ్తున్నావ్.
const TE_END_SP: Record<Exclude<Slot, '3f'>, string> = { '1s': '', '1p': 'ం', '2s': 'వ్', '2p': 'రు', '3m': 'డు', '3p': 'రు' }
function teVerb(v: TeV, slot: Slot, when: WhenId, sp = false): string {
  const prog = v.hab.slice(0, -1) + 'ున్నా', progF = v.habF.replace(/ుంది$/, 'ోంది')
  const [stem, fem] = when === 'lat' ? [prog, progF] : when === 'lrt' ? [v.hab, v.habF] : [v.past, v.pastF]
  return slot === '3f' ? fem : stem + (sp ? TE_END_SP : TE_END)[slot]
}
function teLine(v: TeV, s: Subject, when: WhenId, tail: string, sp = false): string {
  const slot = slotOf(s)
  let subj = PRON.te[s.per][s.gen][s.num]
  if (sp) subj = subj.replace(/^మేము$/, 'మేం').replace(/^మీరు$/, 'మీరు')
  if (when === 'vidhi') return join([subj, tail, v.should]) + '.'
  if (when === 'lot') {
    if (s.per === 'm') return join([s.num ? subj : '', tail, s.num ? v.impPl : v.imp]) + '!'
    if (s.per === 'r') return join(['దయచేసి', tail, v.impPl]) + '.'
    if (s.per === 'u') return s.num ? join([s.num === 1 ? 'మనిద్దరం' : 'మనం', tail, v.hort]) + '.' : join([TE_OBJ.u0, tail, v.let + 'నివ్వు']) + '.'
    return join([TE_OBJ[s.num ? 'p' + s.num : 'p' + s.gen + '0'], tail, v.let + 'నివ్వు']) + '.'
  }
  return join([subj, tail, teVerb(v, slot, when, sp)]) + '.'
}

// ── Kannada ──────────────────────────────────────────────────────────────
// pr: present/future stem ending in ತ್ತ (ಹೋಗುತ್ತ-ೇನೆ), past: ಹೋದ-ೆ, base: ಹೋಗ (ಹೋಗಲಿ, ಹೋಗಬೇಕು, ಹೋಗೋಣ),
// imp / impPl: ಹೋಗು / ಹೋಗಿ.
type KnV = { pr: string; past: string; base: string; imp: string; impPl: string }
const KN: Record<string, KnV> = {
  getup: { pr: 'ಏಳುತ್ತ', past: 'ಎದ್ದ', base: 'ಏಳ', imp: 'ಏಳು', impPl: 'ಏಳಿ' },
  wash: { pr: 'ತೊಳೆಯುತ್ತ', past: 'ತೊಳೆದ', base: 'ತೊಳೆಯ', imp: 'ತೊಳೆ', impPl: 'ತೊಳೆಯಿರಿ' },
  drink: { pr: 'ಕುಡಿಯುತ್ತ', past: 'ಕುಡಿದ', base: 'ಕುಡಿಯ', imp: 'ಕುಡಿ', impPl: 'ಕುಡಿಯಿರಿ' },
  read: { pr: 'ಓದುತ್ತ', past: 'ಓದಿದ', base: 'ಓದ', imp: 'ಓದು', impPl: 'ಓದಿ' },
  go: { pr: 'ಹೋಗುತ್ತ', past: 'ಹೋದ', base: 'ಹೋಗ', imp: 'ಹೋಗು', impPl: 'ಹೋಗಿ' },
  come: { pr: 'ಬರುತ್ತ', past: 'ಬಂದ', base: 'ಬರ', imp: 'ಬಾ', impPl: 'ಬನ್ನಿ' },
  walk: { pr: 'ನಡೆಯುತ್ತ', past: 'ನಡೆದ', base: 'ನಡೆಯ', imp: 'ನಡೆ', impPl: 'ನಡೆಯಿರಿ' },
  eat: { pr: 'ತಿನ್ನುತ್ತ', past: 'ತಿಂದ', base: 'ತಿನ್ನ', imp: 'ತಿನ್ನು', impPl: 'ತಿನ್ನಿ' },
  bring: { pr: 'ತರುತ್ತ', past: 'ತಂದ', base: 'ತರ', imp: 'ತಾ', impPl: 'ತನ್ನಿ' },
  speak: { pr: 'ಮಾತನಾಡುತ್ತ', past: 'ಮಾತನಾಡಿದ', base: 'ಮಾತನಾಡ', imp: 'ಮಾತನಾಡು', impPl: 'ಮಾತನಾಡಿ' },
  ask: { pr: 'ಕೇಳುತ್ತ', past: 'ಕೇಳಿದ', base: 'ಕೇಳ', imp: 'ಕೇಳು', impPl: 'ಕೇಳಿ' },
  tell: { pr: 'ಹೇಳುತ್ತ', past: 'ಹೇಳಿದ', base: 'ಹೇಳ', imp: 'ಹೇಳು', impPl: 'ಹೇಳಿ' },
  do: { pr: 'ಮಾಡುತ್ತ', past: 'ಮಾಡಿದ', base: 'ಮಾಡ', imp: 'ಮಾಡು', impPl: 'ಮಾಡಿ' },
  know: { pr: 'ತಿಳಿದುಕೊಳ್ಳುತ್ತ', past: 'ತಿಳಿದುಕೊಂಡ', base: 'ತಿಳಿದುಕೊಳ್ಳ', imp: 'ತಿಳಿದುಕೊ', impPl: 'ತಿಳಿದುಕೊಳ್ಳಿ' },
  write: { pr: 'ಬರೆಯುತ್ತ', past: 'ಬರೆದ', base: 'ಬರೆಯ', imp: 'ಬರೆ', impPl: 'ಬರೆಯಿರಿ' },
  get: { pr: 'ಪಡೆಯುತ್ತ', past: 'ಪಡೆದ', base: 'ಪಡೆಯ', imp: 'ಪಡೆ', impPl: 'ಪಡೆಯಿರಿ' },
  sit: { pr: 'ಕುಳಿತುಕೊಳ್ಳುತ್ತ', past: 'ಕುಳಿತುಕೊಂಡ', base: 'ಕುಳಿತುಕೊಳ್ಳ', imp: 'ಕುಳಿತುಕೊ', impPl: 'ಕುಳಿತುಕೊಳ್ಳಿ' },
  see: { pr: 'ನೋಡುತ್ತ', past: 'ನೋಡಿದ', base: 'ನೋಡ', imp: 'ನೋಡು', impPl: 'ನೋಡಿ' },
}
// Spoken (Bengaluru) Kannada: ಹೋಗ್ತಿದ್ದೀನಿ, ಹೋಗ್ತೀನಿ, ಹೋದ್ವಿ — a short stem per verb and the spoken endings.
const KN_SP: Record<string, string> = {
  getup: 'ಏಳ್ತ', wash: 'ತೊಳಿತ', drink: 'ಕುಡಿತ', read: 'ಓದ್ತ', go: 'ಹೋಗ್ತ', come: 'ಬರ್ತ', walk: 'ನಡಿತ', eat: 'ತಿನ್ತ', bring: 'ತರ್ತ',
  speak: 'ಮಾತಾಡ್ತ', ask: 'ಕೇಳ್ತ', tell: 'ಹೇಳ್ತ', do: 'ಮಾಡ್ತ', know: 'ತಿಳ್ಕೊಳ್ತ', write: 'ಬರಿತ', get: 'ಪಡಿತ', sit: 'ಕೂತ್ಕೊಳ್ತ', see: 'ನೋಡ್ತ',
}
const KN_PR_SP: Record<Slot, string> = { '1s': 'ೀನಿ', '1p': 'ೀವಿ', '2s': 'ೀಯ', '2p': 'ೀರ', '3m': 'ಾನೆ', '3f': 'ಾಳೆ', '3p': 'ಾರೆ' }
const KN_PROG_SP: Record<Slot, string> = { '1s': 'ಿದ್ದೀನಿ', '1p': 'ಿದ್ದೀವಿ', '2s': 'ಿದ್ದೀಯ', '2p': 'ಿದ್ದೀರ', '3m': 'ಿದ್ದಾನೆ', '3f': 'ಿದ್ದಾಳೆ', '3p': 'ಿದ್ದಾರೆ' }
const KN_PAST_SP: Record<Slot, string> = { '1s': 'ೆ', '1p': '್ವಿ', '2s': 'ೆ', '2p': '್ರಿ', '3m': '', '3f': '್ಳು', '3p': '್ರು' }
const KN_PR: Record<Slot, string> = { '1s': 'ೇನೆ', '1p': 'ೇವೆ', '2s': 'ೀಯ', '2p': 'ೀರಿ', '3m': 'ಾನೆ', '3f': 'ಾಳೆ', '3p': 'ಾರೆ' }
const KN_PAST: Record<Slot, string> = { '1s': 'ೆ', '1p': 'ೆವು', '2s': 'ೆ', '2p': 'ಿರಿ', '3m': 'ನು', '3f': 'ಳು', '3p': 'ರು' }

function knLine(v: KnV, s: Subject, when: WhenId, tail: string, sp = false, key = ''): string {
  const subj = PRON.kn[s.per][s.gen][s.num], slot = slotOf(s)
  const spStem = sp ? KN_SP[key] : undefined
  if (when === 'vidhi') return join([subj, tail, v.base + 'ಬೇಕು']) + '.'
  if (when === 'lot') {
    if (s.per === 'm') return join([s.num ? subj : '', tail, s.num ? v.impPl : v.imp]) + '!'
    if (s.per === 'r') return join(['ದಯವಿಟ್ಟು', tail, v.impPl]) + '.'
    if (s.per === 'u' && s.num) return join([s.num === 1 ? 'ನಾವಿಬ್ಬರೂ' : 'ನಾವು', tail, v.base + 'ೋಣ']) + '.'
    return join([subj, tail, v.base + 'ಲಿ']) + '.'
  }
  const verb = spStem
    ? (when === 'lat' ? spStem + KN_PROG_SP[slot] : when === 'lrt' ? spStem + KN_PR_SP[slot] : v.past + KN_PAST_SP[slot])
    : (when === 'lat' ? v.pr + 'ಿದ್ದ' + KN_PR[slot] : when === 'lrt' ? v.pr + KN_PR[slot] : v.past + KN_PAST[slot])
  return join([subj, tail, verb]) + '.'
}

// ── Tamil ────────────────────────────────────────────────────────────────
// pres: போகிற-ேன், fut: போவ-ேன், past: போன-ேன், base: போக (போகட்டும், போக வேண்டும், போகலாம்),
// imp / impPl: போ / போங்கள்.
type TaV = { pres: string; fut: string; past: string; base: string; imp: string; impPl: string }
const TA: Record<string, TaV> = {
  getup: { pres: 'எழுகிற', fut: 'எழுவ', past: 'எழுந்த', base: 'எழ', imp: 'எழு', impPl: 'எழுங்கள்' },
  wash: { pres: 'கழுவுகிற', fut: 'கழுவுவ', past: 'கழுவின', base: 'கழுவ', imp: 'கழுவு', impPl: 'கழுவுங்கள்' },
  drink: { pres: 'குடிக்கிற', fut: 'குடிப்ப', past: 'குடித்த', base: 'குடிக்க', imp: 'குடி', impPl: 'குடியுங்கள்' },
  read: { pres: 'படிக்கிற', fut: 'படிப்ப', past: 'படித்த', base: 'படிக்க', imp: 'படி', impPl: 'படியுங்கள்' },
  go: { pres: 'போகிற', fut: 'போவ', past: 'போன', base: 'போக', imp: 'போ', impPl: 'போங்கள்' },
  come: { pres: 'வருகிற', fut: 'வருவ', past: 'வந்த', base: 'வர', imp: 'வா', impPl: 'வாருங்கள்' },
  walk: { pres: 'நடக்கிற', fut: 'நடப்ப', past: 'நடந்த', base: 'நடக்க', imp: 'நட', impPl: 'நடங்கள்' },
  eat: { pres: 'சாப்பிடுகிற', fut: 'சாப்பிடுவ', past: 'சாப்பிட்ட', base: 'சாப்பிட', imp: 'சாப்பிடு', impPl: 'சாப்பிடுங்கள்' },
  bring: { pres: 'கொண்டுவருகிற', fut: 'கொண்டுவருவ', past: 'கொண்டுவந்த', base: 'கொண்டுவர', imp: 'கொண்டுவா', impPl: 'கொண்டுவாருங்கள்' },
  speak: { pres: 'பேசுகிற', fut: 'பேசுவ', past: 'பேசின', base: 'பேச', imp: 'பேசு', impPl: 'பேசுங்கள்' },
  ask: { pres: 'கேட்கிற', fut: 'கேட்ப', past: 'கேட்ட', base: 'கேட்க', imp: 'கேள்', impPl: 'கேளுங்கள்' },
  tell: { pres: 'சொல்கிற', fut: 'சொல்வ', past: 'சொன்ன', base: 'சொல்ல', imp: 'சொல்', impPl: 'சொல்லுங்கள்' },
  do: { pres: 'செய்கிற', fut: 'செய்வ', past: 'செய்த', base: 'செய்ய', imp: 'செய்', impPl: 'செய்யுங்கள்' },
  know: { pres: 'தெரிந்துகொள்கிற', fut: 'தெரிந்துகொள்வ', past: 'தெரிந்துகொண்ட', base: 'தெரிந்துகொள்ள', imp: 'தெரிந்துகொள்', impPl: 'தெரிந்துகொள்ளுங்கள்' },
  write: { pres: 'எழுதுகிற', fut: 'எழுதுவ', past: 'எழுதின', base: 'எழுத', imp: 'எழுது', impPl: 'எழுதுங்கள்' },
  get: { pres: 'பெறுகிற', fut: 'பெறுவ', past: 'பெற்ற', base: 'பெற', imp: 'பெறு', impPl: 'பெறுங்கள்' },
  sit: { pres: 'உட்கார்கிற', fut: 'உட்காருவ', past: 'உட்கார்ந்த', base: 'உட்கார', imp: 'உட்கார்', impPl: 'உட்காருங்கள்' },
  see: { pres: 'பார்க்கிற', fut: 'பார்ப்ப', past: 'பார்த்த', base: 'பார்க்க', imp: 'பார்', impPl: 'பாருங்கள்' },
}
// Spoken (Chennai) Tamil: போறேன், போறீங்க, போனாங்க; நீங்க, அவங்க; போகணும்.
const TA_SP: Record<string, { pres: string; past?: string }> = {
  getup: { pres: 'எழுந்திருக்கற' }, wash: { pres: 'கழுவற' }, drink: { pres: 'குடிக்கற', past: 'குடிச்ச' }, read: { pres: 'படிக்கற', past: 'படிச்ச' },
  go: { pres: 'போற' }, come: { pres: 'வர்ற' }, walk: { pres: 'நடக்கற' }, eat: { pres: 'சாப்பிடற' }, bring: { pres: 'கொண்டுவர்ற' },
  speak: { pres: 'பேசற' }, ask: { pres: 'கேக்கற' }, tell: { pres: 'சொல்ற' }, do: { pres: 'செய்ற' }, know: { pres: 'தெரிஞ்சுக்கற', past: 'தெரிஞ்சுக்கிட்ட' },
  write: { pres: 'எழுதற' }, get: { pres: 'வாங்கற', past: 'வாங்கின' }, sit: { pres: 'உக்கார்ற', past: 'உக்காந்த' }, see: { pres: 'பாக்கற', past: 'பாத்த' },
}
const TA_END_SP: Record<Slot, string> = { '1s': 'ேன்', '1p': 'ோம்', '2s': 'ே', '2p': 'ீங்க', '3m': 'ான்', '3f': 'ா', '3p': 'ாங்க' }
const TA_PRON_SP: Record<string, string> = { 'நாங்கள்': 'நாங்க', 'நாங்கள் இருவரும்': 'நாங்க ரெண்டு பேரும்', 'நீங்கள்': 'நீங்க', 'நீங்கள் இருவரும்': 'நீங்க ரெண்டு பேரும்', 'நீங்கள் அனைவரும்': 'நீங்க எல்லாரும்', 'அவர்கள்': 'அவங்க', 'அவர்கள் இருவரும்': 'அவங்க ரெண்டு பேரும்' }
const TA_END: Record<Slot, string> = { '1s': 'ேன்', '1p': 'ோம்', '2s': 'ாய்', '2p': 'ீர்கள்', '3m': 'ான்', '3f': 'ாள்', '3p': 'ார்கள்' }

function taLine(v: TaV, s: Subject, when: WhenId, tail: string, sp = false, key = ''): string {
  const slot = slotOf(s)
  let subj = PRON.ta[s.per][s.gen][s.num]
  if (sp) subj = TA_PRON_SP[subj] || subj
  if (when === 'vidhi') return sp ? join([subj, tail, v.base + 'ணும்']) + '.' : join([subj, tail, v.base, 'வேண்டும்']) + '.'
  if (when === 'lot') {
    const impPl = sp ? v.impPl.replace(/ங்கள்$/, 'ங்க') : v.impPl
    if (s.per === 'm') return join([s.num ? subj : '', tail, s.num ? impPl : v.imp]) + '!'
    if (s.per === 'r' && sp) return join([tail, impPl]) + '.'
    if (s.per === 'r') return join(['தயவுசெய்து', tail, v.impPl]) + '.'
    if (s.per === 'u' && s.num) return join([s.num === 1 ? 'நாம் இருவரும்' : 'நாம்', tail, v.base + 'லாம்']) + '.'
    return join([subj, tail, v.base + 'ட்டும்']) + '.'
  }
  if (sp) {
    const x = TA_SP[key]
    const stem = when === 'lat' ? x?.pres || v.pres : when === 'lrt' ? v.fut : x?.past || v.past
    return join([subj, tail, stem + TA_END_SP[slot]]) + '.'
  }
  const stem = when === 'lat' ? v.pres : when === 'lrt' ? v.fut : v.past
  return join([subj, tail, stem + TA_END[slot]]) + '.'
}

const join = (xs: string[]) => xs.filter(Boolean).join(' ')

// ── phrases ──────────────────────────────────────────────────────────────
/** Keyed by "<english base>|<english tail>"; [verb, tail] per language. */
type P = Record<LocalLang, [string, string]>
export const PHRASES: Record<string, P> = {
  'go|': { te: ['go', ''], kn: ['go', ''], ta: ['go', ''] },
  'get up|early': { te: ['getup', 'పొద్దున్నే'], kn: ['getup', 'ಬೇಗ'], ta: ['getup', 'சீக்கிரம்'] },
  'wash|the face': { te: ['wash', 'ముఖం'], kn: ['wash', 'ಮುಖ'], ta: ['wash', 'முகம்'] },
  'drink|tea': { te: ['drink', 'టీ'], kn: ['drink', 'ಚಹಾ'], ta: ['drink', 'தேநீர்'] },
  'read|the newspaper': { te: ['read', 'వార్తాపత్రిక'], kn: ['read', 'ಪತ್ರಿಕೆ'], ta: ['read', 'செய்தித்தாள்'] },
  'go|to school': { te: ['go', 'బడికి'], kn: ['go', 'ಶಾಲೆಗೆ'], ta: ['go', 'பள்ளிக்குப்'] },
  'go|to the shop': { te: ['go', 'అంగడికి'], kn: ['go', 'ಅಂಗಡಿಗೆ'], ta: ['go', 'கடைக்குப்'] },
  'come|home': { te: ['come', 'ఇంటికి'], kn: ['come', 'ಮನೆಗೆ'], ta: ['come', 'வீட்டுக்கு'] },
  'walk|in the garden': { te: ['walk', 'తోటలో'], kn: ['walk', 'ಉದ್ಯಾನದಲ್ಲಿ'], ta: ['walk', 'தோட்டத்தில்'] },
  'eat|rice': { te: ['eat', 'అన్నం'], kn: ['eat', 'ಅನ್ನ'], ta: ['eat', 'சோறு'] },
  'cook|food': { te: ['do', 'వంట'], kn: ['do', 'ಅಡುಗೆ'], ta: ['do', 'சமையல்'] },
  'bring|water': { te: ['bring', 'నీళ్ళు'], kn: ['bring', 'ನೀರು'], ta: ['bring', 'தண்ணீர்'] },
  'drink|milk': { te: ['drink', 'పాలు'], kn: ['drink', 'ಹಾಲು'], ta: ['drink', 'பால்'] },
  'speak|Sanskrit': { te: ['speak', 'సంస్కృతం'], kn: ['speak', 'ಸಂಸ್ಕೃತ'], ta: ['speak', 'சமஸ்கிருதம்'] },
  'talk|in Sanskrit': { te: ['speak', 'సంస్కృతంలో'], kn: ['speak', 'ಸಂಸ್ಕೃತದಲ್ಲಿ'], ta: ['speak', 'சமஸ்கிருதத்தில்'] },
  'ask|a question': { te: ['ask', 'ఒక ప్రశ్న'], kn: ['ask', 'ಒಂದು ಪ್ರಶ್ನೆ'], ta: ['ask', 'ஒரு கேள்வி'] },
  'tell|a story': { te: ['tell', 'ఒక కథ'], kn: ['tell', 'ಒಂದು ಕಥೆ'], ta: ['tell', 'ஒரு கதை'] },
  'do|the work': { te: ['do', 'పని'], kn: ['do', 'ಕೆಲಸ'], ta: ['do', 'வேலை'] },
  'know|the answer': { te: ['know', 'సమాధానం'], kn: ['know', 'ಉತ್ತರವನ್ನು'], ta: ['know', 'பதிலைத்'] },
  'write|a letter': { te: ['write', 'ఒక ఉత్తరం'], kn: ['write', 'ಒಂದು ಪತ್ರ'], ta: ['write', 'ஒரு கடிதம்'] },
  'get|the salary': { te: ['get', 'జీతం'], kn: ['get', 'ಸಂಬಳ'], ta: ['get', 'சம்பளம்'] },
  'sit|here': { te: ['sit', 'ఇక్కడ'], kn: ['sit', 'ಇಲ್ಲಿ'], ta: ['sit', 'இங்கே'] },
  'read|a book': { te: ['read', 'ఒక పుస్తకం'], kn: ['read', 'ಒಂದು ಪುಸ್ತಕ'], ta: ['read', 'ஒரு புத்தகம்'] },
  'see|the picture': { te: ['see', 'చిత్రం'], kn: ['see', 'ಚಿತ್ರ'], ta: ['see', 'படத்தைப்'] },
}

/** The sentence in Telugu / Kannada / Tamil, or null when the phrase has no translation yet. */
export type Style = 'written' | 'spoken'
/** The sentence in Telugu / Kannada / Tamil (written or everyday spoken style), or null when the phrase has no translation yet. */
export function localLine(lang: LocalLang, s: Subject, when: WhenId, e: { base: string; tail?: string | null; local?: Partial<Record<LocalLang, [string, string]>> | null }, style: Style = 'written'): string | null {
  const p = e.local?.[lang] || PHRASES[`${e.base}|${e.tail || ''}`]?.[lang]
  if (!p) return null
  const [verb, tail] = p, sp = style === 'spoken'
  if (lang === 'te') return TE[verb] ? teLine(TE[verb], s, when, tail, sp) : null
  if (lang === 'kn') return KN[verb] ? knLine(KN[verb], s, when, tail, sp, verb) : null
  return TA[verb] ? taLine(TA[verb], s, when, tail, sp, verb) : null
}

// ── verb meanings (everyday verbs) ───────────────────────────────────────
/** slug → [te, kn, ta] */
export const MEANINGS: Record<string, [string, string, string]> = {
  '01.1137': ['వెళ్ళు', 'ಹೋಗು', 'போ'],
  '01.1137-A': ['రా', 'ಬರು', 'வா'],
  '01.0381': ['చదువు', 'ಓದು', 'படி'],
  '01.1164': ['మాట్లాడు, చెప్పు', 'ಮಾತನಾಡು, ಹೇಳು', 'பேசு, சொல்'],
  '01.0051': ['తిను', 'ತಿನ್ನು', 'சாப்பிடு'],
  '01.1074': ['తాగు', 'ಕುಡಿ', 'குடி'],
  '01.1143': ['చూడు', 'ನೋಡು', 'பார்'],
  '01.0001': ['ఉండు, అవు', 'ಇರು, ಆಗು', 'இரு, ஆகு'],
  '01.1077': ['నిలబడు', 'ನಿಲ್ಲು', 'நில்'],
  '01.1077-ud': ['లేచు', 'ಏಳು', 'எழு'],
  '01.0924': ['నడుచు', 'ನಡೆ', 'நட'],
  '01.0685': ['పరుగెత్తు', 'ಓಡು', 'ஓடு'],
  '01.0405': ['ఆడు', 'ಆಡು', 'விளையாடு'],
  '01.0822': ['నవ్వు', 'ನಗು', 'சிரி'],
  '01.1136': ['నమస్కరించు', 'ನಮಸ್ಕರಿಸು', 'வணங்கு'],
  '01.0919': ['గుర్తుచేసుకో', 'ನೆನಪಿಸಿಕೊ', 'நினைவுகூர்'],
  '01.1049': ['తీసుకుపో', 'ಕರೆದೊಯ್ಯು', 'அழைத்துச் செல்'],
  '01.1049-A': ['తీసుకురా', 'ತರು', 'கொண்டுவா'],
  '01.0979': ['పడు', 'ಬೀಳು', 'விழு'],
  '01.0643': ['జీవించు', 'ಬದುಕು', 'வாழ்'],
  '01.0746': ['రక్షించు', 'ರಕ್ಷಿಸು', 'காப்பாற்று'],
  '01.1151': ['వండు', 'ಅಡುಗೆ ಮಾಡು', 'சமை'],
  '01.1141': ['విడిచిపెట్టు', 'ಬಿಡು', 'விடு'],
  '01.1160': ['నివసించు', 'ವಾಸಿಸು', 'வசி'],
  '04.0010': ['నాట్యం చేయు', 'ನರ್ತಿಸು', 'நடனமாடு'],
  '04.0146': ['కోపపడు', 'ಕೋಪಗೊಳ್ಳು', 'கோபப்படு'],
  '04.0081': ['సంతోషించు', 'ಸಂತೋಷಪಡು', 'மகிழ்'],
  '04.0091': ['నశించు', 'ನಾಶವಾಗು', 'அழி'],
  '06.0092': ['రాయు', 'ಬರೆ', 'எழுது'],
  '06.0078': ['కోరు', 'ಬಯಸು', 'விரும்பு'],
  '06.0149': ['అడుగు', 'ಕೇಳು', 'கேள்'],
  '06.0160-upa': ['కూర్చో', 'ಕುಳಿತುಕೊ', 'உட்கார்'],
  '06.0160-pra': ['ప్రవేశించు', 'ಪ್ರವೇಶಿಸು', 'நுழை'],
  '06.0165': ['కలుసుకో', 'ಭೇಟಿಯಾಗು', 'சந்தி'],
  '06.0005': ['విసురు', 'ಎಸೆ', 'எறி'],
  '06.0158': ['తాకు', 'ಮುಟ್ಟು', 'தொடு'],
  '06.0166': ['విడుదల చేయు', 'ಬಿಡುಗಡೆ ಮಾಡು', 'விடுவி'],
  '06.0170': ['చల్లు', 'ಚಿಮುಕಿಸು', 'தெளி'],
  '10.0389': ['చెప్పు', 'ಹೇಳು', 'சொல்'],
  '10.0002': ['ఆలోచించు', 'ಯೋಚಿಸು', 'யோசி'],
  '10.0144': ['పూజించు', 'ಪೂಜಿಸು', 'வழிபடு'],
  '10.0391': ['లెక్కించు', 'ಎಣಿಸು', 'எண்ணு'],
  '10.0033': ['భుజించు', 'ತಿನ್ನು', 'உண்'],
  '10.0098': ['పాలించు', 'ಪಾಲಿಸು', 'பராமரி'],
  '10.0001': ['దొంగిలించు', 'ಕದಿ', 'திருடு'],
  '10.0086-pra': ['కడుగు', 'ತೊಳೆ', 'கழுவு'],
  '01.1130': ['పొందు', 'ಪಡೆ', 'பெறு'],
  '01.0696': ['మాట్లాడు', 'ಮಾತನಾಡು', 'பேசு'],
  '01.0574': ['సేవించు', 'ಸೇವೆ ಮಾಡು', 'சேவை செய்'],
  '01.0863': ['పెరుగు', 'ಬೆಳೆ', 'வளர்'],
  '01.0016': ['ఆనందించు', 'ಆನಂದಿಸು', 'மகிழ்ச்சியடை'],
  '01.1001': ['అర్థించు', 'ಬೇಡು', 'வேண்டு'],
  '01.0694': ['చూడు', 'ನೋಡು', 'நோக்கு'],
  '01.0989': ['ఆనందించు', 'ಅನುಭವಿಸು', 'அனுபவி'],
  '01.0435': ['వణుకు', 'ನಡುಗು', 'நடுங்கு'],
  '01.0689': ['నేర్చుకో', 'ಕಲಿ', 'கற்றுக்கொள்'],
  '01.0011': ['అభివాదం చేయు', 'ವಂದಿಸು', 'வாழ்த்து'],
  '04.0073': ['భావించు', 'ಭಾವಿಸು', 'கருது'],
  '04.0044': ['పుట్టు', 'ಹುಟ್ಟು', 'பிற'],
  '04.0069': ['పోరాడు', 'ಹೋರಾಡು', 'போராடு'],
  '02.0060': ['ఉండు', 'ಇರು', 'இரு'],
  '08.0010': ['చేయు', 'ಮಾಡು', 'செய்'],
  '03.0010': ['ఇవ్వు', 'ಕೊಡು', 'கொடு'],
  '09.0043': ['తెలుసుకో', 'ತಿಳಿ', 'அறி'],
}
