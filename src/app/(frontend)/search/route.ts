import { NextResponse } from 'next/server'
import { searchDhatus } from '@/lib/data'

/** Lightweight lookup for the verb picker. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.slice(0, 60) || ''
  const r = await searchDhatus(q, 20)
  return NextResponse.json(r.docs.map((d) => ({ slug: d.slug, display: d.display, meaning: d.meaning_en || d.artha_sa, gana: d.gana, code: d.code })))
}
