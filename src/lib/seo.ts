import type { Metadata } from 'next'
import type { ScriptId } from './grammar/script'
import { iast, toScript } from './grammar/script'
import { meaningOf, nounMeaning, pick, type Lang } from './i18n'

/**
 * Search: every page exists in English (/…) and as server-rendered Telugu, Kannada and Tamil
 * copies (/te/…, /kn/…, /ta/…), linked to each other with hreflang. Titles use the words people
 * type: "gam dhatu roop", "rama shabd roop", "గమ్ ధాతు రూపాలు".
 */
export const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://samvada.si'
export const LOCALES = ['te', 'kn', 'ta'] as const
export type Locale = (typeof LOCALES)[number]
export const SC_OF: Record<Locale, ScriptId> = { te: 'telu', kn: 'knda', ta: 'taml' }
export const scOf = (lang?: string): ScriptId => SC_OF[lang as Locale] || 'deva'
export const langOf = (lang?: string): Lang => (LOCALES.includes(lang as Locale) ? (lang as Locale) : 'en')
export const prefix = (lang: Lang) => (lang === 'en' ? '' : '/' + lang)
const HTML_LANG: Record<Lang, string> = { en: 'en', te: 'te', kn: 'kn', ta: 'ta' }

/** canonical + hreflang for one path ("/verb/01.1137", "" for home). */
export function alternates(path: string, lang: Lang): Metadata['alternates'] {
  const at = (l: Lang) => prefix(l) + path || '/'
  return {
    canonical: at(lang),
    languages: { [HTML_LANG.en]: at('en'), te: at('te'), kn: at('kn'), ta: at('ta'), 'x-default': at('en') },
  }
}
export const sitemapAlternates = (path: string) => ({ languages: { en: SITE + (path || '/'), te: `${SITE}/te${path}`, kn: `${SITE}/kn${path}`, ta: `${SITE}/ta${path}` } })

/** "पठ्" → "path": the plain spelling people type into Google. */
export const plain = (deva: string) => iast(deva).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z ]/g, '')

type Four = [string, string, string, string]
const L = (lang: Lang, x: Four) => x[{ en: 0, te: 1, kn: 2, ta: 3 }[lang]]

