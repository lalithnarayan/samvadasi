import { TodayClient } from '@/components/pages/Today'
import { getTodayPool } from '@/lib/data'
import { metaFor } from '@/lib/seo'

export const revalidate = 86400
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('today', params)
export default async function TodayPage() { return <TodayClient pool={await getTodayPool()} /> }
