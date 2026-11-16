import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors } from '../access/roles'

/** Everyday vocabulary packs: words plus phrases that change with the who / when bar. */
export const Packs: CollectionConfig = {
  slug: 'packs',
  admin: { useAsTitle: 'title', group: 'Learning', defaultColumns: ['title', 'titleSa', 'order'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [
      { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { width: '25%' } },
      { name: 'title', type: 'text', required: true, admin: { width: '25%', description: 'English' } },
      { name: 'titleSa', type: 'text', admin: { width: '30%' } },
      { name: 'order', type: 'number', admin: { width: '20%' } },
    ] },
    { type: 'row', fields: [
      { name: 'title_te', type: 'text', admin: { width: '33%' } },
      { name: 'title_kn', type: 'text', admin: { width: '33%' } },
      { name: 'title_ta', type: 'text', admin: { width: '34%' } },
    ] },
    { name: 'words', type: 'array', fields: [
      { type: 'row', fields: [
        { name: 'sa', type: 'text', required: true, admin: { width: '20%' } },
        { name: 'en', type: 'text', required: true, admin: { width: '20%' } },
        { name: 'te', type: 'text', admin: { width: '20%' } },
        { name: 'kn', type: 'text', admin: { width: '20%' } },
        { name: 'ta', type: 'text', admin: { width: '20%' } },
      ] },
      { name: 'noun', type: 'relationship', relationTo: 'nouns', admin: { description: 'Link to its declension table (optional)' } },
    ] },
    { name: 'phrases', type: 'join', collection: 'phrases', on: 'pack', defaultSort: 'order' },
  ],
}
