'use client'
import Link from 'next/link'
import { learnedCount, type Store } from '@/lib/practice'
import { DEEP, useSamvada } from '@/components/samvada/state'
import { ShareButton } from '@/components/samvada/Share'
import type { Result } from './Runner'

/** End of a session: streak, score, a share card, and where to go next. */
export function Summary({ store, result, onAgain, extra }: { store: Store; result: Result; onAgain: () => void; extra?: React.ReactNode }) {
  const { t, subj, base, query } = useSamvada()
  const learned = learnedCount(store)
  return (
    <div className="flex flex-col gap-5 rounded-[28px] bg-paper p-[clamp(22px,4vw,40px)]">
      <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('td.doneToday')}</span>
      <p className="disp m-0 text-[clamp(44px,8vw,88px)] leading-none font-extrabold">{t('td.streak', { n: store.streak })}</p>
      <p className="m-0 text-lg">{t('td.summary', { r: result.score, n: result.of })} · {t('td.learned', { n: learned })}{result.froze ? ` · ${t('td.froze')}` : ''}</p>
      {extra}
      <p className="m-0 opacity-80">{t('td.comeBack')}</p>
      <div className="flex flex-wrap gap-3">
        <ShareButton t={`${store.streak} दिनानि`} s={t('td.shareLine', { n: store.streak, w: learned })} k="samvada.si/today" />
        <button onClick={onAgain} className="pill min-h-12 rounded-full border border-ink/30 px-6 font-semibold">{t('td.again')}</button>
        <Link href={base + '/path' + query} className="pill flex min-h-12 items-center rounded-full border border-ink/30 px-6 font-semibold no-underline">{t('nav.path')}</Link>
      </div>
    </div>
  )
}
