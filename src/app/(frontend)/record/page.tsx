import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RecordClient } from '@/components/pages/Record'
import texts from '../../../../data/generated/audio-texts.json'
import ai from '../../../../data/generated/audio-ai.json'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Recording studio', robots: { index: false } }

export default async function RecordPage() {
  const p = await getPayload({ config })
  const { user } = await p.auth({ headers: await headers() })
  const roles: string[] = ((user as { roles?: string[] } | null)?.roles) || []
  const allowed = !!user && roles.some((r) => ['admin', 'editor', 'reviewer'].includes(r))
  if (!allowed) return <RecordClient allowed={false} texts={[]} recorded={{}} ai={{}} />
  const r = await p.find({ collection: 'audio', where: { source: { equals: 'recorded' } }, limit: 10000, depth: 0, pagination: false, select: { text: true } })
  const recorded = Object.fromEntries((r.docs as { id: number; text: string }[]).map((d) => [d.text, `/audio/rec/${d.id}`]))
  return <RecordClient allowed texts={texts as { text: string; kind: string; where: string }[]} recorded={recorded} ai={ai as Record<string, string>} />
}
