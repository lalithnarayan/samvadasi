import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { jsonField } from '../lib/jsonField'
import { anyone, editors } from '../access/roles'

/** A sentence pattern: [subject] + words + [verb]. Subject and verb change with WHO / WHEN in the app. */
export const Phrases: CollectionConfig = {
  slug: 'phrases',
  admin: { useAsTitle: 'label', group: 'Learning', defaultColumns: ['label', 'situation', 'dhatu', 'order'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  fields: [
    { name: 'label', type: 'text', required: true, admin: { description: 'Internal name, e.g. "go to school"' } },
    { type: 'row', fields: [
      { name: 'situation', type: 'relationship', relationTo: 'situations', admin: { width: '30%', description: 'For the Phrases page' } },
      { name: 'pack', type: 'relationship', relationTo: 'packs', admin: { width: '25%', description: 'Or for a vocabulary pack' } },
      { name: 'dhatu', type: 'relationship', relationTo: 'dhatus', required: true, admin: { width: '30%' } },
      { name: 'order', type: 'number', admin: { width: '15%' } },
    ] },
    { name: 'words', type: 'array', admin: { description: 'Words between the subject and the verb, already in the right case (विद्यालयं, उद्याने).' }, fields: [{ name: 'text', type: 'text', required: true }] },
    { name: 'english', type: 'group', fields: [
      { type: 'row', fields: [
        { name: 'base', type: 'text', required: true, admin: { width: '25%', description: 'go' } },
        { name: 'third', type: 'text', required: true, admin: { width: '25%', description: 'goes' } },
        { name: 'past', type: 'text', required: true, admin: { width: '25%', description: 'went' } },
        { name: 'tail', type: 'text', admin: { width: '25%', description: 'to school' } },
      ] },
    ] },
    jsonField('local', { description: 'Telugu / Kannada / Tamil wording: {"te": ["go", "బడికి"], "kn": [...], "ta": [...]} — the verb key from the translation engine and the words before it' }),
    { name: 'note', type: 'textarea' },
  ],
}