// ── fixed pages ─────────────────────────────────────────────────────────
export const PAGES = {
  home: {
    path: '',
    title: ['', 'సంస్కృతం మాట్లాడండి — తెలుగులో ధాతు రూపాలు, శబ్ద రూపాలు', 'ಸಂಸ್ಕೃತ ಮಾತನಾಡಿ — ಕನ್ನಡದಲ್ಲಿ ಧಾತು ರೂಪಗಳು, ಶಬ್ದ ರೂಪಗಳು', 'சமஸ்கிருதம் பேசுங்கள் — தமிழில் வினை, பெயர்ச்சொல் வடிவங்கள்'],
    desc: ['Conversational Sanskrit: every dhātu, every lakāra, with respectful and gendered forms. Verified with Vidyut.', 'తెలుగు లిపిలో సంభాషణ సంస్కృతం: ప్రతి ధాతువు, ప్రతి లకారం, నేను/నువ్వు/అతను రూపాలు, సుభాషితాలు, రోజువారీ వాక్యాలు. ఉచితం.', 'ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಸಂಭಾಷಣಾ ಸಂಸ್ಕೃತ: ಪ್ರತಿಯೊಂದು ಧಾತು, ಪ್ರತಿಯೊಂದು ಲಕಾರ, ನಾನು/ನೀನು/ಅವನು ರೂಪಗಳು, ಸುಭಾಷಿತಗಳು, ದಿನನಿತ್ಯದ ವಾಕ್ಯಗಳು. ಉಚಿತ.', 'தமிழ் எழுத்தில் பேச்சு சமஸ்கிருதம்: ஒவ்வொரு தாதுவும், ஒவ்வொரு காலமும், நான்/நீ/அவன் வடிவங்கள், சுபாஷிதங்கள், அன்றாட வாக்கியங்கள். இலவசம்.'],
  },
  phrases: {
    path: '/phrases',
    title: ['Everyday Sanskrit phrases', 'రోజువారీ సంస్కృత వాక్యాలు', 'ದಿನನಿತ್ಯದ ಸಂಸ್ಕೃತ ವಾಕ್ಯಗಳು', 'அன்றாட சமஸ்கிருத வாக்கியங்கள்'],
    desc: ['Everyday Sanskrit sentences that change with who and when.', 'ఎవరు, ఎప్పుడు అనేదాన్ని బట్టి మారే రోజువారీ సంస్కృత వాక్యాలు, తెలుగు అర్థంతో.', 'ಯಾರು, ಯಾವಾಗ ಎಂಬುದಕ್ಕೆ ತಕ್ಕಂತೆ ಬದಲಾಗುವ ದಿನನಿತ್ಯದ ಸಂಸ್ಕೃತ ವಾಕ್ಯಗಳು, ಕನ್ನಡ ಅರ್ಥದೊಂದಿಗೆ.', 'யார், எப்போது என்பதற்கேற்ப மாறும் அன்றாட சமஸ்கிருத வாக்கியங்கள், தமிழ் பொருளுடன்.'],
  },
  verbs: {
    path: '/verbs',
    title: ['Sanskrit dhatu roop — every verb, all lakaras', 'సంస్కృత ధాతు రూపాలు — అన్ని ధాతువులు, అన్ని లకారాలు', 'ಸಂಸ್ಕೃತ ಧಾತು ರೂಪಗಳು — ಎಲ್ಲ ಧಾತುಗಳು, ಎಲ್ಲ ಲಕಾರಗಳು', 'சமஸ்கிருத தாது வடிவங்கள் — எல்லா வினைகளும்'],
    desc: ['Every Sanskrit dhātu with its forms for the spoken lakāras (laṭ, laṅ, lṛṭ, loṭ, vidhiliṅ), and the common verbs with prefixes.', 'ప్రతి సంస్కృత ధాతువుకు లట్, లఙ్, లృట్, లోట్, విధిలిఙ్ రూపాలు తెలుగు లిపిలో, తెలుగు అర్థంతో.', 'ಪ್ರತಿ ಸಂಸ್ಕೃತ ಧಾತುವಿನ ಲಟ್, ಲಙ್, ಲೃಟ್, ಲೋಟ್, ವಿಧಿಲಿಙ್ ರೂಪಗಳು ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ, ಕನ್ನಡ ಅರ್ಥದೊಂದಿಗೆ.', 'ஒவ்வொரு சமஸ்கிருத தாதுவின் நிகழ், இறந்த, எதிர் கால, கட்டளை வடிவங்கள் தமிழ் எழுத்தில், தமிழ் பொருளுடன்.'],
  },
  nouns: {
    path: '/nouns',
    title: ['Sanskrit shabd roop — nouns in all 8 cases', 'సంస్కృత శబ్ద రూపాలు — 8 విభక్తులు', 'ಸಂಸ್ಕೃತ ಶಬ್ದ ರೂಪಗಳು — 8 ವಿಭಕ್ತಿಗಳು', 'சமஸ்கிருத பெயர்ச்சொல் வடிவங்கள் — 8 வேற்றுமைகள்'],
    desc: ['Common Sanskrit nouns and pronouns (shabd roop) in all eight cases and three numbers, with Telugu, Kannada and Tamil meanings.', 'సాధారణ సంస్కృత నామవాచకాలు, సర్వనామాల శబ్ద రూపాలు: 8 విభక్తులు, 3 వచనాలు, తెలుగు లిపిలో.', 'ಸಾಮಾನ್ಯ ಸಂಸ್ಕೃತ ನಾಮಪದಗಳು, ಸರ್ವನಾಮಗಳ ಶಬ್ದ ರೂಪಗಳು: 8 ವಿಭಕ್ತಿಗಳು, 3 ವಚನಗಳು, ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ.', 'பொதுவான சமஸ்கிருத பெயர்ச்சொற்கள், பிரதிப்பெயர்கள்: 8 வேற்றுமைகள், 3 எண்கள், தமிழ் எழுத்தில்.'],
  },
  words: {
    path: '/words',
    title: ['Sanskrit question words and indeclinables', 'సంస్కృత ప్రశ్నార్థక పదాలు, అవ్యయాలు', 'ಸಂಸ್ಕೃತ ಪ್ರಶ್ನಾರ್ಥಕ ಪದಗಳು, ಅವ್ಯಯಗಳು', 'சமஸ்கிருத வினாச்சொற்கள், அவ்யயங்கள்'],
    desc: ['कुत्र, कदा, किमर्थम्, कथम्, अत्र, तत्र, च, अपि, एव … the Sanskrit words that never change, with a phrase each, in four scripts.', 'కుత్ర, కదా, కథం, అత్ర, తత్ర, చ, అపి, ఏవ … ఎప్పుడూ మారని సంస్కృత పదాలు, ఒక్కో వాక్యంతో.', 'ಕುತ್ರ, ಕದಾ, ಕಥಂ, ಅತ್ರ, ತತ್ರ, ಚ, ಅಪಿ, ಏವ … ಎಂದೂ ಬದಲಾಗದ ಸಂಸ್ಕೃತ ಪದಗಳು, ಒಂದೊಂದು ವಾಕ್ಯದೊಂದಿಗೆ.', 'குத்ர, கதா, கதம், அத்ர, தத்ர, ச, அபி, ஏவ … மாறாத சமஸ்கிருதச் சொற்கள், ஒவ்வொன்றுக்கும் ஒரு வாக்கியம்.'],
  },
  build: {
    path: '/build',
    title: ['Sanskrit sentence builder', 'సంస్కృత వాక్య నిర్మాణం', 'ಸಂಸ್ಕೃತ ವಾಕ್ಯ ರಚನೆ', 'சமஸ்கிருத வாக்கியம் அமைத்தல்'],
    desc: ['Build a Sanskrit sentence word by word: pick a verb, an object, a place, a time. Every ending is chosen for you, with the reason.', 'ధాతువు, కర్మ, స్థలం, కాలం ఎంచుకుని సంస్కృత వాక్యం కట్టండి; ప్రతి విభక్తి కారణంతో సహా.', 'ಧಾತು, ಕರ್ಮ, ಸ್ಥಳ, ಕಾಲ ಆರಿಸಿ ಸಂಸ್ಕೃತ ವಾಕ್ಯ ಕಟ್ಟಿ; ಪ್ರತಿ ವಿಭಕ್ತಿ ಕಾರಣ ಸಹಿತ.', 'வினை, பொருள், இடம், காலம் தேர்ந்தெடுத்து சமஸ்கிருத வாக்கியம் அமைக்கவும்; ஒவ்வொரு விகுதிக்கும் காரணத்துடன்.'],
  },
  packs: {
    path: '/packs',
    title: ['Everyday Sanskrit vocabulary', 'రోజువారీ సంస్కృత పదాలు', 'ದಿನನಿತ್ಯದ ಸಂಸ್ಕೃತ ಪದಗಳು', 'அன்றாட சமஸ்கிருதச் சொற்கள்'],
    desc: ['Numbers, time and days, family, food, body, directions, shopping and travel in Sanskrit, with phrases that change with who and when.', 'సంఖ్యలు, సమయం, కుటుంబం, ఆహారం, శరీరం, దిశలు, షాపింగ్, ప్రయాణం — సంస్కృతంలో, తెలుగు అర్థంతో.', 'ಸಂಖ್ಯೆಗಳು, ಸಮಯ, ಕುಟುಂಬ, ಆಹಾರ, ದೇಹ, ದಿಕ್ಕುಗಳು, ಶಾಪಿಂಗ್, ಪ್ರಯಾಣ — ಸಂಸ್ಕೃತದಲ್ಲಿ, ಕನ್ನಡ ಅರ್ಥದೊಂದಿಗೆ.', 'எண்கள், நேரம், குடும்பம், உணவு, உடல், திசைகள், கடை, பயணம் — சமஸ்கிருதத்தில், தமிழ் பொருளுடன்.'],
  },
  greetings: {
    path: '/greetings',
    title: ['Sanskrit greetings and names', 'సంస్కృత శుభాకాంక్షలు, పేర్లు', 'ಸಂಸ್ಕೃತ ಶುಭಾಶಯಗಳು, ಹೆಸರುಗಳು', 'சமஸ்கிருத வாழ்த்துகள், பெயர்கள்'],
    desc: ['नमो नमः, सुप्रभातम्, धन्यवादः, क्षम्यताम् … everyday Sanskrit greetings and wishes, and Sanskrit names with their meanings, ready to share.', 'నమో నమః, సుప్రభాతం, ధన్యవాదః … రోజువారీ సంస్కృత శుభాకాంక్షలు, అర్థంతో సంస్కృత పేర్లు.', 'ನಮೋ ನಮಃ, ಸುಪ್ರಭಾತಂ, ಧನ್ಯವಾದಃ … ದಿನನಿತ್ಯದ ಸಂಸ್ಕೃತ ಶುಭಾಶಯಗಳು, ಅರ್ಥ ಸಹಿತ ಸಂಸ್ಕೃತ ಹೆಸರುಗಳು.', 'நமோ நமஃ, சுப்ரபாதம், தன்யவாதஃ … அன்றாட சமஸ்கிருத வாழ்த்துகள், பொருளுடன் சமஸ்கிருதப் பெயர்கள்.'],
  },
  subhashitas: {
    path: '/subhashitas',
    title: ['Subhāṣitas — Sanskrit verses with meaning', 'సుభాషితాలు — అర్థంతో సంస్కృత శ్లోకాలు', 'ಸುಭಾಷಿತಗಳು — ಅರ್ಥ ಸಹಿತ ಸಂಸ್ಕೃತ ಶ್ಲೋಕಗಳು', 'சுபாஷிதங்கள் — பொருளுடன் சமஸ்கிருத சுலோகங்கள்'],
    desc: ['Famous Sanskrit subhāṣitas word by word, with meanings in English, Telugu, Kannada and Tamil, in four scripts.', 'ప్రసిద్ధ సంస్కృత సుభాషితాలు పదం పదంగా, తెలుగు అర్థంతో, తెలుగు లిపిలో.', 'ಪ್ರಸಿದ್ಧ ಸಂಸ್ಕೃತ ಸುಭಾಷಿತಗಳು ಪದ ಪದವಾಗಿ, ಕನ್ನಡ ಅರ್ಥದೊಂದಿಗೆ, ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ.', 'புகழ்பெற்ற சமஸ்கிருத சுபாஷிதங்கள் சொல் சொல்லாக, தமிழ் பொருளுடன், தமிழ் எழுத்தில்.'],
  },
  practice: {
    path: '/practice',
    title: ['Sanskrit practice cards', 'సంస్కృత అభ్యాసం', 'ಸಂಸ್ಕೃತ ಅಭ್ಯಾಸ', 'சமஸ்கிருதப் பயிற்சி'],
    desc: ['Say it aloud, then turn the card over.', 'పెద్దగా చెప్పండి, తర్వాత కార్డు తిప్పండి.', 'ಜೋರಾಗಿ ಹೇಳಿ, ನಂತರ ಕಾರ್ಡ್ ತಿರುಗಿಸಿ.', 'உரக்கச் சொல்லுங்கள், பின் அட்டையைத் திருப்புங்கள்.'],
  },
  today: {
    path: '/today',
    title: ['Today — 5-minute Sanskrit practice', 'ఈరోజు — 5 నిమిషాల సంస్కృత అభ్యాసం', 'ಇಂದು — 5 ನಿಮಿಷದ ಸಂಸ್ಕೃತ ಅಭ್ಯಾಸ', 'இன்று — 5 நிமிட சமஸ்கிருதப் பயிற்சி'],
    desc: ['A short daily Sanskrit session: new words, review and one verse line. Keep your streak going.', 'రోజూ చిన్న సంస్కృత సెషన్: కొత్త పదాలు, పునశ్చరణ, ఒక శ్లోక పాదం. మీ వరుసను కొనసాగించండి.', 'ದಿನವೂ ಚಿಕ್ಕ ಸಂಸ್ಕೃತ ಅಭ್ಯಾಸ: ಹೊಸ ಪದಗಳು, ಪುನರಾವರ್ತನೆ, ಒಂದು ಶ್ಲೋಕ ಪಾದ. ನಿಮ್ಮ ಸರಣಿ ಮುಂದುವರಿಸಿ.', 'தினமும் சிறிய சமஸ்கிருதப் பயிற்சி: புதிய சொற்கள், மீள்பார்வை, ஒரு சுலோக வரி. உங்கள் தொடரைத் தொடருங்கள்.'],
  },
  path: {
    path: '/path',
    title: ['Learn Sanskrit step by step — 30 units', 'సంస్కృతం దశలవారీగా నేర్చుకోండి — 30 పాఠాలు', 'ಸಂಸ್ಕೃತ ಹಂತ ಹಂತವಾಗಿ ಕಲಿಯಿರಿ — 30 ಪಾಠಗಳು', 'சமஸ்கிருதம் படிப்படியாகக் கற்க — 30 பாடங்கள்'],
    desc: ['A free learning path for spoken Sanskrit: greetings, numbers, family, food, the verbs you need and famous verses, with a placement test and spaced review.', 'మాట్లాడే సంస్కృతానికి ఉచిత పాఠ్యక్రమం: పలకరింపులు, సంఖ్యలు, కుటుంబం, ఆహారం, అవసరమైన ధాతువులు, ప్రసిద్ధ శ్లోకాలు.', 'ಮಾತಿನ ಸಂಸ್ಕೃತಕ್ಕೆ ಉಚಿತ ಪಾಠಕ್ರಮ: ಶುಭಾಶಯಗಳು, ಸಂಖ್ಯೆಗಳು, ಕುಟುಂಬ, ಆಹಾರ, ಬೇಕಾದ ಧಾತುಗಳು, ಪ್ರಸಿದ್ಧ ಶ್ಲೋಕಗಳು.', 'பேச்சு சமஸ்கிருதத்துக்கான இலவசப் பாடத்திட்டம்: வாழ்த்துகள், எண்கள், குடும்பம், உணவு, தேவையான வினைகள், புகழ்பெற்ற சுலோகங்கள்.'],
  },
  script: {
    path: '/script',
    title: ['Learn to read Devanagari, a few letters at a time', 'దేవనాగరి చదవడం నేర్చుకోండి — తెలుగు నుండి', 'ದೇವನಾಗರಿ ಓದಲು ಕಲಿಯಿರಿ — ಕನ್ನಡದಿಂದ', 'தேவநாகரி படிக்கக் கற்க — தமிழிலிருந்து'],
    desc: ['Read Sanskrit in your own script, then swap in Devanagari letters group by group until the whole line is Devanagari.', 'సంస్కృతాన్ని తెలుగు లిపిలో చదవండి, తర్వాత అక్షరాల గుంపుల వారీగా దేవనాగరికి మారండి.', 'ಸಂಸ್ಕೃತವನ್ನು ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಓದಿ, ನಂತರ ಅಕ್ಷರಗಳ ಗುಂಪುಗಳಾಗಿ ದೇವನಾಗರಿಗೆ ಬದಲಿಸಿ.', 'சமஸ்கிருதத்தைத் தமிழ் எழுத்தில் படியுங்கள், பின் எழுத்துக் குழுக்களாகத் தேவநாகரிக்கு மாறுங்கள்.'],
  },
  support: {
    path: '/support',
    title: ['Support Samvadasi', 'సంవదసికి సహాయం', 'ಸಂವದಸಿಗೆ ಬೆಂಬಲ', 'சம்வதஸிக்கு ஆதரவு'],
    desc: ['Samvadasi is free, open source and ad-free. Chip in for the domain and hosting, or help in other ways.', 'సంవదసి ఉచితం, ఓపెన్ సోర్స్, ప్రకటనలు లేవు. డొమైన్, హోస్టింగ్ కోసం సహాయం చేయండి.', 'ಸಂವದಸಿ ಉಚಿತ, ಓಪನ್ ಸೋರ್ಸ್, ಜಾಹೀರಾತುಗಳಿಲ್ಲ. ಡೊಮೈನ್, ಹೋಸ್ಟಿಂಗ್‌ಗಾಗಿ ಸಹಾಯ ಮಾಡಿ.', 'சம்வதஸி இலவசம், திறந்த மூலம், விளம்பரம் இல்லை. டொமைன், ஹோஸ்டிங்கிற்கு உதவுங்கள்.'],
  },
} satisfies Record<string, { path: string; title: Four; desc: Four }>
export type PageKey = keyof typeof PAGES

