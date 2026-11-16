'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { iast, ktaCell, padaOf, tinCell, toScript, WHENS, type DhatuLite } from '@/lib/grammar'
import { meaningOf, type UIKey } from '@/lib/i18n'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { Word } from '@/components/samvada/Word'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Dock } from '@/components/samvada/Dock'
import { Footer } from '@/components/samvada/Footer'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const COLS = {
  0: [{ c: 'u', sk: 'अहम्', en: 'col.I', base: 6 }, { c: 'm', sk: 'त्वम्', en: 'col.you', base: 3 }, { c: 'p', sk: 'सः · सा · भवान्', en: 'col.he', base: 0 }],
  1: [{ c: 'u', sk: 'आवाम्', en: 'col.we2', base: 6 }, { c: 'm', sk: 'युवाम्', en: 'col.you2', base: 3 }, { c: 'p', sk: 'तौ · ते · भवन्तौ', en: 'col.they2', base: 0 }],
  2: [{ c: 'u', sk: 'वयम्', en: 'col.we', base: 6 }, { c: 'm', sk: 'यूयम्', en: 'col.youAll', base: 3 }, { c: 'p', sk: 'ते · ताः · भवन्तः', en: 'col.they', base: 0 }],
} as const

type Props = { rows: DhatuLite[]; q: string; scope: 'everyday' | 'prefixed' | 'all'; page: number; pages: number; found: number; total: number; prefixedTotal: number }

