import { getPayload } from 'payload'
import config from '@payload-config'

/** A teacher's recording stored in the database (recorded on /record). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await getPayload({ config })
  const id = Number((await params).id)
  if (!Number.isFinite(id)) return new Response('Not found', { status: 404 })
  const d = (await p.findByID({ collection: 'audio', id, depth: 0, disableErrors: true })) as { file?: string; mime?: string; updatedAt?: string } | null
  if (!d?.file) return new Response('Not found', { status: 404 })
  const buf = Buffer.from(d.file, 'base64')
  return new Response(buf, { headers: { 'Content-Type': d.mime || 'audio/webm', 'Content-Length': String(buf.length), 'Cache-Control': 'public, max-age=3600, s-maxage=86400', ETag: `"${d.updatedAt || id}"` } })
}
