import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors } from '../access/roles'

export const PracticeDecks: CollectionConfig = {
  slug: 'practice-decks',
  admin: { useAsTitle: 'title', group: 'Learning' },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'isDefault', type: 'checkbox', defaultValue: false },
    {
      name: 'cards', type: 'array', minRows: 1,
      fields: [
        { type: 'row', fields: [
          { name: 'phrase', type: 'relationship', relationTo: 'phrases', required: true, admin: { width: '40%' } },
          { name: 'person', type: 'select', required: true, options: [{ label: 'I / we', value: 'u' }, { label: 'you', value: 'm' }, { label: 'you, respectful', value: 'r' }, { label: 'he / she', value: 'p' }], admin: { width: '15%' } },
          { name: 'number', type: 'select', required: true, defaultValue: '0', options: [{ label: 'one', value: '0' }, { label: 'two', value: '1' }, { label: 'many', value: '2' }], admin: { width: '15%' } },
          { name: 'gender', type: 'select', required: true, defaultValue: 'm', options: [{ label: 'masc.', value: 'm' }, { label: 'fem.', value: 'f' }], admin: { width: '15%' } },
          { name: 'lakara', type: 'select', required: true, options: [{ label: 'spoken past', value: 'kta' }, { label: 'लङ्', value: 'lan' }, { label: 'लट्', value: 'lat' }, { label: 'लृट्', value: 'lrt' }, { label: 'लोट्', value: 'lot' }, { label: 'विधिलिङ्', value: 'vidhi' }], admin: { width: '15%' } },
        ] },
      ],
    },
  ],
}