export function pageMeta(key: PageKey, lang: Lang): Metadata {
  const p = PAGES[key], title = L(lang, p.title), description = L(lang, p.desc)
  return { ...(title ? { title } : {}), description, alternates: alternates(p.path, lang), openGraph: { ...(title ? { title } : {}), description, locale: OG_LOCALE[lang] } }
}
const OG_LOCALE: Record<Lang, string> = { en: 'en_IN', te: 'te_IN', kn: 'kn_IN', ta: 'ta_IN' }

/** Metadata for a page with params that may carry a language. */
export const metaFor = async (key: PageKey, params?: Promise<{ lang?: string }>) => pageMeta(key, langOf((await params)?.lang))

// ── verb pages ──────────────────────────────────────────────────────────
const GANA = ['', 'bhvādi', 'adādi', 'juhotyādi', 'divādi', 'svādi', 'tudādi', 'rudhādi', 'tanādi', 'kryādi', 'curādi']
const GANA_DEVA = ['', 'भ्वादि', 'अदादि', 'जुहोत्यादि', 'दिवादि', 'स्वादि', 'तुदादि', 'रुधादि', 'तनादि', 'क्र्यादि', 'चुरादि']
const PADA_DEVA: Record<string, string> = { P: 'परस्मैपद', A: 'आत्मनेपद' }
const PADA_EN: Record<string, string> = { P: 'parasmaipada', A: 'ātmanepada' }

