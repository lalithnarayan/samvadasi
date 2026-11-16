import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VerbClient } from '@/components/pages/Verb'
import { getDhatu, getExamples, getRelatives } from '@/lib/data'
import { cardUrl } from '@/lib/card'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug)
  const d = await getDhatu(slug)
  if (!d) return {}
  const mean = d.meaning_en || d.artha_sa || ''
  const lat = d.forms?.lat?.[d.preferredPada || d.padas[0]]?.[0]?.[0] || ''
  const title = `${d.display} (${lat}) — ${mean}`
  const description = `${d.display}: ${mean}. ${lat ? lat + ' and ' : ''}every form for I, you and he/she in present, past, future, command and wish, plus causative and passive. In Devanagari, Telugu, Kannada and Tamil.`
  const image = cardUrl({ t: lat ? `${d.display} · ${lat}` : d.display, s: mean, k: `Sanskrit verb · ${d.code}`, c: 'p' })
  return { title, description, alternates: { canonical: `/verb/${slug}` }, openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] }, twitter: { card: 'summary_large_image', images: [image] } }
}

export default async function VerbPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = await getDhatu(decodeURIComponent((await params).slug))
  if (!d) notFound()
  const [examples, relatives] = await Promise.all([getExamples(d.id), getRelatives(d.code, d.slug)])
  return <VerbClient d={d} examples={examples} relatives={relatives} />
}
