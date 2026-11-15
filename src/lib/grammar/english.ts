import type { WhenId } from './types'
import type { Subject } from './subjects'

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export function englishLine(s: Subject, when: WhenId, e: { base: string; third: string; past: string; tail?: string | null }): string {
  const b = e.base, tail = e.tail ? ' ' + e.tail : ''
  if (when === 'lat') return `${s.en} ${s.s3 ? e.third : b}${tail}.`
  if (when === 'lan' || when === 'kta') return `${s.en} ${e.past}${tail}.`
  if (when === 'lrt') return `${s.en} will ${b}${tail}.`
  if (when === 'vidhi') return `${s.en} should ${b}${tail}.`
  if (s.per === 'm') return (s.num === 0 ? cap(b) : (s.num === 1 ? 'You two, ' : 'All of you, ') + b) + tail + '!'
  if (s.per === 'r') return `Please ${b}${tail}${s.gen === 'm' ? ' (sir)' : ' (madam)'}.`
  if (s.per === 'u') return (s.num === 0 ? 'Let me ' : s.num === 1 ? 'Let us two ' : "Let's ") + b + tail + '.'
  return `Let ${s.num === 0 ? (s.gen === 'm' ? 'him' : 'her') : 'them'} ${b}${tail}.`
}
