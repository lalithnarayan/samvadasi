import { metaFor } from '@/lib/seo'
import { VerbsClient } from '@/components/pages/Verbs'
import { dhatuCount, getFeatured, getPrefixed, prefixedCount, searchDhatus } from '@/lib/data'

export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('verbs', params)

export default async function VerbsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const q = (sp.q || '').slice(0, 60)
  const scope = q || sp.scope === 'all' ? 'all' : sp.scope === 'prefixed' ? 'prefixed' : 'everyday'
  const page = Math.max(1, Number(sp.page) || 1)
  const [total, nPrefixed] = await Promise.all([dhatuCount(), prefixedCount()])
  if (scope === 'everyday' || scope === 'prefixed') {
    const rows = scope === 'everyday' ? await getFeatured() : await getPrefixed()
    return <VerbsClient rows={rows} q="" scope={scope} page={1} pages={1} found={rows.length} total={total} prefixedTotal={nPrefixed} />
  }
  const r = await searchDhatus(q, 40, page)
  return <VerbsClient rows={r.docs} q={q} scope="all" page={r.page} pages={r.pages} found={r.total} total={total} prefixedTotal={nPrefixed} />
}
