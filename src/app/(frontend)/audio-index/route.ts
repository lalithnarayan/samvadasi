import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const revalidate = 3600

/** text → recording URL, for the play buttons. Small: only clips a teacher has recorded. */
export async function GET() {
  const p = await getPayload({ config })
  const r = await p.find({ collection: 'audio', limit: 5000, depth: 0, pagination: false, select: { text: true, url: true, speaker: true } })
  const map: Record<string, { url: string; speaker?: string }> = {}
  for (const d of r.docs as { text: string; url: string; speaker?: string }[]) map[d.text.trim()] = { url: d.url, speaker: d.speaker || undefined }
  return NextResponse.json(map, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
}
