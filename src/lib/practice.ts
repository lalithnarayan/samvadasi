/**
 * Daily practice, kept in the browser (no account needed).
 *  - Spaced review: each word, verb and verse sits in a box 0–5. A right answer moves it up a box and
 *    out to 1, 3, 7, 21 or 60 days; a wrong answer drops it back to box 0, due tomorrow.
 *  - Streak: a day counts once a session is finished. One freeze per week covers a single missed day.
 */
import type { TodayPool, TodayVerb, TodayVerse, TodayWord } from './data'

export const INTERVALS = [1, 1, 3, 7, 21, 60]
const KEY = 'samvada:practice:v1'

export type Card = { box: number; due: number; seen: number; right: number }
export type Store = {
  cards: Record<string, Card>
  last: number // day number of the last finished session (0 = never)
  streak: number
  best: number
  freezeWeek: number // week number when the freeze was last used
  first: number // day of the first session
  days: number[] // finished days, newest last (kept to 60)
  returned?: boolean // day-2 return already reported
}
const EMPTY: Store = { cards: {}, last: 0, streak: 0, best: 0, freezeWeek: -1, first: 0, days: [] }

/** Local day number (midnight in the learner's own time zone). */
export const today = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60e3) / 86400e3)
export const weekOf = (day: number) => Math.floor((day + 3) / 7) // weeks start on Monday

export function load(): Store {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') return { ...EMPTY, ...s } } catch {}
  return { ...EMPTY, cards: {} }
}
export function save(s: Store) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} }

/** The streak as it stands today: broken if more than one day (or two, with the freeze) was missed. */
export function liveStreak(s: Store, d = today()) {
  if (!s.last) return 0
  const gap = d - s.last
  if (gap <= 1) return s.streak
  if (gap === 2 && s.freezeWeek !== weekOf(d)) return s.streak
  return 0
}
export const freezeReady = (s: Store, d = today()) => s.freezeWeek !== weekOf(d)

/** Record one finished session. Returns the new store and what happened. */
export function finishDay(s: Store, d = today()): { store: Store; froze: boolean; firstEver: boolean } {
  const firstEver = !s.last
  if (s.last === d) return { store: s, froze: false, firstEver }
  const gap = s.last ? d - s.last : Infinity
  let streak = 1, froze = false, freezeWeek = s.freezeWeek
  if (gap === 1) streak = s.streak + 1
  else if (gap === 2 && s.freezeWeek !== weekOf(d)) { streak = s.streak + 1; froze = true; freezeWeek = weekOf(d) }
  const store = { ...s, last: d, streak, best: Math.max(s.best, streak), freezeWeek, first: s.first || d, days: [...s.days.filter((x) => x !== d), d].slice(-60) }
  return { store, froze, firstEver }
}

export function grade(s: Store, id: string, right: boolean, d = today()): Store {
  const c = s.cards[id] || { box: 0, due: d, seen: 0, right: 0 }
  const box = right ? Math.min(5, c.box + 1) : 0
  return { ...s, cards: { ...s.cards, [id]: { box, due: d + INTERVALS[box], seen: c.seen + 1, right: c.right + (right ? 1 : 0) } } }
}

export const dueCount = (s: Store, d = today()) => Object.values(s.cards).filter((c) => c.due <= d).length
export const learnedCount = (s: Store) => Object.values(s.cards).filter((c) => c.box >= 2).length

// ── exercises ───────────────────────────────────────────────────────────
export type Ex =
  | { kind: 'meaning'; id: string; word: TodayWord; options: string[]; answer: number }
  | { kind: 'reverse'; id: string; word: TodayWord; options: string[]; answer: number }
  | { kind: 'listen'; id: string; word: TodayWord; options: string[]; answer: number }
  | { kind: 'match'; ids: string[]; pairs: TodayWord[] }
  | { kind: 'ending'; id: string; verb: TodayVerb; person: 0 | 1 | 2; tense: 'lat' | 'lrt'; options: string[]; answer: number }
  | { kind: 'spot'; id: string; verb: TodayVerb; lines: string[]; answer: number }
  | { kind: 'order'; id: string; verse: TodayVerse; line: string; tokens: string[] }
  | { kind: 'blank'; id: string; verse: TodayVerse; line: string; gap: number; options: string[]; answer: number }

export const PRON = ['सः', 'त्वम्', 'अहम्'] as const

/** A seeded random so a session doesn't reshuffle on re-render. */
export function rng(seed: number) { let a = seed >>> 0 || 1; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 1e6) / 1e6 } }
const shuffle = <T,>(xs: T[], r: () => number) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const sample = <T,>(xs: T[], n: number, r: () => number) => shuffle(xs, r).slice(0, n)

/** Four options with the answer at a random place; distractors come from the same pool. */
function choices(answer: string, pool: string[], r: () => number) {
  const others = sample([...new Set(pool.filter((x) => x && x !== answer))], 3, r)
  const opts = shuffle([answer, ...others], r)
  return { options: opts, answer: opts.indexOf(answer) }
}

