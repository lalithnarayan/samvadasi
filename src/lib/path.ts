/**
 * The learning path: 30 units in five sections, from greetings to verses. Each unit is a selection
 * from the daily-practice pool (words by tag, verbs by their place in the everyday list, verses by
 * theme) plus a session plan. A unit counts as mastered when 80% of its items have reached box 2.
 */
import type { TodayPool } from './data'
import { type Plan, type Store } from './practice'

type Four = [string, string, string, string]
export type Unit = {
  n: number
  title: Four
  sa: string // a Sanskrit word or phrase that names the unit
  tags?: string[] // word tags: 'greet', 'pack:food', 'noun:home', 'avy:question'
  verbs?: [number, number] // 1-based range in the everyday verb list
  themes?: string[] // verse themes
  plan: Plan
}
export type Section = { title: Four; units: number[] }

const W: Plan = { words: 8, pairs: true, verbs: 0, verses: 0 }
const V = (tense: 'lat' | 'lrt' = 'lat'): Plan => ({ words: 0, pairs: false, verbs: 8, verses: 0, tense })
const S: Plan = { words: 0, pairs: false, verbs: 0, verses: 6 }

export const UNITS: Unit[] = [
  { n: 1, title: ['Hello and thank you', 'నమస్కారం, ధన్యవాదాలు', 'ನಮಸ್ಕಾರ, ಧನ್ಯವಾದ', 'வணக்கம், நன்றி'], sa: 'नमो नमः', tags: ['greet'], plan: W },
  { n: 2, title: ['Numbers', 'సంఖ్యలు', 'ಸಂಖ್ಯೆಗಳು', 'எண்கள்'], sa: 'एकम्', tags: ['pack:numbers'], plan: W },
  { n: 3, title: ['I go, you go, he goes', 'నేను, నువ్వు, అతను వెళ్తాం', 'ನಾನು, ನೀನು, ಅವನು ಹೋಗುವುದು', 'நான், நீ, அவன் போவது'], sa: 'गच्छति', verbs: [1, 4], plan: V() },
  { n: 4, title: ['Family', 'కుటుంబం', 'ಕುಟುಂಬ', 'குடும்பம்'], sa: 'माता', tags: ['pack:family', 'noun:family'], plan: W },
  { n: 5, title: ['Question words', 'ప్రశ్నార్థక పదాలు', 'ಪ್ರಶ್ನಾರ್ಥಕ ಪದಗಳು', 'வினாச்சொற்கள்'], sa: 'कुत्र', tags: ['avy:question', 'avy:yesno'], plan: W },
  { n: 6, title: ['Eat, drink, see', 'తిను, తాగు, చూడు', 'ತಿನ್ನು, ಕುಡಿ, ನೋಡು', 'உண், குடி, பார்'], sa: 'खादति', verbs: [5, 8], plan: V() },
  { n: 7, title: ['Food', 'ఆహారం', 'ಆಹಾರ', 'உணவு'], sa: 'अन्नम्', tags: ['pack:food', 'noun:food'], plan: W },
  { n: 8, title: ['At home', 'ఇంట్లో', 'ಮನೆಯಲ್ಲಿ', 'வீட்டில்'], sa: 'गृहम्', tags: ['noun:home'], plan: W },
  { n: 9, title: ['Time and days', 'సమయం, రోజులు', 'ಸಮಯ, ದಿನಗಳು', 'நேரம், நாட்கள்'], sa: 'अद्य', tags: ['pack:time', 'avy:time', 'noun:time'], plan: W },
  { n: 10, title: ['Stand, walk, run', 'నిలబడు, నడువు, పరుగెత్తు', 'ನಿಲ್ಲು, ನಡೆ, ಓಡು', 'நில், நட, ஓடு'], sa: 'धावति', verbs: [9, 12], plan: V() },
  { n: 11, title: ['Body', 'శరీరం', 'ದೇಹ', 'உடல்'], sa: 'हस्तः', tags: ['pack:body', 'noun:body'], plan: W },
  { n: 12, title: ['Where? Here, there', 'ఎక్కడ? ఇక్కడ, అక్కడ', 'ಎಲ್ಲಿ? ಇಲ್ಲಿ, ಅಲ್ಲಿ', 'எங்கே? இங்கே, அங்கே'], sa: 'अत्र', tags: ['pack:directions', 'avy:place'], plan: W },
  { n: 13, title: ['Places', 'ప్రదేశాలు', 'ಸ್ಥಳಗಳು', 'இடங்கள்'], sa: 'ग्रामः', tags: ['noun:place'], plan: W },
  { n: 14, title: ['Play, laugh, bow', 'ఆడు, నవ్వు, నమస్కరించు', 'ಆಡು, ನಗು, ನಮಿಸು', 'விளையாடு, சிரி, வணங்கு'], sa: 'क्रीडति', verbs: [13, 16], plan: V() },
  { n: 15, title: ['Little words: and, also, only', 'చిన్న పదాలు: మరియు, కూడా, మాత్రమే', 'ಸಣ್ಣ ಪದಗಳು: ಮತ್ತು, ಕೂಡ, ಮಾತ್ರ', 'சிறு சொற்கள்: மற்றும், கூட, மட்டும்'], sa: 'अपि', tags: ['avy:join', 'avy:manner'], plan: W },
  { n: 16, title: ['Tomorrow: the future', 'రేపు: భవిష్యత్తు', 'ನಾಳೆ: ಭವಿಷ್ಯತ್', 'நாளை: எதிர்காலம்'], sa: 'गमिष्यति', verbs: [1, 8], plan: V('lrt') },
  { n: 17, title: ['School and study', 'బడి, చదువు', 'ಶಾಲೆ, ಓದು', 'பள்ளி, படிப்பு'], sa: 'पुस्तकम्', tags: ['noun:study'], plan: W },
  { n: 18, title: ['Shopping', 'కొనుగోలు', 'ಖರೀದಿ', 'கடைக்குச் செல்லுதல்'], sa: 'आपणः', tags: ['pack:shopping', 'noun:shop'], plan: W },
  { n: 19, title: ['Travel', 'ప్రయాణం', 'ಪ್ರಯಾಣ', 'பயணம்'], sa: 'यानम्', tags: ['pack:travel', 'noun:travel'], plan: W },
  { n: 20, title: ['Take, bring, live', 'తీసుకెళ్ళు, తెచ్చు, జీవించు', 'ಕೊಂಡೊಯ್ಯು, ತರು, ಬದುಕು', 'எடுத்துச் செல், கொண்டு வா, வாழ்'], sa: 'आनयति', verbs: [17, 24], plan: V() },
  { n: 21, title: ['People', 'మనుషులు', 'ಜನರು', 'மக்கள்'], sa: 'जनः', tags: ['noun:people'], plan: W },
  { n: 22, title: ['Nature', 'ప్రకృతి', 'ಪ್ರಕೃತಿ', 'இயற்கை'], sa: 'वृक्षः', tags: ['noun:nature'], plan: W },
  { n: 23, title: ['Write, ask, sit', 'రాయి, అడుగు, కూర్చో', 'ಬರೆ, ಕೇಳು, ಕುಳಿತುಕೊ', 'எழுது, கேள், உட்கார்'], sa: 'लिखति', verbs: [25, 36], plan: V() },
  { n: 24, title: ['Life', 'జీవితం', 'ಜೀವನ', 'வாழ்க்கை'], sa: 'जीवनम्', tags: ['noun:life'], plan: W },
  { n: 25, title: ['Tell, think, count', 'చెప్పు, ఆలోచించు, లెక్కించు', 'ಹೇಳು, ಯೋಚಿಸು, ಎಣಿಸು', 'சொல், சிந்தி, எண்ணு'], sa: 'कथयति', verbs: [37, 50], plan: V() },
  { n: 26, title: ['Be, do, give, know', 'ఉండు, చేయు, ఇవ్వు, తెలుసుకో', 'ಇರು, ಮಾಡು, ಕೊಡು, ತಿಳಿ', 'இரு, செய், கொடு, அறி'], sa: 'करोति', verbs: [51, 64], plan: V() },
  { n: 27, title: ['Verses on learning', 'విద్యపై శ్లోకాలు', 'ವಿದ್ಯೆಯ ಶ್ಲೋಕಗಳು', 'கல்வி பற்றிய சுலோகங்கள்'], sa: 'विद्या', themes: ['learning'], plan: S },
  { n: 28, title: ['Verses on effort and speech', 'ప్రయత్నం, మాటపై శ్లోకాలు', 'ಪ್ರಯತ್ನ, ಮಾತಿನ ಶ್ಲೋಕಗಳು', 'முயற்சி, பேச்சு பற்றிய சுலோகங்கள்'], sa: 'उद्यमः', themes: ['effort', 'speech'], plan: S },
  { n: 29, title: ['Verses on kindness and friendship', 'దయ, స్నేహంపై శ్లోకాలు', 'ದಯೆ, ಸ್ನೇಹದ ಶ್ಲೋಕಗಳು', 'கருணை, நட்பு பற்றிய சுலோகங்கள்'], sa: 'मित्रम्', themes: ['kindness', 'friendship', 'world'], plan: S },
  { n: 30, title: ['Verses on life', 'జీవితంపై శ్లోకాలు', 'ಜೀವನದ ಶ್ಲೋಕಗಳು', 'வாழ்க்கை பற்றிய சுலோகங்கள்'], sa: 'जीवनम्', themes: ['life'], plan: S },
]

