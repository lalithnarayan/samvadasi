import { metaFor } from '@/lib/seo'
import { GreetingsClient } from '@/components/pages/Greetings'
import { getGreetings } from '@/lib/data'

export const revalidate = 3600
export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('greetings', params)
export default async function GreetingsPage() { return <GreetingsClient items={await getGreetings()} /> }
