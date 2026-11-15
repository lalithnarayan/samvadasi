import type { Metadata } from 'next'
import { VerbsClient } from '@/components/pages/Verbs'
import { dhatuCount, getFeatured, searchDhatus } from '@/lib/data'

export const metadata: Metadata = { title: 'Verbs', description: 'Every Sanskrit dhātu with its forms for the spoken lakāras.' }

export default async function VerbsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const q = (sp.q || '').slice(0, 60)
  const scope = sp.scope === 'all' || q ? 'all' : 'everyday'
  const page = Math.max(1, Number(sp.page) || 1)
  const total = await dhatuCount()
  if (scope === 'everyday') {
    const rows = await getFeatured()
    return <VerbsClient rows={rows} q="" scope="everyday" page={1} pages={1} found={rows.length} total={total} />
  }
  const r = await searchDhatus(q, 40, page)
  return <VerbsClient rows={r.docs} q={q} scope="all" page={r.page} pages={r.pages} found={r.total} total={total} />
}
