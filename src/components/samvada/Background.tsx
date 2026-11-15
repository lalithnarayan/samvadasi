'use client'
import { DEEP, TINT, useSamvada } from './state'

/** The page tint follows the person; a circle of the new colour spreads from where you tapped. */
export function Background({ override }: { override?: 'u' | 'm' | 'p' }) {
  const { subj, wipe } = useSamvada()
  const color = override ?? subj.color
  return (
    <>
      <div aria-hidden className="fixed inset-0" style={{ background: TINT[wipe.n ? wipe.from : color] }} />
      <div aria-hidden key={wipe.n} className={wipe.n ? 'wipe' : 'fixed inset-0'} style={{ background: TINT[color], ['--ox' as string]: wipe.ox, ['--oy' as string]: wipe.oy }} />
    </>
  )
}
