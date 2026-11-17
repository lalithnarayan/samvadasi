import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import ai from '../../../../data/generated/audio-ai.json'

export const revalidate = 300

const clean = (s: string) => s.replace(/[।॥|?]/g, ' ').replace(/\s+/g, ' ').trim()

/** text → audio for the play buttons: a teacher's recording if there is one, else the AI voice. */
export async function GET() {
  const p = await getPayload({ config })
  const r = await p.find({ collection: 'audio', limit: 10000, depth: 0, pagination: false, select: { text: true, url: true, speaker: true, source: true, mime: true } })
  const map: Record<string, { url: string; kind: 'rec' | 'ai'; speaker?: string }> = {}
  for (const [t, url] of Object.entries(ai as Record<string, string>)) map[t] = { url, kind: 'ai' }
  for (const d of r.docs as { id: number; text: string; url?: string; speaker?: string; source?: string; mime?: string }[]) {
    const url = d.url || (d.mime ? `/audio/rec/${d.id}` : '')
    if (url) map[clean(d.text)] = { url, kind: d.source === 'machine' ? 'ai' : 'rec', speaker: d.speaker || undefined }
  }
  return NextResponse.json(map, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } })
}
