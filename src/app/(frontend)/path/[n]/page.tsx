import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UnitClient } from '@/components/pages/Path'
import { JsonLd } from '@/components/samvada/JsonLd'
import { getTodayPool } from '@/lib/data'
import { UNITS } from '@/lib/path'
import { breadcrumbs, langOf, unitMeta } from '@/lib/seo'

export const revalidate = 3600
export const dynamicParams = false
export function generateStaticParams() { return UNITS.map((u) => ({ n: String(u.n) })) }
type P = { params: Promise<{ n: string; lang?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { n, lang } = await params
  const u = UNITS.find((x) => x.n === Number(n))
  return u ? unitMeta(u, langOf(lang)) : {}
}

export default async function UnitPage({ params }: P) {
  const { n, lang } = await params
  const u = UNITS.find((x) => x.n === Number(n))
  if (!u) notFound()
  return (
    <>
      <JsonLd data={breadcrumbs(langOf(lang), [['path', '/path'], [u.title[{ en: 0, te: 1, kn: 2, ta: 3 }[langOf(lang)]] || u.title[0], `/path/${u.n}`]])} />
      <UnitClient pool={await getTodayPool()} n={u.n} />
    </>
  )
}
