import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const clean = (s: string) => s.replace(/[।॥|?]/g, ' ').replace(/\s+/g, ' ').trim()
const OK_MIME = /^audio\/(webm|ogg|mp4|mpeg|aac|x-m4a|wav)(;.*)?$/

/** Save a teacher's recording (logged-in editors, reviewers and admins only). */
export async function POST(req: Request) {
  const p = await getPayload({ config })
  const { user } = await p.auth({ headers: req.headers })
  const roles: string[] = ((user as { roles?: string[] } | null)?.roles) || []
  if (!user || !roles.some((r) => ['admin', 'editor', 'reviewer'].includes(r))) return NextResponse.json({ error: 'login' }, { status: 401 })
  const body = (await req.json().catch(() => null)) as { text?: string; mime?: string; data?: string } | null
  const text = clean(body?.text || '')
  const mime = (body?.mime || '').split(';')[0]
  if (!text || !body?.data || !OK_MIME.test(mime)) return NextResponse.json({ error: 'bad request' }, { status: 400 })
  if (body.data.length > 2_000_000) return NextResponse.json({ error: 'too long' }, { status: 413 })
  const speaker = (user as { name?: string; email?: string }).name || (user as { email?: string }).email || 'teacher'
  const data = { text, file: body.data, mime, url: '', speaker, source: 'recorded' as const }
  const f = await p.find({ collection: 'audio', where: { text: { equals: text } }, limit: 1, depth: 0 })
  const doc = f.docs[0] ? await p.update({ collection: 'audio', id: f.docs[0].id, data, overrideAccess: true }) : await p.create({ collection: 'audio', data, overrideAccess: true })
  return NextResponse.json({ ok: true, url: `/audio/rec/${doc.id}` })
}
