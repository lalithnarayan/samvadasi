/**
 * Sentence-builder rules: which words make sense with each everyday verb (so the builder never
 * offers "I drink the mountain"), and the English needed to translate what is built.
 */
import type { Subject } from './grammar/subjects'
import type { Num, WhenId } from './grammar/types'

// ── noun groups (slugs of the Nouns collection) ─────────────────────────
const G = {
  food: ['odana-m', 'rowikA-f', 'SAka-m', 'daDi-n', 'Pala-n', 'Amra-m', 'kadalIPala-n', 'modaka-m', 'anna-n', 'Bojana-n', 'nArikela-m'],
  drink: ['jala-n', 'dugDa-n', 'cAya-m', 'Palarasa-m', 'pAnIya-n'],
  reading: ['pustaka-n', 'vArtApatra-n', 'patra-n', 'kaTA-f', 'pAWa-m', 'vAkya-n', 'praSna-m', 'uttara-n'],
  writing: ['patra-n', 'kaTA-f', 'vAkya-n', 'akzara-n', 'uttara-n', 'praSna-m', 'gfhakArya-n', 'nAman-n'],
  places: ['vidyAlaya-m', 'ApaRa-m', 'gfha-n', 'udyAna-n', 'grAma-m', 'nagara-n', 'mandira-n', 'cikitsAlaya-m', 'kAryAlaya-m', 'granTAlaya-m', 'BojanAlaya-m', 'mahAvidyAlaya-m', 'nadI-f', 'samudra-m', 'parvata-m', 'vana-n', 'deSa-m', 'pAkaSAlA-f', 'prakozWa-m', 'vipaRi-f', 'sTAnaka-n', 'kakzyA-f'],
  rooms: ['gfha-n', 'prakozWa-m', 'pAkaSAlA-f', 'kakzyA-f', 'vidyAlaya-m', 'kAryAlaya-m', 'granTAlaya-m', 'udyAna-n', 'mandira-n'],
  people: ['mAtf-f', 'pitf-m', 'BrAtf-m', 'BaginI-f', 'putra-m', 'putrI-f', 'pati-m', 'patnI-f', 'pitAmaha-m', 'pitAmahI-f', 'mitra-n', 'bAlaka-m', 'bAlikA-f', 'SiSu-m', 'guru-m', 'atiTi-m', 'CAtra-m', 'CAtrA-f', 'aDyApaka-m', 'aDyApikA-f', 'vEdya-m', 'kfzaka-m', 'ApaRika-m', 'cAlaka-m'],
  elders: ['mAtf-f', 'pitf-m', 'pitAmaha-m', 'pitAmahI-f', 'guru-m', 'aDyApaka-m', 'aDyApikA-f', 'atiTi-m'],
  animals: ['Denu-f', 'kukkura-m', 'mArjAra-m', 'pakzin-m', 'aSva-m'],
  nature: ['sUrya-m', 'candra-m', 'AkASa-m', 'vfkza-m', 'puzpa-n', 'varzA-f', 'nadI-f', 'samudra-m', 'parvata-m', 'vana-n'],
  things: ['pustaka-n', 'vastra-n', 'leKanI-f', 'syUta-m', 'Catra-n', 'kuYcikA-f', 'pAtra-n', 'cazaka-m', 'Asana-n', 'dIpa-m', 'GawI-f', 'upanetra-n', 'dUravARI-f', 'puzpa-n', 'citra-n', 'patra-n', 'vArtApatra-n'],
  vehicles: ['yAna-n', 'lokayAna-n', 'relayAna-n', 'vimAna-n', 'dvicakrikA-f'],
  money: ['Dana-n', 'rUpyaka-n', 'vetana-n'],
  topics: ['vizaya-m', 'kaTA-f', 'pAWa-m', 'nAman-n', 'praSna-m', 'uttara-n', 'satya-n'],
  learnable: ['saMskfta-n', 'BAzA-f', 'pAWa-m', 'saNgIta-n', 'vidyA-f'],
  body: ['hasta-m', 'pAda-m', 'muKa-n', 'keSa-m', 'danta-m'],
  good: ['suKa-n', 'Arogya-n', 'sAhAyya-n'],
}
const g = (...ks: (keyof typeof G)[]) => [...new Set(ks.flatMap((k) => G[k]))]

