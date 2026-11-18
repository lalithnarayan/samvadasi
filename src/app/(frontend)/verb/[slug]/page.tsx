import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VerbClient } from '@/components/pages/Verb'
import { JsonLd } from '@/components/samvada/JsonLd'
import { getDhatu, getExamples, getRelatives } from '@/lib/data'
import { cardUrl } from '@/lib/card'
import { breadcrumbs, keyForms, langOf, plain, termLd, verbMeta } from '@/lib/seo'

export const revalidate = 3600
type P = { params: Promise<{ slug: string; lang?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug: raw, lang: l } = await params
  const slug = decodeURIComponent(raw), lang = langOf(l)
  const d = await getDhatu(slug)
  if (!d) return {}
  const m = verbMeta(d, lang, slug), lat = keyForms(d).lat
  const image = cardUrl({ t: lat ? `${d.display} · ${lat}` : d.display, s: d.meaning_en || d.artha_sa || '', k: `Sanskrit verb · ${d.code}`, c: 'p' })
  return { ...m, openGraph: { ...m.openGraph, images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: 'summary_large_image', images: [image] } }
}

export default async function VerbPage({ params }: P) {
  const { slug: raw, lang: l } = await params
  const slug = decodeURIComponent(raw), lang = langOf(l)
  const d = await getDhatu(slug)
  if (!d) notFound()
  const [examples, relatives] = await Promise.all([getExamples(d.id), getRelatives(d.code, d.slug)])
  const m = verbMeta(d, lang, slug)
  return (
    <>
      <JsonLd data={[breadcrumbs(lang, [['verbs', '/verbs'], [d.display, `/verb/${slug}`]]), termLd(lang, d.display, plain(d.display), m.description, `/verb/${slug}`, 'verbs')]} />
      <VerbClient d={d} examples={examples} relatives={relatives} />
    </>
  )
}
