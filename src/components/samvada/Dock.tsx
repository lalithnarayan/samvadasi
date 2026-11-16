'use client'
import { GENDERS, NUMS, PERSONS, WHENS, toScript } from '@/lib/grammar'
import { subjectLabel } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { DEEP, useSamvada } from './state'

/** WHO (person × number × gender) and WHEN, fixed to the bottom of every page. */
export function Dock() {
  const { per, num, gen, when, sc, subj, morph, set, t, lang } = useSamvada()
  const genderMatters = when === 'kta' || per === 'r' || per === 'p'
  const w = WHENS.find((x) => x.id === when)!
  const skf = `var(--font-sk-${sc})`
  const btn = 'pill flex min-h-11 shrink-0 flex-col items-center justify-center rounded-full px-3.5 py-0.5 leading-tight'
  return (
    <div role="region" aria-label={t('dock.region')} className="sticky bottom-0 z-10 border-t border-ink/20 bg-stone">
      <div className="wrap flex flex-col gap-2 pt-2.5 pb-3">
        <div className="drow">
          <span aria-live="polite" className="flex min-w-[120px] shrink-0 items-baseline gap-2 pr-1.5">
            <span key={morph} className="ending text-[30px] leading-[1.3]" style={{ color: DEEP[subj.color], fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})` }}>{toScript(subj.sk, sc)}</span>
            <span className="text-[13px] font-semibold whitespace-nowrap">“{subjectLabel(lang, subj)}”</span>
          </span>
          <div role="group" aria-label={t('dock.who')} className="seg">
            {PERSONS.map((p) => {
              const on = p.id === per
              return (
                <button key={p.id} aria-pressed={on} className={btn} onClick={(e) => p.id !== per && set({ per: p.id }, { x: e.clientX, y: e.clientY })}
                  style={{ background: on ? DEEP[p.color] : 'transparent', color: on ? 'var(--color-stone)' : DEEP[p.color] }}>
                  <span className="text-sm font-semibold whitespace-nowrap">{t(`per.${p.id}`)}</span>
                  <span className="text-[11px] whitespace-nowrap" style={{ fontFamily: skf }}>{toScript(p.sk, sc)}</span>
                </button>
              )
            })}
          </div>
          <div role="group" aria-label={t('dock.howMany')} className="seg">
            {NUMS.map((n) => (
              <button key={n.id} aria-pressed={n.id === num} onClick={() => set({ num: n.id })} className={cn(btn, n.id === num && 'bg-ink text-stone')}>
                <span className="text-sm font-semibold">{t(`num.${n.id}`)}</span><span className="text-[11px]" style={{ fontFamily: skf }}>{toScript(n.sk, sc)}</span>
              </button>
            ))}
          </div>
          <div role="group" aria-label={t('dock.gender')} className="seg" style={{ opacity: genderMatters ? 1 : 0.8, borderStyle: genderMatters ? undefined : 'dashed' }}>
            {GENDERS.map((g) => (
              <button key={g.id} aria-pressed={g.id === gen} onClick={() => set({ gen: g.id })} className={cn(btn, g.id === gen && 'bg-ink text-stone')}>
                <span className="text-sm font-semibold">{t(`gen.${g.id}`)}</span><span className="text-[11px]" style={{ fontFamily: skf }}>{toScript(g.sk, sc)}</span>
              </button>
            ))}
          </div>
          {!genderMatters && <span className="hidden shrink-0 text-xs italic opacity-75 lg:inline">{t('dock.same')}</span>}
        </div>
        <div className="drow">
          <span className="eyebrow min-w-[52px] shrink-0 text-[11px]">{t('dock.when')}</span>
          <div role="group" aria-label={t('dock.when')} className="seg">
            {WHENS.map((x) => (
              <button key={x.id} aria-pressed={x.id === when} onClick={() => set({ when: x.id })} className={cn(btn, x.id === when && 'bg-ink text-stone')}>
                <span className="text-sm font-bold" style={{ fontFamily: skf }}>{toScript(x.name, sc)}</span><span className="text-[11px] font-semibold whitespace-nowrap">{t(`when.${x.id}`)}</span>
              </button>
            ))}
          </div>
          <span className="hidden min-w-[220px] flex-1 text-[13px] leading-snug opacity-80 lg:inline">{t(`hint.${w.id}`)}</span>
        </div>
      </div>
    </div>
  )
}
