import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors } from '../access/roles'

/** Indeclinables (अव्यय): question words, place and time words, joining words. They never change form. */
export const Avyayas: CollectionConfig = {
  slug: 'avyayas',
  labels: { singular: 'Avyaya', plural: 'Avyayas (question words …)' },
  admin: { useAsTitle: 'word', group: 'Grammar', defaultColumns: ['word', 'meaning_en', 'category', 'order'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [
      { name: 'word', type: 'text', required: true, admin: { width: '30%', description: 'कुत्र, कदा, अपि …' } },
      { name: 'category', type: 'select', required: true, options: [
        { label: 'Question', value: 'question' }, { label: 'Place', value: 'place' }, { label: 'Time', value: 'time' },
        { label: 'Joining', value: 'join' }, { label: 'Manner & more', value: 'manner' }, { label: 'Yes / no', value: 'yesno' },
      ], admin: { width: '30%' } },
      { name: 'order', type: 'number', admin: { width: '20%' } },
    ] },
    { type: 'row', fields: [
      { name: 'meaning_en', type: 'text', required: true, admin: { width: '25%' } },
      { name: 'meaning_te', type: 'text', admin: { width: '25%' } },
      { name: 'meaning_kn', type: 'text', admin: { width: '25%' } },
      { name: 'meaning_ta', type: 'text', admin: { width: '25%' } },
    ] },
    { type: 'row', fields: [
      { name: 'example', type: 'text', admin: { width: '50%', description: 'A short Sanskrit phrase using it' } },
      { name: 'example_en', type: 'text', admin: { width: '50%' } },
    ] },
  ],
}
