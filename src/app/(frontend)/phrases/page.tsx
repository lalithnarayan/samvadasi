import type { Metadata } from 'next'
import { PhrasesClient } from '@/components/pages/Phrases'
import { getSituations } from '@/lib/data'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Phrases', description: 'Everyday Sanskrit sentences that change with who and when.' }

export default async function PhrasesPage() {
  return <PhrasesClient situations={await getSituations()} />
}