type VerbLike = Parameters<typeof meaningOf>[0] & { display: string; gana: number; code: string; padas: string[]; preferredPada?: string | null; forms?: any }
const first = (d: VerbLike, lak: string) => d.forms?.[lak]?.[d.preferredPada || d.padas[0]]?.[0]?.[0] || ''

/** The three forms that answer "what is it in present / past / future" (he/she, singular). */
export const keyForms = (d: VerbLike) => ({ lat: first(d, 'lat'), lan: first(d, 'lan'), lrt: first(d, 'lrt'), lot: first(d, 'lot') })

export function verbMeta(d: VerbLike, lang: Lang, slug: string) {
  const sc = scOf(lang === 'en' ? undefined : lang)
  const k = keyForms(d), D = toScript(d.display, sc), roman = plain(d.display)
  const m = meaningOf(d, lang, sc).main || d.meaning_en || ''
  const f = (x: string) => toScript(x, sc)
  const title = L(lang, [
    `${d.display} (${roman}) dhatu roop — ${k.lat}, meaning “${(d.meaning_en || '').replace(/^to /, '') || m}”`,
    `${D} ధాతు రూపాలు (${roman} dhatu roop) — ${f(k.lat)}, ${m}`,
    `${D} ಧಾತು ರೂಪಗಳು (${roman} dhatu roop) — ${f(k.lat)}, ${m}`,
    `${D} தாது வடிவங்கள் (${roman} dhatu roop) — ${f(k.lat)}, ${m}`,
  ])
  const description = L(lang, [
    `${d.display} (${roman}): ${d.meaning_en || m}. Present ${k.lat}, past ${k.lan}, future ${k.lrt}, command ${k.lot}. Every form for I, you and he/she, plus causative and passive, in Devanagari, Telugu, Kannada and Tamil.`,
    `${D}: ${m}. వర్తమానం ${f(k.lat)}, భూతం ${f(k.lan)}, భవిష్యత్తు ${f(k.lrt)}, ఆజ్ఞ ${f(k.lot)}. నేను, నువ్వు, అతను/ఆమె కోసం అన్ని రూపాలు తెలుగు లిపిలో.`,
    `${D}: ${m}. ವರ್ತಮಾನ ${f(k.lat)}, ಭೂತ ${f(k.lan)}, ಭವಿಷ್ಯತ್ ${f(k.lrt)}, ಆಜ್ಞೆ ${f(k.lot)}. ನಾನು, ನೀನು, ಅವನು/ಅವಳು ಎಲ್ಲ ರೂಪಗಳು ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ.`,
    `${D}: ${m}. நிகழ் ${f(k.lat)}, இறந்த ${f(k.lan)}, எதிர் ${f(k.lrt)}, கட்டளை ${f(k.lot)}. நான், நீ, அவன்/அவள் எல்லா வடிவங்களும் தமிழ் எழுத்தில்.`,
  ])
  return { title, description, alternates: alternates(`/verb/${slug}`, lang), openGraph: { title, description, locale: OG_LOCALE[lang] } }
}

