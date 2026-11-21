'use client'
import { useEffect, useRef, useState } from 'react'
import { json, useStored, writeStored } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { useSamvada } from './state'

type Prefs = { size: 'm' | 'l' | 'xl'; contrast: boolean; motion: boolean }
const KEY = 'samvada.display'
const DEF: Prefs = { size: 'm', contrast: false, motion: false }

/** Runs before first paint (in <head>) so a saved larger size or high contrast never flashes. */
export const A11Y_BOOT = `try{var p=JSON.parse(localStorage.getItem('${KEY}')||'{}'),d=document.documentElement;if(p.size&&p.size!=='m')d.dataset.size=p.size;if(p.contrast)d.dataset.contrast='more';if(p.motion)d.dataset.motion='less'}catch(e){}`

function apply(p: Prefs) {
  const d = document.documentElement
  if (p.size === 'm') delete d.dataset.size; else d.dataset.size = p.size
  if (p.contrast) d.dataset.contrast = 'more'; else delete d.dataset.contrast
  if (p.motion) d.dataset.motion = 'less'; else delete d.dataset.motion
  writeStored(KEY, p)
}

/** "Aa" button in the header: text size, high contrast and less motion, remembered on this device. */
export function A11yMenu() {
  const { t } = useSamvada()
  const [open, setOpen] = useState(false)
  const p = useStored(KEY, json(DEF), DEF)
  const box = useRef<HTMLDivElement>(null), btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    const click = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', key); document.addEventListener('mousedown', click)
    box.current?.querySelector<HTMLElement>('button')?.focus()
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', click) }
  }, [open])
  const up = (patch: Partial<Prefs>) => apply({ ...p, ...patch })
  return (
    <div className="relative">
      <button ref={btn} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="a11y-panel" aria-label={t('a11y.btn')}
        className="pill min-h-[46px] min-w-[46px] rounded-full border border-ink/20 px-3 text-[15px] font-bold">Aa</button>
      {open && (
        <div ref={box} id="a11y-panel" role="dialog" aria-label={t('a11y.title')}
          className="absolute top-[54px] right-0 z-50 flex w-[270px] flex-col gap-3 rounded-[22px] border border-ink/15 bg-paper p-4 shadow-[0_18px_40px_-18px_rgb(36_33_29/.45)]">
          <span className="disp text-[17px] font-extrabold">{t('a11y.title')}</span>
          <div role="group" aria-label={t('a11y.size')} className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold opacity-80">{t('a11y.size')}</span>
            <div className="seg w-full justify-between">
              {(['m', 'l', 'xl'] as const).map((s, i) => (
                <button key={s} onClick={() => up({ size: s })} aria-pressed={p.size === s} aria-label={`${t('a11y.size')} ${i + 1}`}
                  className={cn('min-h-10 flex-1 rounded-full font-bold', p.size === s ? 'bg-ink text-stone' : '')} style={{ fontSize: 14 + i * 4 }}>A</button>
              ))}
            </div>
          </div>
          <Toggle on={p.contrast} label={t('a11y.contrast')} onChange={() => up({ contrast: !p.contrast })} />
          <Toggle on={p.motion} label={t('a11y.motion')} onChange={() => up({ motion: !p.motion })} />
        </div>
      )}
    </div>
  )
}

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  const { t } = useSamvada()
  return (
    <button role="switch" aria-checked={on} onClick={onChange}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border border-ink/15 px-3.5 text-left text-[15px] font-semibold">
      {label}<span className={cn('rounded-full px-2.5 py-0.5 text-[12px]', on ? 'bg-ink text-stone' : 'border border-ink/30')}>{on ? t('a11y.on') : t('a11y.off')}</span>
    </button>
  )
}
