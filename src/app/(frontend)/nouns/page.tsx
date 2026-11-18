import { metaFor } from '@/lib/seo'
import { NounsClient } from '@/components/pages/Nouns'
import { getNouns } from '@/lib/data'

export const revalidate = 3600
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('nouns', params)
export default async function NounsPage() { return <NounsClient nouns={await getNouns()} /> }
