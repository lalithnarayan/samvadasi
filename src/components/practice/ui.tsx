'use client'
import { cn } from '@/lib/utils'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'

/** Page frame for every practice screen: the person's colour behind a 760px column. */
export function PracticeShell({ children }: { children: React.ReactNode }) {
  const { subj } = useSamvada()
  return (
    <div className="min-h-screen transition-colors duration-700" style={{ background: TINT[subj.color] }}>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap outline-none pt-[clamp(20px,3vw,40px)] pb-[72px]">
        <div className="mx-auto flex max-w-[760px] flex-col gap-6">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export function Stat({ big, label, sub }: { big: string; label: string; sub: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[22px] bg-paper p-5">
      <span className="disp text-[44px] leading-none font-extrabold">{big}</span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[13px] opacity-75">{sub}</span>
    </div>
  )
}

/** Stop button, a bar per step, and "3 of 10". `bar={false}` for quizzes that don't show the bar. */
export function SessionHeader({ step, total, onQuit, title, bar = true }: { step: number; total: number; onQuit: () => void; title?: string; bar?: boolean }) {
  const { t, subj } = useSamvada()
  return (
    <div className="flex items-center gap-3">
      <button onClick={onQuit} className="pill min-h-10 rounded-full border border-ink/25 px-4 text-sm font-semibold">{t('td.quit')}</button>
      {bar ? (
        <div aria-hidden className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0,1fr))` }}>
          {Array.from({ length: total }, (_, i) => <span key={i} className="h-1.5 rounded-sm" style={{ background: i < step ? 'var(--color-ink)' : i === step ? DEEP[subj.color] : 'rgb(36 33 29 / .15)' }} />)}
        </div>
      ) : <span className="flex-1 text-sm font-semibold">{title}</span>}
      <span className="text-sm font-semibold whitespace-nowrap">{t('td.progress', { i: step + 1, n: total })}</span>
    </div>
  )
}

/**
 * One answer. After answering, the right one gets a ✓ and the picked wrong one a ✗, with words for
 * screen readers, so the result never depends on colour alone.
 */
export function ChoiceButton({ state, onClick, disabled, className, style, lang, children }: {
  state: 'idle' | 'right' | 'wrong' | 'dim'; onClick: () => void; disabled?: boolean; className?: string; style?: React.CSSProperties; lang?: string; children: React.ReactNode
}) {
  const { t } = useSamvada()
  return (
    <button onClick={onClick} disabled={disabled} lang={lang} style={style}
      className={cn('pill flex min-h-[58px] items-center justify-between gap-3 rounded-[18px] border-2 bg-paper px-5 text-left text-lg font-semibold',
        state === 'idle' && 'border-ink/15', state === 'right' && 'border-good', state === 'wrong' && 'border-bad', state === 'dim' && 'border-ink/10 opacity-60', className)}>
      <span>{children}</span>
      {state === 'right' && <span aria-hidden className="font-sans text-good">✓</span>}
      {state === 'wrong' && <span aria-hidden className="font-sans text-bad">✗</span>}
      {(state === 'right' || state === 'wrong') && <span className="sr-only">{t(state === 'right' ? 'td.right' : 'td.wrongShort')}</span>}
    </button>
  )
}
export const choiceState = (done: boolean, i: number, answer: number, picked: number | null): 'idle' | 'right' | 'wrong' | 'dim' =>
  !done ? 'idle' : i === answer ? 'right' : i === picked ? 'wrong' : 'dim'