/**
 * Today's session: due reviews first (most overdue first), then new items, about 10 steps:
 * words (meaning / reverse / listen), a match-pairs round, two verb steps and one verse step.
 */
export function buildSession(pool: TodayPool, s: Store, col: number, seed: number, hasAudio: (sa: string) => boolean, size = 10): Ex[] {
  const r = rng(seed), d = today()
  const mean = (w: TodayWord) => w.m[col] || w.m[0]
  const due = (id: string) => (s.cards[id] ? s.cards[id].due <= d : false)
  const fresh = (id: string) => !s.cards[id]
  const byDue = (a: { id: string }, b: { id: string }) => s.cards[a.id].due - s.cards[b.id].due

  const words = pool.words.filter((w) => mean(w))
  const dueWords = words.filter((w) => due(w.id)).sort(byDue)
  const newWords = shuffle(words.filter((w) => fresh(w.id)), r)
  const dueVerbs = pool.verbs.filter((v) => due(v.id)).sort(byDue)
  const newVerbs = pool.verbs.filter((v) => fresh(v.id))
  const out: Ex[] = []

  // words: up to 5 reviews, topped up with new ones to 6
  const ws = [...dueWords.slice(0, 5), ...newWords].slice(0, 6)
  const allMeanings = words.map(mean), allSa = words.map((w) => w.sa)
  ws.forEach((w, i) => {
    const kind = w.sa.length < 24 && hasAudio(w.sa) && i % 3 === 2 ? 'listen' : (s.cards[w.id]?.box || 0) >= 2 || i % 3 === 1 ? 'reverse' : 'meaning'
    if (kind === 'meaning') out.push({ kind, id: w.id, word: w, ...choices(mean(w), allMeanings, r) })
    else out.push({ kind, id: w.id, word: w, ...choices(w.sa, allSa, r) })
  })

  // match pairs: four more words (reviews first)
  const pairPool = [...dueWords.slice(5), ...newWords.slice(6)].filter((w) => !ws.includes(w))
  const pairs = pairPool.slice(0, 4)
  if (pairs.length === 4 && new Set(pairs.map(mean)).size === 4) out.push({ kind: 'match', ids: pairs.map((w) => w.id), pairs })

  // verbs: two steps
  const vs = [...dueVerbs, ...newVerbs.slice(0, 8)].slice(0, 2)
  vs.forEach((v, i) => {
    const tense: 'lat' | 'lrt' = (s.cards[v.id]?.box || 0) >= 2 && v.lrt[0] ? 'lrt' : 'lat'
    const person = Math.floor(r() * 3) as 0 | 1 | 2
    if (i === 1) {
      // spot the mistake: three short sentences, one with the wrong person
      const wrong = Math.floor(r() * 3)
      const lines = [0, 1, 2].map((p) => `${PRON[p]} ${v.lat[p === wrong ? (p + 1 + Math.floor(r() * 2)) % 3 : p]}`)
      if (new Set(lines).size === 3 && lines[wrong] !== `${PRON[wrong]} ${v.lat[wrong]}` && lines.every((l, p) => p === wrong || l.endsWith(v.lat[p]))) { out.push({ kind: 'spot', id: v.id, verb: v, lines, answer: wrong }); return }
    }
    const right = v[tense][person]
    const pool2 = [...v[tense], ...(tense === 'lat' ? v.lrt : v.lat)]
    out.push({ kind: 'ending', id: v.id, verb: v, person, tense, ...choices(right, pool2, r) })
  })

  // verse: today's verse first, otherwise a due one, otherwise any
  const vod = pool.verses.find((x) => x.slug === pool.verseOfDay)
  const verse = pool.verses.find((x) => due(x.id)) || vod || pool.verses[Math.floor(r() * pool.verses.length)]
  if (verse) {
    const lines = verse.lines.filter((l) => l.split(/\s+/).length >= 2)
    const line = lines[Math.floor(r() * lines.length)] || verse.lines[0]
    const tokens = line.split(/\s+/)
    if (tokens.length >= 3 && tokens.length <= 6 && new Set(tokens).size === tokens.length) out.push({ kind: 'order', id: verse.id, verse, line, tokens: shuffle(tokens, r) })
    else if (tokens.length >= 2) {
      const gap = Math.floor(r() * tokens.length)
      const others = pool.verses.flatMap((x) => (x === verse ? [] : x.lines.flatMap((l) => l.split(/\s+/)))).filter((t) => t.length > 2)
      out.push({ kind: 'blank', id: verse.id, verse, line, gap, ...choices(tokens[gap], others, r) })
    }
  }

  // keep words, then pairs, verbs and the verse spread through the session
  const head = out.filter((e) => e.kind === 'meaning' || e.kind === 'reverse' || e.kind === 'listen')
  const rest = out.filter((e) => !(head as Ex[]).includes(e))
  const mixed: Ex[] = []
  head.forEach((e, i) => { mixed.push(e); if (i % 2 === 1 && rest.length) mixed.push(rest.shift()!) })
  return [...mixed, ...rest].slice(0, size + 1)
}
