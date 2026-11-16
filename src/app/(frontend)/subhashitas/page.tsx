import type { Metadata } from 'next'
import { SubhashitasClient } from '@/components/pages/Subhashitas'
import { getSubhashitas, verseOfDay } from '@/lib/data'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Subhāṣitas — Sanskrit verses of wisdom', description: 'Famous Sanskrit subhāṣitas word by word, with meanings in English, Telugu, Kannada and Tamil, in four scripts.' }
export default async function SubhashitasPage() {
  const list = await getSubhashitas()
  return <SubhashitasClient list={list} today={verseOfDay(list)?.slug} />
}
