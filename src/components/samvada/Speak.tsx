'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSamvada } from './state'

type Rec = Record<string, { url: string; speaker?: string }>
let recs: Promise<Rec> | null = null
const recordings = (): Promise<Rec> => (recs ??= fetch('/audio-index').then((r) => (r.ok ? r.json() : {})).catch(() => ({})) as Promise<Rec>)

let voice: SpeechSynthesisVoice | null | undefined
function pickVoice(): SpeechSynthesisVoice | null {
  if (voice !== undefined && voice) return voice
  const vs = typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices() : []
  // No browser ships Sanskrit; Hindi, Marathi and Nepali voices read Devanagari closest to it.
  for (const l of ['sa', 'hi', 'mr', 'ne']) { const v = vs.find((x) => x.lang.toLowerCase().startsWith(l)); if (v) return (voice = v) }
  return (voice = null)
}

let current: HTMLAudioElement | null = null
const clean = (s: string) => s.replace(/[।॥|]/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Play button for Sanskrit text (Devanagari). Uses a teacher's recording when the Audio collection has
 * one for this exact text; otherwise the browser's own voice, labelled "machine voice".
 */
export function Speak({ text, className, label }: { text: string; className?: string; label?: string }) {
  const { t } = useSamvada()
  const [can, setCan] = useState(false)
  const [state, setState] = useState<'idle' | 'play'>('idle')
  const [kind, setKind] = useState<'rec' | 'tts' | null>(null)
  useEffect(() => { setCan(typeof window !== 'undefined' && ('speechSynthesis' in window || 'Audio' in window)) }, [])
  if (!can || !text) return null
  const key = text.trim()

  async function play(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (state === 'play') { current?.pause(); speechSynthesis?.cancel(); setState('idle'); return }
    const rec = (await recordings())[key] || (await recordings())[clean(key)]
    current?.pause(); if ('speechSynthesis' in window) speechSynthesis.cancel()
    if (rec) {
      const a = new Audio(rec.url); current = a; setKind('rec'); setState('play')
      a.onended = a.onerror = () => setState('idle')
      a.play().catch(() => setState('idle'))
      return
    }
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(clean(key))
    const v = pickVoice()
    if (v) { u.voice = v; u.lang = v.lang } else u.lang = 'hi-IN'
    u.rate = 0.8
    u.onend = u.onerror = () => setState('idle')
    setKind('tts'); setState('play')
    speechSynthesis.speak(u)
  }
  const name = `${label || t('au.play')}${kind === 'rec' ? '' : ` (${t('au.machine')})`}`
  return (
    <button type="button" onClick={play} aria-label={name} title={name}
      className={cn('pill inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/25 bg-paper/70 align-middle', state === 'play' && 'bg-ink text-stone', className)}>
      {state === 'play'
        ? <svg aria-hidden width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="3" height="8" fill="currentColor" /><rect x="7" y="2" width="3" height="8" fill="currentColor" /></svg>
        : <svg aria-hidden width="14" height="14" viewBox="0 0 14 14"><path d="M2 5h2.5L8 2v10L4.5 9H2z" fill="currentColor" /><path d="M10 4.5a3.5 3.5 0 0 1 0 5M11.5 3a5.5 5.5 0 0 1 0 8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" /></svg>}
    </button>
  )
}
