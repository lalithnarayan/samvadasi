'use client'
import { Wordmark } from './Wordmark'
import { useSamvada } from './state'

export function Footer() {
  const { t } = useSamvada()
  return (
    <footer className="relative overflow-hidden bg-charcoal text-chalk">
      <div className="wrap flex flex-wrap gap-x-8 gap-y-2 pt-7 pb-2 text-[13px] leading-relaxed text-[#B9B2A6]">
        <span>{t('f.means')}</span>
        <span>{t('f.va')} <a className="underline" href="https://github.com/ambuda-org/vidyut">Vidyut</a> {t('f.vb')}</span>
        <span>{t('f.fonts')}</span>
        <span>{t('f.oss')}</span>
      </div>
      <div aria-hidden className="wrap -mb-[0.3em] text-[clamp(120px,26vw,380px)] leading-[1.1]"><Wordmark /></div>
    </footer>
  )
}
