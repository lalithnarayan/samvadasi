import type { Metadata } from 'next'
import { NounsClient } from '@/components/pages/Nouns'
import { getNouns } from '@/lib/data'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Nouns', description: 'Common Sanskrit nouns and pronouns in all eight cases and three numbers, with Telugu, Kannada and Tamil meanings.' }
export default async function NounsPage() { return <NounsClient nouns={await getNouns()} /> }