/** English forms of a verb; obj / to: preposition before the object / the "for" slot in English. */
export type Eng = { base: string; third: string; past: string; pp: string; ing: string; obj?: string; for?: string; from?: string; with?: string; after?: string }
export type Frame = {
  en: Eng
  object?: string[]       // nouns that can be the object (द्वितीया); none → intransitive (no passive)
  place?: string[] | true // where (सप्तमी)
  with?: boolean          // with someone (तृतीया + सह)
  for?: string[]          // for / to someone (चतुर्थी)
  from?: string[]         // from somewhere (पञ्चमी)
}
const e = (base: string, third: string, past: string, pp: string, ing: string, x: Partial<Eng> = {}): Eng => ({ base, third, past, pp, ing, ...x })

export const FRAMES: Record<string, Frame> = {
  '01.1137': { en: e('go', 'goes', 'went', 'gone', 'going', { obj: 'to' }), object: g('places'), from: g('places'), with: true },
  '01.1137-A': { en: e('come', 'comes', 'came', 'come', 'coming', { obj: 'to' }), object: g('places'), from: g('places'), with: true },
  '01.0381': { en: e('read', 'reads', 'read', 'read', 'reading'), object: g('reading'), place: g('rooms'), with: true, for: g('people') },
  '01.1164': { en: e('speak', 'speaks', 'spoke', 'spoken', 'speaking'), object: ['saMskfta-n', 'BAzA-f', 'satya-n', 'Sabda-m', 'vAkya-n'], place: true, with: true },
  '01.0051': { en: e('eat', 'eats', 'ate', 'eaten', 'eating'), object: g('food'), place: ['gfha-n', 'BojanAlaya-m', 'udyAna-n', 'pAkaSAlA-f', 'vidyAlaya-m', 'kAryAlaya-m'], with: true },
  '01.1074': { en: e('drink', 'drinks', 'drank', 'drunk', 'drinking'), object: g('drink'), place: ['gfha-n', 'BojanAlaya-m', 'udyAna-n', 'kAryAlaya-m', 'vidyAlaya-m'], with: true },
  '01.1143': { en: e('see', 'sees', 'saw', 'seen', 'seeing'), object: g('people', 'animals', 'nature', 'places', 'things', 'vehicles'), place: true, with: true },
  '01.0001': { en: e('be', 'is', 'was', 'been', 'being'), place: true, with: true },
  '01.1077': { en: e('stand', 'stands', 'stood', 'stood', 'standing'), place: true, with: true },
  '01.1077-ud': { en: e('get up', 'gets up', 'got up', 'got up', 'getting up'), place: g('rooms'), from: ['Asana-n', 'SayyA-f'] },
  '01.0924': { en: e('walk', 'walks', 'walked', 'walked', 'walking', { obj: 'to' }), object: g('places'), place: ['udyAna-n', 'vana-n', 'mArga-m', 'grAma-m', 'nagara-n'], with: true, from: g('places') },
  '01.0685': { en: e('run', 'runs', 'ran', 'run', 'running'), place: ['udyAna-n', 'vana-n', 'mArga-m', 'grAma-m'], with: true, from: g('places') },
  '01.0405': { en: e('play', 'plays', 'played', 'played', 'playing'), place: ['udyAna-n', 'gfha-n', 'vidyAlaya-m', 'vana-n', 'prakozWa-m'], with: true },
  '01.0822': { en: e('laugh', 'laughs', 'laughed', 'laughed', 'laughing'), place: true, with: true },
  '01.1136': { en: e('bow', 'bows', 'bowed', 'bowed', 'bowing', { obj: 'to' }), object: [...g('elders'), 'deva-m'], place: ['mandira-n', 'gfha-n', 'vidyAlaya-m'] },
  '01.0919': { en: e('remember', 'remembers', 'remembered', 'remembered', 'remembering'), object: g('people', 'topics') },
  '01.1049': { en: e('take', 'takes', 'took', 'taken', 'taking'), object: g('things', 'food', 'drink', 'people', 'animals'), from: g('places'), for: g('people') },
  '01.1049-A': { en: e('bring', 'brings', 'brought', 'brought', 'bringing'), object: g('things', 'food', 'drink'), from: g('places'), for: g('people') },
  '01.0979': { en: e('fall', 'falls', 'fell', 'fallen', 'falling'), place: ['mArga-m', 'udyAna-n', 'gfha-n', 'nadI-f'], from: ['vfkza-m', 'parvata-m', 'Asana-n', 'SayyA-f'] },
  '01.0643': { en: e('live', 'lives', 'lived', 'lived', 'living'), place: true, with: true },
  '01.0746': { en: e('protect', 'protects', 'protected', 'protected', 'protecting'), object: g('people', 'animals', 'nature'), from: [] },
  '01.1151': { en: e('cook', 'cooks', 'cooked', 'cooked', 'cooking'), object: ['odana-m', 'SAka-m', 'rowikA-f', 'Bojana-n', 'anna-n'], place: ['pAkaSAlA-f', 'gfha-n', 'BojanAlaya-m'], with: true, for: g('people') },
  '01.1141': { en: e('leave', 'leaves', 'left', 'left', 'leaving'), object: g('places') },
  '01.1160': { en: e('live', 'lives', 'lived', 'lived', 'living'), place: ['gfha-n', 'grAma-m', 'nagara-n', 'deSa-m', 'vana-n'], with: true },
  '04.0010': { en: e('dance', 'dances', 'danced', 'danced', 'dancing'), place: ['mandira-n', 'gfha-n', 'udyAna-n', 'vidyAlaya-m'], with: true },
  '04.0146': { en: e('get angry', 'gets angry', 'got angry', 'got angry', 'getting angry', { for: 'with' }), for: g('people') },
  '04.0081': { en: e('be pleased', 'is pleased', 'was pleased', 'been pleased', 'being pleased'), place: true },
  '06.0092': { en: e('write', 'writes', 'wrote', 'written', 'writing'), object: g('writing'), place: g('rooms'), for: g('people') },
  '06.0078': { en: e('want', 'wants', 'wanted', 'wanted', 'wanting'), object: g('food', 'drink', 'things', 'money', 'good') },
  '06.0149': { en: e('ask', 'asks', 'asked', 'asked', 'asking', { obj: 'about' }), object: ['mArga-m', 'mUlya-n', 'nAman-n', 'samaya-m', 'uttara-n', 'vizaya-m'] },
  '06.0160-upa': { en: e('sit', 'sits', 'sat', 'sat', 'sitting'), place: ['Asana-n', 'gfha-n', 'udyAna-n', 'kakzyA-f', 'prakozWa-m', 'mandira-n', 'BUmi-f'], with: true },
  '06.0160-pra': { en: e('enter', 'enters', 'entered', 'entered', 'entering'), object: ['gfha-n', 'vidyAlaya-m', 'ApaRa-m', 'mandira-n', 'prakozWa-m', 'kakzyA-f', 'kAryAlaya-m', 'nagara-n', 'grAma-m', 'vana-n', 'pAkaSAlA-f'], with: true },
  '06.0165': { en: e('meet', 'meets', 'met', 'met', 'meeting'), place: true, with: true },
  '06.0005': { en: e('throw', 'throws', 'threw', 'thrown', 'throwing'), object: ['Pala-n', 'patra-n', 'jala-n', 'puzpa-n', 'leKanI-f'], place: ['nadI-f', 'mArga-m', 'udyAna-n'] },
  '06.0158': { en: e('touch', 'touches', 'touched', 'touched', 'touching'), object: [...g('body', 'animals'), 'vfkza-m', 'puzpa-n', 'pustaka-n', 'jala-n'] },
  '06.0166': { en: e('set', 'sets', 'set', 'set', 'setting', { after: 'free' }), object: g('animals') },
  '06.0170': { en: e('water', 'waters', 'watered', 'watered', 'watering'), object: ['vfkza-m', 'puzpa-n', 'udyAna-n'] },
  '10.0389': { en: e('tell', 'tells', 'told', 'told', 'telling', { for: 'to' }), object: ['kaTA-f', 'uttara-n', 'vizaya-m', 'satya-n', 'nAman-n'], for: g('people') },
  '10.0002': { en: e('think about', 'thinks about', 'thought about', 'thought about', 'thinking about'), object: g('topics', 'people') },
  '10.0144': { en: e('worship', 'worships', 'worshipped', 'worshipped', 'worshipping'), object: ['deva-m', 'guru-m', 'sUrya-m', 'vfkza-m'], place: ['mandira-n', 'gfha-n'] },
  '10.0391': { en: e('count', 'counts', 'counted', 'counted', 'counting'), object: ['Dana-n', 'rUpyaka-n', 'Pala-n', 'pustaka-n', 'vfkza-m', 'puzpa-n', 'pakzin-m', 'akzara-n', 'dina-n'] },
  '10.0033': { en: e('eat up', 'eats up', 'ate up', 'eaten up', 'eating up'), object: g('food') },
  '10.0098': { en: e('look after', 'looks after', 'looked after', 'looked after', 'looking after'), object: [...g('people', 'animals'), 'vfkza-m', 'udyAna-n', 'gfha-n'] },
  '10.0001': { en: e('steal', 'steals', 'stole', 'stolen', 'stealing'), object: [...g('money'), 'Pala-n', 'pustaka-n', 'leKanI-f', 'syUta-m', 'GawI-f', 'dUravARI-f'], from: ['ApaRa-m', 'gfha-n', 'kAryAlaya-m'] },
  '10.0086-pra': { en: e('wash', 'washes', 'washed', 'washed', 'washing'), object: [...g('body'), 'vastra-n', 'pAtra-n', 'cazaka-m', 'yAna-n'], place: ['gfha-n', 'nadI-f', 'pAkaSAlA-f'] },
  '01.1130': { en: e('get', 'gets', 'got', 'got', 'getting'), object: [...g('money', 'good'), 'pustaka-n', 'Pala-n', 'uttara-n'], from: [...g('people'), ...g('places')] },
  '01.0696': { en: e('speak', 'speaks', 'spoke', 'spoken', 'speaking'), object: ['saMskfta-n', 'BAzA-f', 'satya-n'], place: true, with: true },
  '01.0574': { en: e('serve', 'serves', 'served', 'served', 'serving'), object: [...g('elders'), 'deva-m', 'deSa-m', 'atiTi-m'] },
  '01.0863': { en: e('grow', 'grows', 'grew', 'grown', 'growing'), place: ['udyAna-n', 'vana-n', 'gfha-n', 'grAma-m'] },
  '01.0016': { en: e('be happy', 'is happy', 'was happy', 'been happy', 'being happy'), place: true, with: true },
  '01.1001': { en: e('ask for', 'asks for', 'asked for', 'asked for', 'asking for'), object: [...g('money', 'good'), 'jala-n', 'anna-n', 'pustaka-n'] },
  '01.0694': { en: e('look at', 'looks at', 'looked at', 'looked at', 'looking at'), object: g('people', 'animals', 'nature', 'things', 'vehicles'), place: true },
  '01.0989': { en: e('have fun', 'has fun', 'had fun', 'had fun', 'having fun'), place: ['udyAna-n', 'vana-n', 'gfha-n', 'samudra-m', 'parvata-m'], with: true },
  '01.0435': { en: e('tremble', 'trembles', 'trembled', 'trembled', 'trembling'), place: true },
  '01.0689': { en: e('learn', 'learns', 'learned', 'learned', 'learning'), object: g('learnable'), place: ['vidyAlaya-m', 'mahAvidyAlaya-m', 'kakzyA-f', 'gfha-n', 'granTAlaya-m'], with: true, from: ['guru-m', 'aDyApaka-m', 'aDyApikA-f', 'mAtf-f', 'pitf-m'] },
  '01.0011': { en: e('greet', 'greets', 'greeted', 'greeted', 'greeting'), object: [...g('elders'), 'deva-m', 'mitra-n'] },
  '04.0073': { en: e('think about', 'thinks about', 'thought about', 'thought about', 'thinking about'), object: g('topics') },
  '04.0044': { en: e('be born', 'is born', 'was born', 'been born', 'being born'), place: ['grAma-m', 'nagara-n', 'deSa-m', 'cikitsAlaya-m', 'gfha-n'] },
  '04.0069': { en: e('fight', 'fights', 'fought', 'fought', 'fighting'), with: true, place: true },
  '02.0060': { en: e('be', 'is', 'was', 'been', 'being'), place: true, with: true },
  '08.0010': { en: e('do', 'does', 'did', 'done', 'doing'), object: ['kArya-n', 'gfhakArya-n', 'sAhAyya-n'], place: g('rooms'), with: true, for: g('people') },
  '03.0010': { en: e('give', 'gives', 'gave', 'given', 'giving', { for: 'to' }), object: g('food', 'drink', 'things', 'money'), for: g('people', 'animals') },
  '09.0043': { en: e('know', 'knows', 'knew', 'known', 'knowing'), object: [...g('topics', 'learnable'), 'mArga-m', ...g('people')] },
}
// Intransitive verbs whose "place" is anywhere sensible
const ANY_PLACE = ['gfha-n', 'vidyAlaya-m', 'udyAna-n', 'ApaRa-m', 'mandira-n', 'kAryAlaya-m', 'granTAlaya-m', 'BojanAlaya-m', 'grAma-m', 'nagara-n', 'prakozWa-m', 'kakzyA-f', 'vipaRi-f', 'sTAnaka-n', 'mahAvidyAlaya-m']
export function framePlace(f: Frame): string[] { return f.place === true ? ANY_PLACE : f.place || [] }
/** Objects you can count (two books, many fruits); places, body parts and mass nouns stay singular. */
const SINGLE = new Set([...G.places, ...G.body, ...G.drink, ...G.learnable, ...G.good, 'Dana-n', 'vetana-n', 'kArya-n', 'gfhakArya-n', 'sAhAyya-n', 'satya-n', 'AkASa-m', 'sUrya-m', 'candra-m', 'varzA-f', 'deva-m', 'mUlya-n', 'mArga-m', 'samaya-m', 'nAman-n', 'odana-m', 'anna-n', 'Bojana-n', 'daDi-n'])
export const countable = (slug: string) => !SINGLE.has(slug)
/** Body parts and family take "my / his / her" in English. */
export const POSSESSED = new Set([...G.body, 'mAtf-f', 'pitf-m', 'BrAtf-m', 'BaginI-f', 'putra-m', 'putrI-f', 'pati-m', 'patnI-f', 'pitAmaha-m', 'pitAmahI-f', 'mitra-n'])

