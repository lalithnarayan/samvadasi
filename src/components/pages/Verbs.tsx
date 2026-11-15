'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { iast, ktaCell, padaOf, tinCell, toScript, WHENS, type DhatuLite } from '@/lib/grammar'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { Word } from '@/components/samvada/Word'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Dock } from '@/components/samvada/Dock'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const COLS = {
  0: [{ c: 'u', sk: 'अहम्', en: 'I', base: 6 }, { c: 'm', sk: 'त्वम्', en: 'you', base: 3 }, { c: 'p', sk: 'सः · सा · भवान्', en: 'he · she · you (resp.)', base: 0 }],
  1: [{ c: 'u', sk: 'आवाम्', en: 'we two', base: 6 }, { c: 'm', sk: 'युवाम्', en: 'you two', base: 3 }, { c: 'p', sk: 'तौ · ते · भवन्तौ', en: 'they two · resp.', base: 0 }],
  2: [{ c: 'u', sk: 'वयम्', en: 'we', base: 6 }, { c: 'm', sk: 'यूयम्', en: 'you all', base: 3 }, { c: 'p', sk: 'ते · ताः · भवन्तः', en: 'they · resp.', base: 0 }],
} as const

type Props = { rows: DhatuLite[]; q: string; scope: 'everyday' | 'all'; page: number; pages: number; found: number; total: number }

export function VerbsClient({ rows, q, scope, page, pages, found, total }: Props) {
  const { subj, when, num, gen, sc, tr, query } = useSamvada()
  const router = useRouter()
  const [text, setText] = useState(q)
  const w = WHENS.find((x) => x.id === when)!
  const kta = when === 'kta'
  const font = `var(--font-sk-${sc})`
  const go = (params: Record<string, string>) => {
    const u = new URLSearchParams(query.replace(/^\?/, ''))
    for (const [k, v] of Object.entries(params)) v ? u.set(k, v) : u.delete(k)
    router.push('/verbs?' + u.toString())
  }
  const cols = kta ? (['m', 'f'] as const).map((g) => ({ g, sk: g === 'm' ? 'पुंलिङ्गम्' : 'स्त्रीलिङ्गम्', en: g === 'm' ? 'masculine' : 'feminine' })) : COLS[num]
  return (
    <>
      <SiteNav />
      <main className="wrap flex flex-col gap-7 pt-[clamp(24px,4vw,56px)] pb-[72px]">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-3.5">
            <span className="eyebrow" style={{ color: DEEP[subj.color] }}>Verbs</span>
            <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{scope === 'everyday' ? `${found} everyday verbs.` : `${total.toLocaleString('en-IN')} dhatus.`}</h1>
            <p className="m-0 max-w-[520px] text-lg leading-relaxed">Showing <strong className="font-sk">{w.name}</strong> {w.en}, for <strong>{['one person', 'two people', 'many people'][num]}</strong>. Change it in the bar below and the whole table turns.</p>
          </div>
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); go({ q: text, scope: text ? 'all' : scope, page: '' }) }}>
            <label htmlFor="vq" className="eyebrow text-[11px] opacity-70">Find a verb — English, Devanagari, IAST root or Dhātupāṭha number</label>
            <div className="flex gap-2">
              <Input id="vq" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="go, eat, गम्, 01.1137…" className="h-14 rounded-full bg-paper px-5 text-[17px]" />
              <button className="pill h-14 shrink-0 rounded-full bg-ink px-6 text-[15px] font-semibold text-stone">Search</button>
            </div>
            <div role="group" aria-label="Which verbs" className="seg self-start">
              {(['everyday', 'all'] as const).map((s) => (
                <button type="button" key={s} aria-pressed={scope === s} onClick={() => { setText(''); go({ scope: s === 'all' ? 'all' : '', q: '', page: '' }) }}
                  className={cn('pill min-h-11 rounded-full px-4 text-sm font-semibold', scope === s && 'bg-ink text-stone')}>
                  {s === 'everyday' ? 'Everyday verbs' : `Whole Dhātupāṭha (${total.toLocaleString('en-IN')})`}
                </button>
              ))}
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-[26px] border border-ink/12 bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/20">
                  <th scope="col" className="sticky left-0 z-[2] bg-paper py-4 pr-4 pl-6"><span className="eyebrow text-[11px] opacity-70">Dhatu</span></th>
                  {cols.map((c: any) => {
                    const color = kta ? subj.color : c.c
                    const on = kta ? c.g === gen : c.c === subj.color
                    return (
                      <th key={c.sk} scope="col" className="px-4 py-3 align-bottom" style={{ background: on ? TINT[color as 'u'] : undefined }}>
                        <span className="block text-lg leading-normal font-bold" style={{ color: DEEP[color as 'u'], fontFamily: font }}>{toScript(c.sk, sc)}</span>
                        <span className="text-xs font-semibold">{c.en}</span>
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
                        <span className="text-[13px] opacity-75">{d.meaning_en || d.artha_sa} <span className="ml-1 rounded-full border border-ink/30 px-1.5 text-[10px] font-bold tracking-wider uppercase">{d.irregular ? 'irregular' : padaOf(d) === 'A' ? 'आत्मने' : 'परस्मै'} · {d.gana}</span></span>
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
                            {tr && <span className="text-xs italic opacity-60">{iast(cell.form)}</span>}
                            {cell.also.length > 0 && <span className="block text-xs opacity-70">also {cell.also.map((a) => `${toScript(a.form, sc)} (${a.label})`).join(', ')}</span>}
                          </> : <span className="text-sm opacity-50">—</span>}
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
              <span className="disp text-2xl font-extrabold">No dhatu by that name.</span>
              <span className="text-[15px] opacity-75">Try the English meaning (“go”, “eat”), the Devanagari root, or the Sanskrit meaning in the Dhātupāṭha (गतौ).</span>
            </div>
          )}
          {scope === 'all' && pages > 1 && (
            <div className="flex items-center gap-3 px-6 py-4">
              <button disabled={page <= 1} onClick={() => go({ page: String(page - 1) })} className="pill min-h-11 rounded-full border border-ink px-5 font-semibold disabled:opacity-40">← Previous</button>
              <span className="text-sm">Page {page} of {pages} · {found.toLocaleString('en-IN')} found</span>
              <button disabled={page >= pages} onClick={() => go({ page: String(page + 1) })} className="pill min-h-11 rounded-full border border-ink px-5 font-semibold disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
        <p className="m-0 max-w-[760px] text-sm leading-relaxed italic opacity-80">
          {kta ? 'Spoken past: the same form for I, you and he/she. Only gender and number change it.' : 'Respectful you (भवान् / भवती) uses the he/she column. आत्मनेपद verbs end in -ते, -से, -े. Forms come from Vidyut; teacher notes appear as “also”.'}
        </p>
      </main>
      <Dock />
    </>
  )
}
