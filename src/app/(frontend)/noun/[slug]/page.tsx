import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NounClient } from '@/components/pages/Noun'
import { getNoun, getNouns } from '@/lib/data'
import { cardUrl } from '@/lib/card'
import { nounPattern } from '@/lib/grammar'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug)
  const n = await getNoun(slug)
  if (!n) return {}
  const title = `${n.display} (${n.nom}) — ${n.meaning_en} · declension`
  const description = `${n.display}: ${n.meaning_en}. All eight cases in singular, dual and plural (${nounPattern(n.display, n.gender, n.kind)}), in Devanagari, Telugu, Kannada and Tamil.`
  const image = cardUrl({ t: `${n.nom} · ${n.forms?.[1]?.[0]?.[0] || ''}`, s: n.meaning_en || '', k: nounPattern(n.display, n.gender, n.kind), c: 'u' })
  return { title, description, alternates: { canonical: `/noun/${slug}` }, openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] } }
}

export default async function NounPage({ params }: { params: Promise<{ slug: string }> }) {
  const n = await getNoun(decodeURIComponent((await params).slug))
  if (!n) notFound()
  const all = await getNouns()
  const pat = nounPattern(n.display, n.gender, n.kind)
  const same = all.filter((x) => x.slug !== n.slug && nounPattern(x.display, x.gender, x.kind) === pat).slice(0, 12)
  return <NounClient n={n} same={same} />
}
