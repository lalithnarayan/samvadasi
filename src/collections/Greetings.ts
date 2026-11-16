import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors } from '../access/roles'

/** Greetings and everyday courtesies, and Sanskrit names with their meanings. */
export const Greetings: CollectionConfig = {
  slug: 'greetings',
  admin: { useAsTitle: 'text', group: 'Learning', defaultColumns: ['text', 'kind', 'meaning_en', 'order'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [
      { name: 'text', type: 'text', required: true, admin: { width: '35%' } },
      { name: 'kind', type: 'select', required: true, defaultValue: 'greeting', options: [{ label: 'Greeting', value: 'greeting' }, { label: 'Name', value: 'name' }], admin: { width: '20%' } },
      { name: 'gender', type: 'select', options: [{ label: 'boy', value: 'm' }, { label: 'girl', value: 'f' }], admin: { width: '15%', condition: (d) => d?.kind === 'name' } },
      { name: 'reply', type: 'text', admin: { width: '30%', description: 'Usual reply, e.g. नमस्ते → नमस्ते' } },
    ] },
    { name: 'order', type: 'number' },
    { type: 'row', fields: [
      { name: 'meaning_en', type: 'text', required: true, admin: { width: '25%' } },
      { name: 'meaning_te', type: 'text', admin: { width: '25%' } },
      { name: 'meaning_kn', type: 'text', admin: { width: '25%' } },
      { name: 'meaning_ta', type: 'text', admin: { width: '25%' } },
    ] },
    { type: 'row', fields: [
      { name: 'when_en', type: 'text', admin: { width: '25%', description: 'When to say it' } },
      { name: 'when_te', type: 'text', admin: { width: '25%' } },
      { name: 'when_kn', type: 'text', admin: { width: '25%' } },
      { name: 'when_ta', type: 'text', admin: { width: '25%' } },
    ] },
  ],
}
