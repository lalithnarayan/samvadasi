import type { DhatuLite, WhenId } from './types'
import { genderWords, type Subject } from './subjects'
import { padaOf } from './forms'

/** A teacher's margin note for a sentence, when there is something worth knowing. */
export function noteFor(d: DhatuLite, when: WhenId, s: Subject, cellNote?: string): string {
  if (cellNote) return cellNote
  if (when === 'kta') return `Spoken past: the ending follows ${genderWords(s.gen, s.num)}, not the person.`
  if (d.irregular) return 'Irregular: the whole word changes. Learn it whole.'
  if (padaOf(d) === 'A') return 'आत्मनेपद verb: endings -ते / -से / -े, not -ति / -सि / -आमि.'
  if (s.per === 'r') return 'Respectful “you”, so the verb takes the he/she ending.'
  return ''
}
