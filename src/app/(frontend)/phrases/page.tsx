import { metaFor } from '@/lib/seo'
import { PhrasesClient } from '@/components/pages/Phrases'
import { getSituations } from '@/lib/data'

export const revalidate = 86400
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('phrases', params)

export default async function PhrasesPage() {
  return <PhrasesClient situations={await getSituations()} />
}
