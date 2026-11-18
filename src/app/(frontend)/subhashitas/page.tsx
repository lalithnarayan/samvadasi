import { metaFor } from '@/lib/seo'
import { SubhashitasClient } from '@/components/pages/Subhashitas'
import { getSubhashitas, verseOfDay } from '@/lib/data'

export const revalidate = 3600
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('subhashitas', params)
export default async function SubhashitasPage() {
  const list = await getSubhashitas()
  return <SubhashitasClient list={list} today={verseOfDay(list)?.slug} />
}