// ── English ──────────────────────────────────────────────────────────────
const UNCOUNT = new Set(['water', 'milk', 'tea', 'rice', 'cooked rice', 'food', 'curd', 'ghee', 'salt', 'sugar', 'money', 'music', 'juice', 'fruit juice', 'Sanskrit', 'help', 'health', 'happiness', 'truth', 'homework', 'work', 'hair', 'drinking water', 'clothes', 'learning', 'language', 'sorrow', 'dal'])
const IRR: Record<string, string> = { child: 'children', person: 'people', foot: 'feet', tooth: 'teeth', mouse: 'mice', man: 'men', woman: 'women', leaf: 'leaves', knife: 'knives', life: 'lives', wife: 'wives', glass: 'glasses', box: 'boxes' }
const NUMW = ['', 'two', 'many']
/** "school, college" → "school"; "teacher (man)" → "teacher". */
export const nounEn = (m?: string | null) => (m || '').split(/[,;(]/)[0].trim()
function plural(w: string) {
  const [head, ...rest] = w.split(' ').reverse()
  const p = IRR[head] || (/(s|sh|ch|x|z)$/.test(head) ? head + 'es' : /[^aeiou]y$/.test(head) ? head.slice(0, -1) + 'ies' : head + 's')
  return [p, ...rest].reverse().join(' ')
}
export function nounPhrase(meaning: string, num: Num = 0, article = 'the') {
  const w = nounEn(meaning)
  if (!w) return ''
  if (UNCOUNT.has(w) || w === 'Sanskrit') return w === 'Sanskrit' ? 'Sanskrit' : `${article} ${w}`.trim()
  if (num === 0) return `${article} ${w}`.trim()
  return `${NUMW[num]} ${plural(w)}`
}
const OBJ_PRON: Record<string, string[]> = { u: ['me', 'us two', 'us'], m: ['you', 'you two', 'you all'], r: ['you', 'you two', 'you all'], pm: ['him', 'them two', 'them'], pf: ['her', 'them two', 'them'] }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export type Parts = { obj?: string; objNum?: Num; place?: string; with?: string; for?: string; from?: string; time?: string }
/** The English for a built sentence, active or passive, in the tense and person of the bar. */
export function englishSentence(f: Frame, s: Subject, when: WhenId, p: Parts, passive: boolean): string {
  const en = f.en
  const prep = (x: string) => x === 'the house' ? 'at home' : `${/ (house|room|kitchen|class|garden|forest|village|city|country|sky|river|sea)$/.test(x) ? 'in' : / (road|mountain|seat|bed|ground|earth)/.test(x) ? 'on' : 'at'} ${x}`
  const tail = [
    p.place ? prep(p.place) : '',
    p.with ? `with ${p.with}` : '',
    p.for ? `${en.for || 'for'} ${p.for}` : '',
    p.from ? `from ${p.from}` : '',
    p.time || '',
  ].filter(Boolean).join(' ')
  if (passive && p.obj) {
    const subj = cap(p.obj), many = (p.objNum ?? 0) > 0 && !UNCOUNT.has(nounEn(p.obj.replace(/^the /, '')))
    const by = 'by ' + (OBJ_PRON[s.per === 'p' ? 'p' + s.gen : s.per][s.num])
    const be = when === 'lrt' ? 'will be' : when === 'lan' || when === 'kta' ? (many ? 'were' : 'was') : when === 'vidhi' ? 'should be' : (many ? 'are' : 'is')
    const pp = en.pp + (en.after ? ' ' + en.after : '')
    const vp = when === 'lot' ? `Let ${p.obj} be ${pp} ${by}` : `${subj} ${be} ${pp} ${by}`
    return `${vp}${tail ? ' ' + tail : ''}${when === 'lot' ? '.' : '.'}`
  }
  const obj = p.obj ? (en.obj === 'to' && p.obj === 'the house' ? 'home' : `${en.obj ? en.obj + ' ' : ''}${p.obj}`) + (en.after ? ' ' + en.after : '') : ''
  const rest = [obj, tail].filter(Boolean).join(' ')
  const sp = rest ? ' ' + rest : ''
  const be = en.base === 'be' || en.base.startsWith('be ')
  const pres = be ? (s.per === 'u' && s.num === 0 ? 'am' : s.s3 ? 'is' : 'are') + en.base.slice(2) : s.s3 ? en.third : en.base
  const past = be ? ((s.per === 'u' && s.num === 0) || s.s3 ? 'was' : 'were') + en.base.slice(2) : en.past
  if (when === 'lat') return `${s.en} ${pres}${sp}.`
  if (when === 'lan' || when === 'kta') return `${s.en} ${past}${sp}.`
  if (when === 'lrt') return `${s.en} will ${en.base}${sp}.`
  if (when === 'vidhi') return `${s.en} should ${en.base}${sp}.`
  if (s.per === 'm') return `${s.num === 0 ? cap(en.base) : (s.num === 1 ? 'You two, ' : 'All of you, ') + en.base}${sp}!`
  if (s.per === 'r') return `Please ${en.base}${sp}.`
  if (s.per === 'u') return `${s.num === 0 ? 'Let me' : s.num === 1 ? 'Let us two' : "Let's"} ${en.base}${sp}.`
  return `Let ${s.num === 0 ? (s.gen === 'm' ? 'him' : 'her') : 'them'} ${en.base}${sp}.`
}
