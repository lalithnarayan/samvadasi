import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { anyone, editors } from '../access/roles'

/**
 * Recorded audio. Each clip is matched by its exact Devanagari text (a form, phrase or greeting);
 * wherever a recording exists the play button uses it, elsewhere the browser's voice reads the text
 * and is labelled "machine voice". Put the file anywhere public (e.g. Vercel Blob) and paste its URL.
 */
export const Audio: CollectionConfig = {
  slug: 'audio',
  labels: { singular: 'Audio clip', plural: 'Audio' },
  admin: { useAsTitle: 'text', group: 'Learning', defaultColumns: ['text', 'speaker', 'source'] },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  access: { read: anyone, create: editors, update: editors, delete: editors },
  fields: [
    { name: 'text', type: 'text', required: true, unique: true, index: true, admin: { description: 'Exactly as shown on the site, in Devanagari: गच्छति, अहं विद्यालयं गच्छामि' } },
    { name: 'url', type: 'text', admin: { description: 'Public URL of an .mp3 / .m4a / .ogg file — or leave empty and record on the /record page' } },
    { name: 'file', type: 'textarea', admin: { hidden: true } },
    { name: 'mime', type: 'text', admin: { hidden: true } },
    { type: 'row', fields: [
      { name: 'speaker', type: 'text', admin: { width: '50%' } },
      { name: 'source', type: 'select', defaultValue: 'recorded', options: [{ label: 'Recorded', value: 'recorded' }, { label: 'Machine', value: 'machine' }], admin: { width: '50%' } },
    ] },
  ],
}
