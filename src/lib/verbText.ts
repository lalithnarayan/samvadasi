/**
 * Words about a verb that pages show and search engines read: the plain Roman spelling, the
 * three forms that answer "present / past / future", and a paragraph in the reader's language.
 * Kept apart from seo.ts so the verb page ships this and not every page's copy.
 */
import type { ScriptId } from './grammar/script'
import { iast, toScript } from './grammar/script'
import { meaningOf, type Lang } from './i18n'

/** "पठ्" → "path": the plain spelling people type into Google. */
export const plain = (deva: string) => iast(deva).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z ]/g, '')


const GANA = ['', 'bhvādi', 'adādi', 'juhotyādi', 'divādi', 'svādi', 'tudādi', 'rudhādi', 'tanādi', 'kryādi', 'curādi']
const GANA_DEVA = ['', 'भ्वादि', 'अदादि', 'जुहोत्यादि', 'दिवादि', 'स्वादि', 'तुदादि', 'रुधादि', 'तनादि', 'क्र्यादि', 'चुरादि']
const PADA_DEVA: Record<string, string> = { P: 'परस्मैपद', A: 'आत्मनेपद' }
const PADA_EN: Record<string, string> = { P: 'parasmaipada', A: 'ātmanepada' }

export type VerbLike = Parameters<typeof meaningOf>[0] & { display: string; gana: number; code: string; padas: string[]; preferredPada?: string | null; forms?: any }
const first = (d: VerbLike, lak: string) => d.forms?.[lak]?.[d.preferredPada || d.padas[0]]?.[0]?.[0] || ''

/** The three forms that answer "what is it in present / past / future" (he/she, singular). */
export const keyForms = (d: VerbLike) => ({ lat: first(d, 'lat'), lan: first(d, 'lan'), lrt: first(d, 'lrt'), lot: first(d, 'lot') })


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

