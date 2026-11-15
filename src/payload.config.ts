import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Dhatus } from './collections/Dhatus'
import { Nouns } from './collections/Nouns'
import { Situations } from './collections/Situations'
import { Phrases } from './collections/Phrases'
import { PracticeDecks } from './collections/PracticeDecks'
import { Examples } from './collections/Examples'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  // Payload's REST API lives at /cms-api so /api/vidyut stays free for the Python (Vidyut) function.
  routes: { api: '/cms-api', admin: '/admin' },
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — Samvadasi CMS' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Dhatus, Nouns, Situations, Phrases, PracticeDecks, Examples, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Schema changes always go through migrations (npm run migrate:create), so local and production stay identical.
    push: false,
  }),
  plugins: [],
})
