import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
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
      { name: 'situation', type: 'relationship', relationTo: 'situations', required: true, admin: { width: '40%' } },
      { name: 'dhatu', type: 'relationship', relationTo: 'dhatus', required: true, admin: { width: '40%' } },
      { name: 'order', type: 'number', admin: { width: '20%' } },
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
    { name: 'note', type: 'textarea' },
  ],
}