export function VerbsClient({ rows: allRows, q, scope, page, pages, found, total, prefixedTotal }: Props) {
  const { subj, when, num, gen, sc, tr, query, t, lang } = useSamvada()
  const router = useRouter()
  const [text, setText] = useState(q)
  // "With prefixes": filter by the root (गम्, विश्, भू …)
  const [rootPick, setRootPick] = useState('')
  const roots = scope === 'prefixed' ? [...new Set(allRows.map((d) => d.root))] : []
  const rows = scope === 'prefixed' && rootPick ? allRows.filter((d) => d.root === rootPick) : allRows
  const w = WHENS.find((x) => x.id === when)!
  const kta = when === 'kta'
  const font = `var(--font-sk-${sc})`
  const go = (params: Record<string, string>) => {
    const u = new URLSearchParams(query.replace(/^\?/, ''))
    for (const [k, v] of Object.entries(params)) v ? u.set(k, v) : u.delete(k)
    router.push('/verbs?' + u.toString())
  }
  const cols = kta ? (['m', 'f'] as const).map((g) => ({ g, sk: g === 'm' ? 'पुंलिङ्गम्' : 'स्त्रीलिङ्गम्', en: g === 'm' ? 'col.masc' : 'col.fem' })) : COLS[num]
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap outline-none flex flex-col gap-7 pt-[clamp(24px,4vw,56px)] pb-[72px]">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="flex min-w-0 flex-col gap-3.5">
            <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('nav.verbs')}</span>
            <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{scope === 'everyday' ? t('v.everyday', { n: found }) : scope === 'prefixed' ? t('v.prefixedH', { n: found }) : t('v.dhatus', { n: total.toLocaleString('en-IN') })}</h1>
            <p className="m-0 max-w-[520px] text-lg leading-relaxed">{t('v.showing', { when: `${toScript(w.name, sc)} ${t(`when.${w.id}`)}`, count: t(`v.c${num}`) })}</p>
          </div>
          <form className="flex min-w-0 flex-col gap-3" onSubmit={(e) => { e.preventDefault(); go({ q: text, scope: text ? 'all' : scope, page: '' }) }}>
            <label htmlFor="vq" className="eyebrow text-[11px] opacity-80">{t('v.find')}</label>
            <div className="flex gap-2">
              <Input id="vq" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('v.searchPh')} aria-describedby="vq-hint" className="h-14 min-w-0 rounded-full bg-paper px-5 text-[17px]" />
              <button className="pill h-14 shrink-0 rounded-full bg-ink px-6 text-[15px] font-semibold text-stone">{t('v.search')}</button>
            </div>
            <p id="vq-hint" className="m-0 text-[13px] opacity-75">{t('v.searchHint')}</p>
            <div role="group" aria-label={t('v.which')} className="seg flex-wrap self-start rounded-[26px]">
              {(['everyday', 'prefixed', 'all'] as const).map((s) => (
                <button type="button" key={s} aria-pressed={scope === s} onClick={() => { setText(''); setRootPick(''); go({ scope: s === 'everyday' ? '' : s, q: '', page: '' }) }}
                  className={cn('pill min-h-11 rounded-full px-4 text-sm font-semibold', scope === s && 'bg-ink text-stone')}>
                  {s === 'everyday' ? t('v.everydayBtn') : s === 'prefixed' ? t('v.prefixedBtn', { n: prefixedTotal }) : t('v.wholeBtn', { n: total.toLocaleString('en-IN') })}
                </button>
              ))}
            </div>
            {scope === 'prefixed' && roots.length > 1 && (
              <div className="flex flex-col gap-2">
                <span className="eyebrow text-[11px] opacity-80">{t('v.filterRoot')}</span>
                <div role="group" aria-label={t('v.filterRoot')} className="flex flex-wrap gap-1.5">
                  {['', ...roots].map((r) => (
                    <button type="button" key={r || 'all'} aria-pressed={rootPick === r} onClick={() => setRootPick(r)}
                      className={cn('pill min-h-10 rounded-full border border-ink/20 px-3.5 text-[15px] font-bold', rootPick === r && 'bg-ink text-stone')}
                      style={r ? { fontFamily: font } : undefined}>{r ? toScript(r, sc) : t('v.all')}</button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="overflow-hidden rounded-[26px] border border-ink/12 bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/20">
                  <th scope="col" className="sticky left-0 z-[2] bg-paper py-4 pr-4 pl-6"><span className="eyebrow text-[11px] opacity-80">{t('v.dhatu')}</span></th>
                  {cols.map((c: any) => {
                    const color = kta ? subj.color : c.c
                    const on = kta ? c.g === gen : c.c === subj.color
                    return (
                      <th key={c.sk} scope="col" className="px-4 py-3 align-bottom" style={{ background: on ? TINT[color as 'u'] : undefined }}>
                        <span className="block text-lg leading-normal font-bold" style={{ color: DEEP[color as 'u'], fontFamily: font }}>{toScript(c.sk, sc)}</span>
                        <span className="text-xs font-semibold">{t(c.en as UIKey)}</span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((d, ri) => (
                  <tr key={d.slug} className="border-b border-ink/8">
                    <th scope="row" className="sticky left-0 z-[1] bg-paper py-3 pr-4 pl-6 font-normal">
                      <Link href={`/verb/${d.slug}${query}`} className="flex flex-col gap-0.5 no-underline hover:underline">
                        <span className="text-[22px] leading-normal font-bold" style={{ fontFamily: font }}>{toScript(d.display, sc)}</span>
                        {(() => { const m = meaningOf(d, lang, sc); return <span className="text-[13px] opacity-75">{m.main}{m.sub && <span className="opacity-80"> · {m.sub}</span>} <span className="ml-1 rounded-full border border-ink/30 px-1.5 text-[10px] font-bold tracking-wider uppercase">{d.irregular ? t('v.irregular') : toScript(padaOf(d) === 'A' ? 'आत्मने' : 'परस्मै', sc)} · {d.gana}</span></span> })()}
                      </Link>
                    </th>
                    {cols.map((c: any) => {
                      const cell = kta ? ktaCell(d, c.g, num) : tinCell(d, when as any, c.base + num)
                      const color = kta ? subj.color : c.c
                      const on = kta ? c.g === gen : c.c === subj.color
                      return (
                        <td key={c.sk} className="px-4 py-3 align-middle" style={{ background: on ? 'rgb(36 33 29 / .035)' : undefined }}>
                          {cell ? <>
                            <Word stem={cell.stem} end={cell.end} color={DEEP[color as 'u']} delay={Math.min(ri * 18, 300)} className="block text-[22px] leading-relaxed font-semibold whitespace-nowrap" style={{ fontFamily: font }} />
                            {tr && <span className="text-xs italic opacity-75">{iast(cell.form)}</span>}
                            {cell.also.length > 0 && <span className="block text-xs opacity-80">{t('v.also')} {cell.also.map((a) => `${toScript(a.form, sc)} (${t(`lbl.${a.label}` as UIKey)})`).join(', ')}</span>}
                          </> : <span className="text-sm opacity-75">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <div className="flex flex-col gap-1.5 px-6 py-10">
              <span className="disp text-2xl font-extrabold">{t('v.none')}</span>
              <span className="text-[15px] opacity-75">{t('v.noneHint')}</span>
            </div>
          )}
          {scope === 'all' && pages > 1 && (
            <div className="flex items-center gap-3 px-6 py-4">
              <button disabled={page <= 1} onClick={() => go({ page: String(page - 1) })} className="pill min-h-11 rounded-full border border-ink px-5 font-semibold disabled:opacity-40">{t('v.prev')}</button>
              <span className="text-sm">{t('v.page', { p: page, n: pages, f: found.toLocaleString('en-IN') })}</span>
              <button disabled={page >= pages} onClick={() => go({ page: String(page + 1) })} className="pill min-h-11 rounded-full border border-ink px-5 font-semibold disabled:opacity-40">{t('v.next')}</button>
            </div>
          )}
        </div>
        <p className="m-0 max-w-[760px] text-sm leading-relaxed italic opacity-80">
          {kta ? t('v.footKta') : t('v.footLat')}
        </p>
      </main>
      <Footer />
      <Dock />
    </>
  )
}
