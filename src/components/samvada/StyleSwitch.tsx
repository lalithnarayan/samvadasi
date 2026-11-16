'use client'
import { cn } from '@/lib/utils'
import { useSamvada } from './state'

/** Written ↔ spoken translations (Telugu, Kannada, Tamil only — hidden in English). */
export function StyleSwitch({ className }: { className?: string }) {
  const { lang, talk, set, t } = useSamvada()
  if (lang === 'en') return null
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div role="group" aria-label={t('st.label')} className="seg self-start">
        {(['w', 's'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={talk === k} onClick={() => set({ talk: k })}
            className={cn('pill min-h-10 rounded-full px-4 text-[14px] font-semibold', talk === k && 'bg-ink text-stone')}>
            {t(k === 'w' ? 'st.written' : 'st.spoken')}
          </button>
        ))}
      </div>
      {talk === 's' && <span className="text-[12px] italic opacity-80">{t('st.note')}</span>}
    </div>
  )
}
