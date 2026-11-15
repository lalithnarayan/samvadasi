import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors } from '../access/roles'

/** Real usage from Ambuda's library (Gītā, Rāmāyaṇa …), linked to a dhātu. */
export const Examples: CollectionConfig = {
  slug: 'examples',
  admin: { useAsTitle: 'text', group: 'Learning', defaultColumns: ['text', 'source', 'dhatu', 'form'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  fields: [
    { name: 'text', type: 'textarea', required: true },
    { type: 'row', fields: [
      { name: 'dhatu', type: 'relationship', relationTo: 'dhatus', required: true, admin: { width: '40%' } },
      { name: 'form', type: 'text', admin: { width: '15%', description: 'Verb form' } },
      { name: 'token', type: 'text', admin: { width: '15%', description: 'As written in the verse (with sandhi)' } },
      { name: 'source', type: 'text', admin: { width: '30%', description: 'e.g. Bhagavad Gītā 2.47' } },
    ] },
    { name: 'translation', type: 'textarea' },
    { name: 'url', type: 'text', admin: { description: 'Link to the text on ambuda.org' } },
    { type: 'row', fields: [
      { name: 'licence', type: 'text', admin: { width: '60%', description: 'Licence of the source text (GRETIL: CC BY-NC-SA 4.0)' } },
      { name: 'reviewed', type: 'checkbox', defaultValue: false, admin: { width: '40%', description: 'A teacher confirmed the match is really this verb (not a homograph)' } },
    ] },
  ],
}