/** One real paragraph about the verb, so the page is more than a table. */
export function verbAbout(d: VerbLike, lang: Lang, sc: ScriptId): string {
  const k = keyForms(d), D = toScript(d.display, sc), f = (x: string) => toScript(x, sc)
  const pada = d.preferredPada || d.padas[0], g = d.gana
  const m = meaningOf(d, lang, sc).main || d.meaning_en || ''
  const gd = toScript(GANA_DEVA[g] || '', sc), pd = toScript(PADA_DEVA[pada] || '', sc)
  if (lang === 'en') return `${d.display} (${plain(d.display)}) means “${(d.meaning_en || m).replace(/^to /, '')}”. It is a ${PADA_EN[pada] || ''} verb of gaṇa ${g} (${GANA[g] || ''}), Dhātupāṭha number ${d.code}. He or she ${k.lat ? `says ${k.lat} in the present, ${k.lan} in the past and ${k.lrt} in the future` : 'uses the forms below'}; change only the ending for I, you, we and they.`
  if (lang === 'te') return `${D} అంటే “${m}”. ఇది ${gd} గణం (${g}) లోని ${pd} ధాతువు, ధాతుపాఠ సంఖ్య ${d.code}. అతను/ఆమె — వర్తమానం ${f(k.lat)}, భూతం ${f(k.lan)}, భవిష్యత్తు ${f(k.lrt)}. నేను, నువ్వు, మేము, వాళ్ళు కోసం చివరి భాగం మాత్రమే మారుతుంది.`
  if (lang === 'kn') return `${D} ಎಂದರೆ “${m}”. ಇದು ${gd} ಗಣದ (${g}) ${pd} ಧಾತು, ಧಾತುಪಾಠ ಸಂಖ್ಯೆ ${d.code}. ಅವನು/ಅವಳು — ವರ್ತಮಾನ ${f(k.lat)}, ಭೂತ ${f(k.lan)}, ಭವಿಷ್ಯತ್ ${f(k.lrt)}. ನಾನು, ನೀನು, ನಾವು, ಅವರು ಎಂಬುದಕ್ಕೆ ಕೊನೆಯ ಭಾಗ ಮಾತ್ರ ಬದಲಾಗುತ್ತದೆ.`
  return `${D} என்றால் “${m}”. இது ${gd} கணத்தின் (${g}) ${pd} தாது, தாதுபாட எண் ${d.code}. அவன்/அவள் — நிகழ் ${f(k.lat)}, இறந்த ${f(k.lan)}, எதிர் ${f(k.lrt)}. நான், நீ, நாம், அவர்கள் என்பதற்கு இறுதிப் பகுதி மட்டுமே மாறும்.`
}

