import { NextResponse } from 'next/server'
import { searchHits } from '@/lib/data'

/**
 * Lookup for the verb picker (forms like "gacchati" that the in-browser index can't match).
 * Answers are the same for everyone, so Vercel's edge (Mumbai for Indian visitors) keeps them
 * for a day and the function in iad1 is only asked once per query.
 */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 60)
  const hits = await searchHits(q, 20)
  return NextResponse.json(hits, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800' } })
}
