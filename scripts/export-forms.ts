/** Export every dhātu's stored forms + overrides from the CMS for the Vidyut release check. */
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const out: unknown[] = []
for (let page = 1; ; page++) {
  const r = await payload.find({ collection: 'dhatus', limit: 500, page, depth: 0, select: { slug: true, display: true, aupadeshika: true, gana: true, prefixes: true, forms: true, overrides: true } as any })
  out.push(...r.docs)
  if (!r.hasNextPage) break
}
fs.mkdirSync('data/export', { recursive: true })
fs.writeFileSync('data/export/cms-forms.json', JSON.stringify(out))
console.log(`exported ${out.length} dhatus → data/export/cms-forms.json`)
process.exit(0)
