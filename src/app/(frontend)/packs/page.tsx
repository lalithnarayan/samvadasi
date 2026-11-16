import type { Metadata } from 'next'
import { PacksClient } from '@/components/pages/Packs'
import { getPacks } from '@/lib/data'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Everyday vocabulary packs', description: 'Numbers, time and days, family, food, body, directions, shopping and travel in Sanskrit, with phrases that change with who and when.' }
export default async function PacksPage() { return <PacksClient packs={await getPacks()} /> }
