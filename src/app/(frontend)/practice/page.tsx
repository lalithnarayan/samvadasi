import { metaFor } from '@/lib/seo'
import { PracticeClient } from '@/components/pages/Practice'
import { getDeck } from '@/lib/data'

export const revalidate = 3600
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('practice', params)

export default async function PracticePage() {
  const deck = await getDeck()
  if (!deck || !deck.cards.length) return <main className="wrap py-24"><h1 className="disp text-4xl font-extrabold">No practice deck yet.</h1></main>
  return <PracticeClient cards={deck.cards} />
}
