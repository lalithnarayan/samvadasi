/**
 * Split src/lib/i18n/ui.ts (every string in four languages) into one file per language, so a page
 * ships only its own language. Runs before every build; a test fails if the files are stale.
 *   npx tsx scripts/i18n/build-dicts.ts
 */
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { UI } from '../../src/lib/i18n/ui'

export const LANGS = ['en', 'te', 'kn', 'ta'] as const
export function dictSource(col: number): string {
  const body = Object.entries(UI).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify((v as readonly string[])[col] || (v as readonly string[])[0])},`).join('\n')
  return `// Generated from ui.ts by scripts/i18n/build-dicts.ts. Do not edit; edit ui.ts and rebuild.\nimport type { Dict } from '..'\n\nconst dict: Dict = {\n${body}\n}\nexport default dict\n`
}

if (process.argv[1]?.endsWith('build-dicts.ts')) {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/lib/i18n/dict')
  LANGS.forEach((l, i) => writeFileSync(path.join(dir, `${l}.ts`), dictSource(i)))
  console.log('wrote', LANGS.map((l) => `dict/${l}.ts`).join(', '))
}
