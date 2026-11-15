import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VerbClient } from '@/components/pages/Verb'
import { getDhatu, getExamples, getRelatives } from '@/lib/data'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = await getDhatu((await params).slug)
  return d ? { title: `${d.display} — ${d.meaning_en || d.artha_sa || ''}`, description: `All forms of ${d.display} (${d.meaning_en || d.artha_sa}) in every lakāra, verified with Vidyut.` } : {}
}

export default async function VerbPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = await getDhatu(decodeURIComponent((await params).slug))
  if (!d) notFound()
  const [examples, relatives] = await Promise.all([getExamples(d.id), getRelatives(d.code, d.slug)])
  return <VerbClient d={d} examples={examples} relatives={relatives} />
}
