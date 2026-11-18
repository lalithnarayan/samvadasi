import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NounClient } from '@/components/pages/Noun'
import { JsonLd } from '@/components/samvada/JsonLd'
import { getNoun, getNouns } from '@/lib/data'
import { nounPattern } from '@/lib/grammar'
import { cardUrl } from '@/lib/card'
import { breadcrumbs, langOf, nounMeta, plain, termLd } from '@/lib/seo'

export const revalidate = 3600
type P = { params: Promise<{ slug: string; lang?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug: raw, lang: l } = await params
  const slug = decodeURIComponent(raw)
  const n = await getNoun(slug)
  if (!n) return {}
  const pat = nounPattern(n.display, n.gender, n.kind), m = nounMeta(n, langOf(l), slug, pat)
  const image = cardUrl({ t: `${n.nom} · ${n.forms?.[1]?.[0]?.[0] || ''}`, s: n.meaning_en || '', k: pat, c: 'u' })
  return { ...m, openGraph: { ...m.openGraph, images: [{ url: image, width: 1200, height: 630 }] } }
}

export default async function NounPage({ params }: P) {
  const { slug: raw, lang: l } = await params
  const slug = decodeURIComponent(raw), lang = langOf(l)
  const n = await getNoun(slug)
  if (!n) notFound()
  const all = await getNouns()
  const pat = nounPattern(n.display, n.gender, n.kind)
  const same = all.filter((x) => x.slug !== n.slug && nounPattern(x.display, x.gender, x.kind) === pat).slice(0, 12)
  const m = nounMeta(n, lang, slug, pat)
  return (
    <>
      <JsonLd data={[breadcrumbs(lang, [['nouns', '/nouns'], [n.display, `/noun/${slug}`]]), termLd(lang, n.display, plain(n.display), m.description, `/noun/${slug}`, 'nouns')]} />
      <NounClient n={n} same={same} />
    </>
  )
}
