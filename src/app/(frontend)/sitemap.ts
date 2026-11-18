import type { MetadataRoute } from 'next'
import { allSlugs, getNouns, getPacks, getSubhashitas } from '@/lib/data'
import { LOCALES, SITE, sitemapAlternates } from '@/lib/seo'

export const revalidate = 86400

/**
 * Every page in English and in its /te, /kn, /ta copies, each listing the others as hreflang
 * alternates — about 12,000 URLs, inside the 50,000 a sitemap may hold.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const fixed = ['', '/today', '/phrases', '/verbs', '/nouns', '/words', '/build', '/packs', '/greetings', '/subhashitas', '/practice', '/support']
  const [{ dhatus, featured }, nouns, packs, subh] = await Promise.all([allSlugs(), getNouns(), getPacks(), getSubhashitas()])
  type F = MetadataRoute.Sitemap[number]['changeFrequency']
  const pages: [string, F, number][] = [
    ...fixed.map((p): [string, F, number] => [p, 'weekly', p === '' ? 1 : 0.8]),
    ...subh.map((x): [string, F, number] => [`/subhashita/${x.slug}`, 'monthly', 0.7]),
    ...packs.map((k): [string, F, number] => [`/packs/${k.slug}`, 'monthly', 0.7]),
    ...nouns.map((n): [string, F, number] => [`/noun/${n.slug}`, 'monthly', 0.6]),
    ...dhatus.map((s): [string, F, number] => [`/verb/${s}`, 'monthly', featured.has(s) ? 0.7 : 0.4]),
  ]
  return pages.flatMap(([path, changeFrequency, priority]) => {
    const alternates = sitemapAlternates(path)
    return [SITE + (path || '/'), ...LOCALES.map((l) => `${SITE}/${l}${path}`)].map((url, i) => ({ url, lastModified: now, changeFrequency, priority: i === 0 ? priority : Math.round(priority * 90) / 100, alternates }))
  })
}
