import { PathClient } from '@/components/pages/Path'
import { getTodayPool } from '@/lib/data'
import { metaFor } from '@/lib/seo'

export const revalidate = 86400
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('path', params)
export default async function PathPage() { return <PathClient pool={await getTodayPool()} /> }
