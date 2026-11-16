import type { MetadataRoute } from 'next'
import { allSlugs, getNouns, getPacks } from '@/lib/data'

const site = process.env.NEXT_PUBLIC_SERVER_URL || 'https://samvada.si'
export const revalidate = 86400

/** Every page, including all 2,431 verb pages and the noun pages, so Google can find them. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const fixed = ['', '/phrases', '/verbs', '/nouns', '/words', '/build', '/packs', '/greetings', '/practice', '/support']
  const [{ dhatus, featured }, nouns, packs] = await Promise.all([allSlugs(), getNouns(), getPacks()])
  return [
    ...fixed.map((p) => ({ url: site + p, lastModified: now, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.8 })),
    ...nouns.map((n) => ({ url: `${site}/noun/${n.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...packs.map((k) => ({ url: `${site}/packs/${k.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...dhatus.map((s) => ({ url: `${site}/verb/${s}`, lastModified: now, changeFrequency: 'monthly' as const, priority: featured.has(s) ? 0.7 : 0.4 })),
  ]
}
