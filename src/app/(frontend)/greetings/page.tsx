import type { Metadata } from 'next'
import { GreetingsClient } from '@/components/pages/Greetings'
import { getGreetings } from '@/lib/data'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Sanskrit greetings and names', description: 'नमो नमः, सुप्रभातम्, धन्यवादः, क्षम्यताम् … everyday Sanskrit greetings and wishes, and Sanskrit names with their meanings, ready to share.' }
export default async function GreetingsPage() { return <GreetingsClient items={await getGreetings()} /> }
