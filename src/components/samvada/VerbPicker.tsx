'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useSamvada } from './state'

const load = () => import('./VerbPickerPanel').then((m) => m.VerbPickerPanel)
const Panel = dynamic(load, { ssr: false })

/**
 * The "choose another verb" box. The search panel and its dropdown library (~22 KB) load on the
 * first hover, focus or tap, not with the page; until then this is a plain button that looks the same.
 */
export function VerbPicker({ current }: { current: string }) {
  const { t } = useSamvada()
  const [active, setActive] = useState(false)
  if (active) return <Panel current={current} defaultOpen />
  return (
    <button onClick={() => setActive(true)} onPointerEnter={load} onFocus={load} aria-haspopup="dialog"
      className="pill flex min-h-14 w-full items-center justify-between rounded-full border border-ink/25 bg-paper px-5 text-left text-[17px]">
      <span><span className="font-bold">{current}</span> <span className="opacity-75">· {t('vb.choose')}</span></span>
      <span aria-hidden>⌄</span>
    </button>
  )
}