// ── noun pages ──────────────────────────────────────────────────────────
type NounLike = { display: string; nom: string; meaning_en?: string | null; meaning_te?: string | null; meaning_kn?: string | null; meaning_ta?: string | null; forms?: any }
export function nounMeta(n: NounLike, lang: Lang, slug: string, pattern: string) {
  const sc = scOf(lang === 'en' ? undefined : lang), D = toScript(n.display, sc), N = toScript(n.nom, sc), roman = plain(n.display)
  const m = nounMeaning(lang, n) || n.meaning_en || ''
  const title = L(lang, [
    `${n.display} (${roman}) shabd roop — ${n.nom}, “${n.meaning_en}” in all 8 cases`,
    `${D} శబ్ద రూపాలు (${roman} shabd roop) — ${N}, ${m}`,
    `${D} ಶಬ್ದ ರೂಪಗಳು (${roman} shabd roop) — ${N}, ${m}`,
    `${D} வேற்றுமை வடிவங்கள் (${roman} shabd roop) — ${N}, ${m}`,
  ])
  const description = L(lang, [
    `${n.display}: ${n.meaning_en}. All eight cases in singular, dual and plural (${pattern}), in Devanagari, Telugu, Kannada and Tamil.`,
    `${D}: ${m}. ఏకవచనం, ద్వివచనం, బహువచనంలో 8 విభక్తుల రూపాలు, తెలుగు లిపిలో.`,
    `${D}: ${m}. ಏಕವಚನ, ದ್ವಿವಚನ, ಬಹುವಚನಗಳಲ್ಲಿ 8 ವಿಭಕ್ತಿಗಳ ರೂಪಗಳು, ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ.`,
    `${D}: ${m}. ஒருமை, இருமை, பன்மையில் 8 வேற்றுமை வடிவங்கள், தமிழ் எழுத்தில்.`,
  ])
  return { title, description, alternates: alternates(`/noun/${slug}`, lang), openGraph: { title, description, locale: OG_LOCALE[lang] } }
}

