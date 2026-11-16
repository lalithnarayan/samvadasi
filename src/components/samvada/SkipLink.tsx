'use client'
import { useSamvada } from './state'

export function SkipLink() {
  const { t } = useSamvada()
  return <a href="#main" className="sr-only z-[100] rounded-full bg-ink px-5 py-3 font-semibold text-stone focus:not-sr-only focus:fixed focus:top-3 focus:left-3">{t('skip')}</a>
}
