'use client'
import { useEffect, useState } from 'react'
import { audioKey } from '@/lib/audio'
import { load, save, today } from '@/lib/practice'
import { track } from '@/lib/track'

let clips: Promise<Set<string>> | null = null
/** Texts that have a voice clip (for listen-and-choose), fetched once per visit; null while loading. */
export function useAudioSet() {
  const [audio, setAudio] = useState<Set<string> | null>(null)
  useEffect(() => {
    let live = true
    clips ??= Promise.race([
      fetch('/audio-index').then((r) => (r.ok ? r.json() : {})).then((x: Record<string, unknown>) => new Set(Object.keys(x))),
      new Promise<Set<string>>((ok) => setTimeout(() => ok(new Set()), 2500)), // never hold up a session
    ]).catch(() => new Set<string>())
    clips.then((s) => { if (live) setAudio(s) })
    return () => { live = false }
  }, [])
  return audio
}
export const audioTest = (audio: Set<string>) => (sa: string) => audio.has(audioKey(sa))

/** Report a return on the day after the first session, once. */
export function useDay2Return() {
  useEffect(() => {
    const s = load()
    if (s.first && today() === s.first + 1 && !s.returned) { track('day2_return'); save({ ...s, returned: true }) }
  }, [])
}
