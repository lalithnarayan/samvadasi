import type { DhatuLite, WhenId } from './types'
import type { Subject } from './subjects'
import { padaOf } from './forms'
import { genderWordsIn, type Lang, type T } from '../i18n'

/** A teacher's margin note for a sentence, when there is something worth knowing. */
export function noteFor(d: DhatuLite, when: WhenId, s: Subject, cellNote: string | undefined, t: T, lang: Lang): string {
  if (cellNote) return cellNote
  if (when === 'kta') return t('n.kta', { g: genderWordsIn(lang, s.gen, s.num) })
  if (d.irregular) return t('n.irregular')
  if (padaOf(d) === 'A') return t('n.atmane')
  if (s.per === 'r') return t('n.resp')
  return ''
}
