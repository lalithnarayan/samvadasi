'use client'
import { GENDERS, NUMS, PERSONS, WHENS, toScript } from '@/lib/grammar'
import { cn } from '@/lib/utils'
import { DEEP, useSamvada } from './state'

/** WHO (person × number × gender) and WHEN, fixed to the bottom of every page. */
export function Dock() {
  const { per, num, gen, when, sc, subj, morph, set } = useSamvada()
  const genderMatters = when === 'kta' || per === 'r' || per === 'p'
  const w = WHENS.find((x) => x.id === when)!
  const btn = 'pill flex min-h-11 shrink-0 flex-col items-center justify-center rounded-full px-3.5 py-0.5 leading-tight'
  return (
    <div role="region" aria-label="Who and when" className="sticky bottom-0 z-10 border-t border-ink/20 bg-stone">
      <div className="wrap flex flex-col gap-2 pt-2.5 pb-3">
        <div className="drow">
          <span aria-live="polite" className="flex min-w-[120px] shrink-0 items-baseline gap-2 pr-1.5">
            <span key={morph} className="ending text-[30px] leading-[1.3]" style={{ color: DEEP[subj.color], fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})` }}>{toScript(subj.sk, sc)}</span>
            <span className="text-[13px] font-semibold whitespace-nowrap">“{subj.en}”</span>
          </span>
          <div role="group" aria-label="Who" className="seg">
            {PERSONS.map((p) => {
              const on = p.id === per
              return (
                <button key={p.id} aria-pressed={on} className={btn} onClick={(e) => p.id !== per && set({ per: p.id }, { x: e.clientX, y: e.clientY })}
                  style={{ background: on ? DEEP[p.color] : 'transparent', color: on ? 'var(--color-stone)' : DEEP[p.color] }}>
                  <span className="text-sm font-semibold whitespace-nowrap">{p.en}</span>
                  <span className="font-sk text-[11px] whitespace-nowrap">{p.sk}</span>
                </button>
              )
            })}
          </div>
          <div role="group" aria-label="How many" className="seg">
            {NUMS.map((n) => (
              <button key={n.id} aria-pressed={n.id === num} onClick={() => set({ num: n.id })} className={cn(btn, n.id === num && 'bg-ink text-stone')}>
                <span className="text-sm font-semibold">{n.en}</span><span className="font-sk text-[11px]">{n.sk}</span>
              </button>
            ))}
          </div>
          <div role="group" aria-label="Gender" className="seg" style={{ opacity: genderMatters ? 1 : 0.55 }}>
            {GENDERS.map((g) => (
              <button key={g.id} aria-pressed={g.id === gen} onClick={() => set({ gen: g.id })} className={cn(btn, g.id === gen && 'bg-ink text-stone')}>
                <span className="text-sm font-semibold">{g.en}</span><span className="font-sk text-[11px]">{g.sk}</span>
              </button>
            ))}
          </div>
          {!genderMatters && <span className="hidden shrink-0 text-xs italic opacity-75 lg:inline">Same for men and women here.</span>}
        </div>
        <div className="drow">
          <span className="eyebrow w-[52px] shrink-0 text-[11px]">When</span>
          <div role="group" aria-label="When" className="seg">
            {WHENS.map((x) => (
              <button key={x.id} aria-pressed={x.id === when} onClick={() => set({ when: x.id })} className={cn(btn, x.id === when && 'bg-ink text-stone')}>
                <span className="font-sk text-sm font-bold">{x.name}</span><span className="text-[11px] font-semibold whitespace-nowrap">{x.en}</span>
              </button>
            ))}
          </div>
          <span className="hidden min-w-[220px] flex-1 text-[13px] leading-snug opacity-80 lg:inline">{w.hint}</span>
        </div>
      </div>
    </div>
  )
}
