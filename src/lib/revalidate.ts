/**
 * Pages are cached until their content changes. After an edit in the CMS, refresh only the routes
 * that read the edited collection, in English and in the /te /kn /ta copies. Skipped during bulk seeding.
 */
const EVERYWHERE = ['/today', '/path', '/path/[n]']

export const ROUTES: Record<string, string[]> = {
  dhatus: ['/', '/verbs', '/verb/[slug]', '/phrases', '/practice', '/build', '/packs/[slug]', ...EVERYWHERE],
  nouns: ['/nouns', '/noun/[slug]', '/words', '/build', '/packs/[slug]', '/subhashita/[slug]', ...EVERYWHERE],
  packs: ['/packs', '/packs/[slug]', '/script', ...EVERYWHERE],
  subhashitas: ['/', '/subhashitas', '/subhashita/[slug]', '/script', ...EVERYWHERE],
  greetings: ['/greetings', '/script', ...EVERYWHERE],
  avyayas: ['/words', ...EVERYWHERE],
  phrases: ['/phrases', '/packs/[slug]', '/practice'],
  situations: ['/phrases'],
  examples: ['/verb/[slug]'],
  'practice-decks': ['/practice'],
  audio: [], // recordings are read through /audio-index, which refreshes every 5 minutes
}

/**
 * Every route pattern to refresh for a collection, in both trees. Next tags a cached page with its
 * file path, route-group folder included (`/(frontend)/noun/[slug]/page`), so the folder is part of
 * the pattern; without it the call matches nothing.
 */
export function pathsFor(collection: string): [string, 'page' | 'layout'][] {
  const routes = ROUTES[collection]
  if (!routes) return [['/', 'layout']] // unknown collection: every page shares the root tag
  return routes.flatMap((r): [string, 'page'][] => [[`/(frontend)${r === '/' ? '' : r}`, 'page'], [`/(loc)/[lang]${r === '/' ? '' : r}`, 'page']])
}

type HookArgs = { doc: unknown; req?: { context?: Record<string, unknown> }; collection?: { slug: string } }

export const revalidateSite = async ({ doc, req, collection }: HookArgs) => {
  if (req?.context?.skipRevalidate) return doc
  try {
    const { revalidatePath } = await import('next/cache')
    for (const [path, type] of pathsFor(collection?.slug || '')) revalidatePath(path, type)
  } catch (e) {
    console.error('[revalidate]', (e as Error).message)
  }
  return doc
}
