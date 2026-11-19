import { NextResponse } from 'next/server'
import { verbIndex } from '@/lib/data'

/** All verbs in a few fields (~40 KB gzipped), built once a day and served from the CDN. */
export const revalidate = 86400
export async function GET() {
  return NextResponse.json(await verbIndex(), { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } })
}
