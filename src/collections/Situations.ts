import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors } from '../access/roles'

export const Situations: CollectionConfig = {
  slug: 'situations',
  admin: { useAsTitle: 'title', group: 'Learning', defaultColumns: ['title', 'titleSa', 'order'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  defaultSort: 'order',
  fields: [
    { type: 'row', fields: [
      { name: 'title', type: 'text', required: true, admin: { width: '40%' } },
      { name: 'titleSa', type: 'text', admin: { width: '40%', description: 'e.g. प्रातः गृहे' } },
      { name: 'order', type: 'number', admin: { width: '20%' } },
    ] },
    { name: 'phrases', type: 'join', collection: 'phrases', on: 'situation', defaultSort: 'order' },
  ],
}