// ── packs and verses ────────────────────────────────────────────────────
export function packMeta(k: { slug: string; title: string[]; titleSa?: string | null; words: { sa: string; m: string[] }[] }, lang: Lang) {
  const sc = scOf(lang === 'en' ? undefined : lang), T = pick(lang, k.title), sa = toScript(k.titleSa || '', sc)
  const words = k.words.slice(0, 8).map((w) => `${toScript(w.sa, sc)} (${pick(lang, w.m)})`).join(', ')
  const title = L(lang, [`${k.title[0]} in Sanskrit — ${k.titleSa}`, `సంస్కృతంలో ${T} — ${sa}`, `ಸಂಸ್ಕೃತದಲ್ಲಿ ${T} — ${sa}`, `சமஸ்கிருதத்தில் ${T} — ${sa}`])
  const description = `${words} …`
  return { title, description, alternates: alternates(`/packs/${k.slug}`, lang), openGraph: { title, description, locale: OG_LOCALE[lang] } }
}
export function verseMeta(s: { slug: string; text: string; meaning: string[] }, lang: Lang) {
  const sc = scOf(lang === 'en' ? undefined : lang)
  const line = toScript(s.text.split('\n')[0].replace(/[।॥]/g, '').trim(), sc)
  const title = L(lang, [`${line} — subhāṣita meaning`, `${line} — సుభాషితం అర్థం`, `${line} — ಸುಭಾಷಿತ ಅರ್ಥ`, `${line} — சுபாஷிதம் பொருள்`])
  const description = L(lang, [`${s.meaning[0]} Word by word, with meanings in Telugu, Kannada and Tamil.`, `${pick(lang, s.meaning)} పదం పదంగా అర్థంతో.`, `${pick(lang, s.meaning)} ಪದ ಪದವಾಗಿ ಅರ್ಥ ಸಹಿತ.`, `${pick(lang, s.meaning)} சொல் சொல்லாகப் பொருளுடன்.`])
  return { title, description, alternates: alternates(`/subhashita/${s.slug}`, lang), openGraph: { title, description, locale: OG_LOCALE[lang] } }
}

