import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SubhashitaClient } from '@/components/pages/Subhashita'
import { JsonLd } from '@/components/samvada/JsonLd'
import { getSubhashita, getSubhashitas } from '@/lib/data'
import { cardUrl } from '@/lib/card'
import { SITE, breadcrumbs, langOf, prefix, verseMeta } from '@/lib/seo'

export const revalidate = 86400 // a safety net: edits refresh pages at once (src/lib/revalidate.ts)
export async function generateStaticParams() { return (await getSubhashitas()).map((s) => ({ slug: s.slug })) }
type P = { params: Promise<{ slug: string; lang?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug, lang } = await params
  const r = await getSubhashita(slug)
  if (!r) return {}
  const m = verseMeta(r.s, langOf(lang))
  const image = cardUrl({ t: r.s.text, s: r.s.meaning[0].length > 90 ? r.s.meaning[0].slice(0, 88) + '…' : r.s.meaning[0], k: `सुभाषितम् · ${r.s.source || ''}`, c: 'p' })
  return { ...m, openGraph: { ...m.openGraph, images: [{ url: image, width: 1200, height: 630 }] } }
}

export default async function SubhashitaPage({ params }: P) {
  const { slug, lang: l } = await params
  const r = await getSubhashita(slug)
  if (!r) notFound()
  const lang = langOf(l), first = r.s.text.split('\n')[0].replace(/[।॥]/g, '').trim()
  const work = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: first, text: r.s.text, inLanguage: 'sa', description: r.s.meaning[0], url: `${SITE}${prefix(lang)}/subhashita/${r.s.slug}`, ...(r.s.source ? { isPartOf: { '@type': 'CreativeWork', name: r.s.source } } : {}) }
  return (
    <>
      <JsonLd data={[breadcrumbs(lang, [['subhashitas', '/subhashitas'], [first, `/subhashita/${r.s.slug}`]]), work]} />
      <SubhashitaClient {...r} />
    </>
  )
}
