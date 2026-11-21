import { metaFor } from '@/lib/seo'
import { BuilderClient } from '@/components/pages/Builder'
import { getBuilderData } from '@/lib/data'

export const revalidate = 86400
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('build', params)
export default async function BuildPage() { return <BuilderClient {...await getBuilderData()} /> }
