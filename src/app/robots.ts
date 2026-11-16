import type { MetadataRoute } from 'next'

const site = process.env.NEXT_PUBLIC_SERVER_URL || 'https://samvada.si'
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/cms-api', '/api/'] }], sitemap: `${site}/sitemap.xml`, host: site }
}
