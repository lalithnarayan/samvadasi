import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PackClient } from '@/components/pages/Pack'
import { getPack, getPacks } from '@/lib/data'
import { cardUrl } from '@/lib/card'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const k = await getPack((await params).slug)
  if (!k) return {}
  const title = `${k.title[0]} in Sanskrit — ${k.titleSa}`
  const description = `${k.words.slice(0, 8).map((w) => `${w.sa} (${w.m[0]})`).join(', ')} … and phrases you can say, in four scripts.`
  return { title, description, alternates: { canonical: `/packs/${k.slug}` }, openGraph: { title, description, images: [{ url: cardUrl({ t: k.titleSa || k.title[0], s: k.title[0], k: 'Everyday Sanskrit', c: 'm' }), width: 1200, height: 630 }] } }
}

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const [k, all] = await Promise.all([getPack((await params).slug), getPacks()])
  if (!k) notFound()
  return <PackClient pack={k} others={all.filter((x) => x.slug !== k.slug)} />
}
