import { metaFor } from '@/lib/seo'
import { WordsClient } from '@/components/pages/Words'
import { getAvyayas, getNouns } from '@/lib/data'

export const revalidate = 3600
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('words', params)
export default async function WordsPage() {
  const [words, nouns] = await Promise.all([getAvyayas(), getNouns()])
  return <WordsClient words={words} kim={nouns.filter((n) => n.stemSlp1 === 'kim')} />
}
