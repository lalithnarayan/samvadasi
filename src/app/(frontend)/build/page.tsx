import type { Metadata } from 'next'
import { BuilderClient } from '@/components/pages/Builder'
import { getBuilderData } from '@/lib/data'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Sentence builder', description: 'Build a Sanskrit sentence word by word: pick a verb, an object, a place, a time. Every ending is chosen for you, with the reason.' }
export default async function BuildPage() { return <BuilderClient {...await getBuilderData()} /> }
