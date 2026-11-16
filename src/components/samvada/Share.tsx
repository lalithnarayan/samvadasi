'use client'
import { useEffect, useRef, useState } from 'react'
import { toScript } from '@/lib/grammar'
import { cardUrl } from '@/lib/card'
import { cn } from '@/lib/utils'
import { useSamvada } from './state'

/**
 * Share button: turns a phrase, verb, noun or greeting into an image card in the chosen lipi and the
 * person's colour, and opens the phone's share sheet (WhatsApp, Instagram …). On desktops it offers
 * download, WhatsApp and copy-link instead.
 */
export function ShareButton({ t: text, s, k, className }: { t: string; s?: string; k?: string; className?: string }) {
  const { sc, subj, t } = useSamvada()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => { if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close); document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [open])
  const shown = toScript(text, sc)
  const img = (f: 'og' | 'sq') => cardUrl({ t: shown, s, k, c: subj.color, f })
  const page = typeof window !== 'undefined' ? window.location.href : 'https://samvada.si'
  const caption = `${shown}${s ? ' — ' + s : ''}`

  async function share(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    try {
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(img('sq'))).blob()
        const file = new File([blob], 'samvadasi.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: `${caption}\n${page}` }); return }
      }
      if (navigator.share) { await navigator.share({ text: caption, url: page }); return }
    } catch (err) { if ((err as Error)?.name === 'AbortError') return }
    setOpen((o) => !o)
  }
  async function copy() {
    try { await navigator.clipboard.writeText(page); setMsg(t('sh.copied')); setTimeout(() => setMsg(''), 1800) } catch {}
  }
  const item = 'flex min-h-11 items-center rounded-xl px-3 text-left text-[14px] font-semibold no-underline hover:bg-ink/5'
  return (
    <div ref={box} className="relative inline-flex">
      <button type="button" onClick={share} aria-expanded={open} aria-label={t('sh.btn')} title={t('sh.btn')}
        className={cn('pill inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/25 bg-paper/70', className)}>
        <svg aria-hidden width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 10.5V2M4.8 5.2 8 2l3.2 3.2" /><path d="M3 8.5v4.2c0 .7.6 1.3 1.3 1.3h7.4c.7 0 1.3-.6 1.3-1.3V8.5" /></svg>
      </button>
      {open && (
        <div role="menu" onClick={(e) => e.stopPropagation()} className="absolute top-11 right-0 z-50 flex w-64 flex-col gap-0.5 rounded-[18px] border border-ink/15 bg-paper p-2 shadow-[0_18px_40px_-18px_rgb(36_33_29/.45)]">
          <a role="menuitem" href={img('og')} download="samvadasi.png" className={item}>{t('sh.image')}</a>
          <a role="menuitem" href={img('sq')} download="samvadasi-square.png" className={item}>{t('sh.square')}</a>
          <a role="menuitem" href={`https://wa.me/?text=${encodeURIComponent(`${caption}\n${page}`)}`} target="_blank" rel="noreferrer" className={item}>{t('sh.whatsapp')}</a>
          <button role="menuitem" type="button" onClick={copy} className={item}>{msg || t('sh.copy')}</button>
        </div>
      )}
    </div>
  )
}