export const SECTIONS: Section[] = [
  { title: ['First words', 'మొదటి పదాలు', 'ಮೊದಲ ಪದಗಳು', 'முதல் சொற்கள்'], units: [1, 2, 3, 4, 5, 6] },
  { title: ['Everyday life', 'రోజువారీ జీవితం', 'ದಿನನಿತ್ಯದ ಜೀವನ', 'அன்றாட வாழ்க்கை'], units: [7, 8, 9, 10, 11, 12] },
  { title: ['Out and about', 'బయట', 'ಹೊರಗೆ', 'வெளியே'], units: [13, 14, 15, 16, 17, 18] },
  { title: ['People and the world', 'మనుషులు, ప్రపంచం', 'ಜನರು, ಜಗತ್ತು', 'மக்கள், உலகம்'], units: [19, 20, 21, 22, 23, 24, 25, 26] },
  { title: ['Verses', 'శ్లోకాలు', 'ಶ್ಲೋಕಗಳು', 'சுலோகங்கள்'], units: [27, 28, 29, 30] },
]

/** The slice of the pool that belongs to one unit. */
export function unitPool(u: Unit, pool: TodayPool): TodayPool {
  const tag = new Set(u.tags || [])
  return {
    words: pool.words.filter((w) => w.tag && tag.has(w.tag)),
    verbs: u.verbs ? pool.verbs.filter((v) => v.n >= u.verbs![0] && v.n <= u.verbs![1]) : [],
    verses: u.themes ? pool.verses.filter((v) => v.theme && u.themes!.includes(v.theme)) : [],
  }
}
export const unitIds = (u: Unit, pool: TodayPool) => { const p = unitPool(u, pool); return [...p.words, ...p.verbs, ...p.verses].map((x) => x.id) }

/** 0–1: share of the unit's items at box 2 or higher. */
export function mastery(u: Unit, pool: TodayPool, s: Store) {
  const ids = unitIds(u, pool)
  if (!ids.length) return 0
  return ids.filter((id) => (s.cards[id]?.box || 0) >= 2).length / ids.length
}
export const MASTERED = 0.8

/** The unit to do next: the first one at or after the placement that is not yet mastered. */
export function nextUnit(pool: TodayPool, s: Store, placed = 0) {
  return UNITS.find((u) => u.n > placed && mastery(u, pool, s) < MASTERED)?.n ?? UNITS[UNITS.length - 1].n
}

/** Placement: one question from every second unit; stop at the second miss. Returns the units passed. */
export const PLACEMENT_UNITS = [1, 2, 4, 5, 7, 8, 9, 11, 12, 13, 15, 17, 18, 19, 21, 22, 24]