// ── structured data ─────────────────────────────────────────────────────
const CRUMB: Record<string, Four> = {
  home: ['Samvadasi', 'సంవదసి', 'ಸಂವದಸಿ', 'சம்வதஸி'],
  verbs: ['Verbs', 'ధాతువులు', 'ಧಾತುಗಳು', 'வினைகள்'],
  nouns: ['Nouns', 'నామవాచకాలు', 'ನಾಮಪದಗಳು', 'பெயர்ச்சொற்கள்'],
  packs: ['Vocabulary', 'పదాలు', 'ಪದಗಳು', 'சொற்கள்'],
  subhashitas: ['Subhāṣitas', 'సుభాషితాలు', 'ಸುಭಾಷಿತಗಳು', 'சுபாஷிதங்கள்'],
  path: ['Learning path', 'పాఠ్యక్రమం', 'ಪಾಠಕ್ರಮ', 'பாடத்திட்டம்'],
}
export function breadcrumbs(lang: Lang, trail: [keyof typeof CRUMB | string, string][]) {
  const p = prefix(lang)
  const items = [['home', ''] as [string, string], ...trail]
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name: CRUMB[name] ? L(lang, CRUMB[name]) : name, item: SITE + (p + path || '/') })),
  }
}
export const websiteLd = (lang: Lang) => ({
  '@context': 'https://schema.org', '@type': 'WebSite', name: 'Samvadasi', alternateName: 'संवदसि', url: SITE + (prefix(lang) || '/'), inLanguage: HTML_LANG[lang],
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE}${prefix(lang)}/verbs?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
})
export const termLd = (lang: Lang, name: string, alt: string, description: string, path: string, set: 'verbs' | 'nouns') => ({
  '@context': 'https://schema.org', '@type': 'DefinedTerm', name, alternateName: alt, description, inLanguage: 'sa', url: SITE + prefix(lang) + path,
  inDefinedTermSet: { '@type': 'DefinedTermSet', name: set === 'verbs' ? 'Sanskrit dhātus' : 'Sanskrit nouns', url: `${SITE}${prefix(lang)}/${set}` },
})

// ── learning-path units ─────────────────────────────────────────────────
export function unitMeta(u: { n: number; title: string[] }, lang: Lang) {
  const T = L(lang, u.title as Four) || u.title[0]
  const title = L(lang, [`Unit ${u.n}: ${T} — learn Sanskrit`, `పాఠం ${u.n}: ${T} — సంస్కృతం నేర్చుకోండి`, `ಪಾಠ ${u.n}: ${T} — ಸಂಸ್ಕೃತ ಕಲಿಯಿರಿ`, `பாடம் ${u.n}: ${T} — சமஸ்கிருதம் கற்க`])
  const description = L(lang, [`${T} in Sanskrit: the words and forms of unit ${u.n}, with short exercises and spaced review.`, `సంస్కృతంలో ${T}: పాఠం ${u.n} పదాలు, రూపాలు, చిన్న అభ్యాసాలతో.`, `ಸಂಸ್ಕೃತದಲ್ಲಿ ${T}: ಪಾಠ ${u.n} ಪದಗಳು, ರೂಪಗಳು, ಚಿಕ್ಕ ಅಭ್ಯಾಸಗಳೊಂದಿಗೆ.`, `சமஸ்கிருதத்தில் ${T}: பாடம் ${u.n} சொற்கள், வடிவங்கள், சிறு பயிற்சிகளுடன்.`])
  return { title, description, alternates: alternates(`/path/${u.n}`, lang), openGraph: { title, description, locale: OG_LOCALE[lang] } }
}
