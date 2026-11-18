import { ScriptClient } from '@/components/pages/Script'
import { getTodayPool } from '@/lib/data'
import { metaFor } from '@/lib/seo'

export const revalidate = 3600
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('script', params)
export default async function ScriptPage() { return <ScriptClient pool={await getTodayPool()} /> }
