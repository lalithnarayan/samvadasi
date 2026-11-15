'use client'
import { splitScript } from '@/lib/grammar'
import { useSamvada } from './state'

/** Stem in ink, ending in the person's colour. The ending re-mounts on every change so it rises in again. */
export function Word({ stem, end, color, className, style, delay = 0 }: { stem: string; end: string; color: string; className?: string; style?: React.CSSProperties; delay?: number }) {
  const { sc, morph } = useSamvada()
  const [s, e] = splitScript(stem, end, sc)
  return (
    <span lang="sa" className={className} style={style}>
      {s}
      <span key={morph} className="ending" style={{ color, animationDelay: delay ? `${delay}ms` : undefined }}>{e}</span>
    </span>
  )
}
