import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SubhashitaClient } from '@/components/pages/Subhashita'
import { getSubhashita } from '@/lib/data'
import { cardUrl } from '@/lib/card'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await getSubhashita((await params).slug)
  if (!r) return {}
  const first = r.s.text.split('\n')[0].replace(/[।॥]/g, '').trim()
  const title = `${first} — subhāṣita`
  const description = `${r.s.meaning[0]} Word by word, with meanings in Telugu, Kannada and Tamil.`
  const image = cardUrl({ t: r.s.text, s: r.s.meaning[0].length > 90 ? r.s.meaning[0].slice(0, 88) + '…' : r.s.meaning[0], k: `सुभाषितम् · ${r.s.source || ''}`, c: 'p' })
  return { title, description, alternates: { canonical: `/subhashita/${r.s.slug}` }, openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] } }
}

export default async function SubhashitaPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = await getSubhashita((await params).slug)
  if (!r) notFound()
  return <SubhashitaClient {...r} />
}
