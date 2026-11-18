import React from 'react'
import { notFound } from 'next/navigation'
import { Shell, baseMetadata, baseViewport } from '@/components/samvada/Shell'
import { SC_OF, LOCALES } from '@/lib/seo'

export const metadata = baseMetadata
export const viewport = baseViewport
export const dynamicParams = false
export function generateStaticParams() { return LOCALES.map((lang) => ({ lang })) }

/** Telugu, Kannada and Tamil copies of every page, rendered on the server so search engines see them. */
export default async function LocLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const sc = SC_OF[lang as keyof typeof SC_OF]
  if (!sc) notFound()
  return <Shell sc={sc}>{children}</Shell>
}
