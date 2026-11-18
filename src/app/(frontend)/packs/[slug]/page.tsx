import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PackClient } from '@/components/pages/Pack'
import { JsonLd } from '@/components/samvada/JsonLd'
import { getPack, getPacks } from '@/lib/data'
import { cardUrl } from '@/lib/card'
import { breadcrumbs, langOf, packMeta } from '@/lib/seo'

export const revalidate = 3600
type P = { params: Promise<{ slug: string; lang?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug, lang } = await params
  const k = await getPack(slug)
  if (!k) return {}
  const m = packMeta(k, langOf(lang))
  return { ...m, openGraph: { ...m.openGraph, images: [{ url: cardUrl({ t: k.titleSa || k.title[0], s: k.title[0], k: 'Everyday Sanskrit', c: 'm' }), width: 1200, height: 630 }] } }
}

export default async function PackPage({ params }: P) {
  const { slug, lang } = await params
  const [k, all] = await Promise.all([getPack(slug), getPacks()])
  if (!k) notFound()
  return (
    <>
      <JsonLd data={breadcrumbs(langOf(lang), [['packs', '/packs'], [k.title[0], `/packs/${k.slug}`]])} />
      <PackClient pack={k} others={all.filter((x) => x.slug !== k.slug)} />
    </>
  )
}
