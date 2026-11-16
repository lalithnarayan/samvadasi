import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors, reviewersField } from '../access/roles'

/** सुभाषितानि — short verses of wisdom, with the word split and meanings in four languages. */
export const Subhashitas: CollectionConfig = {
  slug: 'subhashitas',
  labels: { singular: 'Subhāṣita', plural: 'Subhāṣitas' },
  admin: { useAsTitle: 'slug', group: 'Learning', defaultColumns: ['slug', 'theme', 'source', 'reviewed', 'order'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [
      { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { width: '30%' } },
      { name: 'theme', type: 'select', required: true, options: ['learning', 'effort', 'speech', 'kindness', 'friendship', 'life', 'world'].map((v) => ({ label: v, value: v })), admin: { width: '20%' } },
      { name: 'source', type: 'text', admin: { width: '35%', description: 'e.g. Hitopadeśa, Bhagavad Gītā 2.47' } },
      { name: 'order', type: 'number', admin: { width: '15%' } },
    ] },
    { name: 'text', type: 'textarea', required: true, admin: { description: 'The verse in Devanagari, one half-verse per line, with । and ॥' } },
    { name: 'padaccheda', type: 'textarea', admin: { description: 'Word split (पदच्छेद): every word separated, sandhi undone' } },
    { name: 'meaning_en', type: 'textarea', required: true },
    { name: 'meaning_te', type: 'textarea' },
    { name: 'meaning_kn', type: 'textarea' },
    { name: 'meaning_ta', type: 'textarea' },
    { name: 'reviewed', type: 'checkbox', defaultValue: false, access: { update: reviewersField }, admin: { description: 'A teacher has checked the text and the meanings' } },
  ],
}
