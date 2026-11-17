'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { iast, toScript } from '@/lib/grammar'
import type { UIKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Input } from '@/components/ui/input'

type T = { text: string; kind: string; where: string }
const KINDS = ['verse', 'greeting', 'word', 'noun', 'form', 'phrase']

export function RecordClient({ allowed, texts, recorded: rec0, ai }: { allowed: boolean; texts: T[]; recorded: Record<string, string>; ai: Record<string, string> }) {
  const { t, sc, tr, subj } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const [recorded, setRecorded] = useState(rec0)
  const [kind, setKind] = useState('verse')
  const [onlyTodo, setOnlyTodo] = useState(true)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'rec' | 'took' | 'saving' | 'saved' | 'error' | 'mic'>('idle')
  const [take, setTake] = useState<{ blob: Blob; url: string } | null>(null)
  const mr = useRef<MediaRecorder | null>(null), chunks = useRef<Blob[]>([])

  const list = useMemo(() => texts.filter((x) => x.kind === kind && (!onlyTodo || !recorded[x.text]) && (!q || x.text.includes(q) || iast(x.text).includes(q.toLowerCase()))), [texts, kind, onlyTodo, recorded, q])
  const done = Object.keys(recorded).length
  useEffect(() => { if (!sel && list[0]) setSel(list[0].text) }, [list, sel])
  useEffect(() => () => { if (take) URL.revokeObjectURL(take.url) }, [take])

  if (!allowed) return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex min-h-[60vh] flex-col justify-center gap-4 pb-[72px] outline-none">
        <span className="eyebrow" style={{ color: deep }}>{t('rec.eyebrow')}</span>
        <h1 className="disp m-0 text-[clamp(40px,6vw,80px)] font-extrabold">{t('rec.h1')}</h1>
        <p className="m-0 max-w-[560px] text-lg">{t('rec.login')}</p>
        <a href="/admin/login?redirect=%2Frecord" className="pill self-start rounded-full bg-ink px-6 py-3 font-semibold text-stone no-underline">{t('rec.loginBtn')} →</a>
      </main>
    </>
  )

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported(m)) || ''
      const m = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 48000 } : undefined)
      chunks.current = []
      m.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      m.onstop = () => { stream.getTracks().forEach((x) => x.stop()); const blob = new Blob(chunks.current, { type: m.mimeType }); setTake({ blob, url: URL.createObjectURL(blob) }); setState('took') }
      mr.current = m; m.start(); setState('rec')
    } catch { setState('mic') }
  }
  async function save() {
    if (!take || !sel) return
    setState('saving')
    const data = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(take.blob) })
    const r = await fetch('/record/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: sel, mime: take.blob.type, data }) }).catch(() => null)
    if (!r?.ok) { setState('error'); return }
    const j = await r.json()
    setRecorded((x) => ({ ...x, [sel]: j.url })); setState('saved')
    const i = list.findIndex((x) => x.text === sel)
    setTimeout(() => { setTake(null); setState('idle'); setSel(list[i + 1]?.text || list[0]?.text || null) }, 900)
  }
  const play = (url: string) => { new Audio(url).play().catch(() => {}) }

  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-6 pt-[clamp(24px,4vw,56px)] pb-[72px] outline-none">
        <div className="flex max-w-[820px] flex-col gap-3">
          <span className="eyebrow" style={{ color: deep }}>{t('rec.eyebrow')}</span>
          <h1 className="disp m-0 text-[clamp(40px,5.6vw,84px)] leading-[0.95] font-extrabold">{t('rec.h1')}</h1>
          <p className="m-0 text-lg leading-relaxed">{t('rec.p')}</p>
          <p className="m-0 text-[15px] font-semibold">{t('rec.progress', { d: done, n: texts.length })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label={t('rec.eyebrow')} className="seg flex-wrap rounded-[26px]">
            {KINDS.map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setSel(null) }} className={cn('pill min-h-10 rounded-full px-4 text-[14px] font-semibold', kind === k && 'bg-ink text-stone')}>{t(`rec.k.${k}` as UIKey)}</button>)}
          </div>
          <div role="group" className="seg">
            {[true, false].map((v) => <button key={String(v)} type="button" aria-pressed={onlyTodo === v} onClick={() => { setOnlyTodo(v); setSel(null) }} className={cn('pill min-h-10 rounded-full px-4 text-[14px] font-semibold', onlyTodo === v && 'bg-ink text-stone')}>{t(v ? 'rec.todo' : 'rec.done')}</button>)}
          </div>
          <label className="sr-only" htmlFor="rq">{t('rec.search')}</label>
          <Input id="rq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('rec.search')} className="h-11 max-w-[260px] rounded-full bg-paper px-4" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <ul className="m-0 flex max-h-[60vh] list-none flex-col gap-1.5 overflow-y-auto rounded-[22px] border border-ink/12 bg-paper p-2">
            {list.slice(0, 400).map((x) => (
              <li key={x.text}>
                <button type="button" onClick={() => { setSel(x.text); setTake(null); setState('idle') }} aria-current={sel === x.text}
                  className={cn('flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left', sel === x.text ? 'bg-ink text-stone' : 'hover:bg-ink/5')}>
                  <span lang="sa" className="flex-1 text-[17px]" style={{ fontFamily: font }}>{toScript(x.text, sc)}</span>
                  {recorded[x.text] && <span aria-hidden>✓</span>}
                </button>
              </li>
            ))}
          </ul>
          {sel && (
            <section aria-live="polite" className="flex min-w-0 flex-col gap-4 rounded-[26px] p-[clamp(20px,3vw,36px)]" style={{ background: TINT[subj.color] }}>
              <p lang="sa" className="m-0 text-[clamp(26px,3.2vw,46px)] leading-[1.6] font-semibold [overflow-wrap:anywhere]" style={{ fontFamily: font }}>{toScript(sel, sc)}</p>
              {tr && <p className="m-0 text-[15px] italic opacity-80">{iast(sel)}</p>}
              <div className="flex flex-wrap gap-2">
                {ai[sel] && <button type="button" onClick={() => play(ai[sel])} className="pill rounded-full border border-ink/30 bg-paper px-4 py-2 text-[14px] font-semibold">▶ {t('rec.ai')}</button>}
                {recorded[sel] && <button type="button" onClick={() => play(recorded[sel])} className="pill rounded-full border border-ink/30 bg-paper px-4 py-2 text-[14px] font-semibold">▶ {t('rec.done')}</button>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {state !== 'rec'
                  ? <button type="button" onClick={start} className="pill min-h-12 rounded-full bg-[#9C3A2A] px-6 text-[15px] font-bold text-white">● {take ? t('rec.again') : t('rec.record')}</button>
                  : <button type="button" onClick={() => mr.current?.stop()} className="pill min-h-12 animate-pulse rounded-full bg-ink px-6 text-[15px] font-bold text-stone">■ {t('rec.stop')}</button>}
                {take && state !== 'rec' && <>
                  <button type="button" onClick={() => play(take.url)} className="pill min-h-12 rounded-full border border-ink/30 bg-paper px-5 text-[15px] font-semibold">▶ {t('rec.yours')}</button>
                  <button type="button" onClick={save} disabled={state === 'saving'} className="pill min-h-12 rounded-full bg-ink px-6 text-[15px] font-bold text-stone">{t('rec.save')}</button>
                </>}
              </div>
              {state === 'saved' && <p className="m-0 font-semibold">{t('rec.saved')}</p>}
              {state === 'error' && <p className="m-0 font-semibold">{t('rec.error')}</p>}
              {state === 'mic' && <p className="m-0 font-semibold">{t('rec.mic')}</p>}
            </section>
          )}
        </div>
      </main>
    </>
  )
}
