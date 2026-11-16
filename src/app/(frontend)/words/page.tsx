import type { Metadata } from 'next'
import { WordsClient } from '@/components/pages/Words'
import { getAvyayas, getNouns } from '@/lib/data'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Question words and indeclinables', description: 'कुत्र, कदा, किमर्थम्, कथम्, अत्र, तत्र, च, अपि, एव … the Sanskrit words that never change, with a phrase each, in four scripts.' }
export default async function WordsPage() {
  const [words, nouns] = await Promise.all([getAvyayas(), getNouns()])
  return <WordsClient words={words} kim={nouns.filter((n) => n.stemSlp1 === 'kim')} />
}
