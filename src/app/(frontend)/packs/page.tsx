import { metaFor } from '@/lib/seo'
import { PacksClient } from '@/components/pages/Packs'
import { getPacks } from '@/lib/data'

export const revalidate = 3600
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('packs', params)
export default async function PacksPage() { return <PacksClient packs={await getPacks()} /> }
