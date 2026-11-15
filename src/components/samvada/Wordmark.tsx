'use client'
import { toScript } from '@/lib/grammar'
import { useSamvada } from './state'

/** संवद·सि — "you converse" — in the selected lipi. The सि doubles as the .si of samavada.si. */
export function Wordmark({ className }: { className?: string }) {
  const { sc } = useSamvada()
  const font = sc === 'deva' ? 'var(--font-display-sk)' : `var(--font-sk-${sc})`
  return (
    <span className={className} style={{ fontFamily: font }} lang="sa">
      {toScript('संवद', sc)}
      <span className="text-m-deep">{toScript('सि', sc)}</span>
      <span className="sr-only"> Samvadasi</span>
    </span>
  )
}
