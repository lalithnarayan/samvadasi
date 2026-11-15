'use client'
import { useState } from 'react'
import { iast, ktaCell, LAKARA_NAMES, padaOf, tinCell, toScript, colorOfIdx, type DhatuLite, type LakaraId, type PadaId } from '@/lib/grammar'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Dock } from '@/components/samvada/Dock'
import { VerbPicker } from '@/components/samvada/VerbPicker'
import { Derivation } from '@/components/samvada/Derivation'
import { cn } from '@/lib/utils'

type D = DhatuLite & { aupadeshika: string; prefixes: string[] }
type Ex = { text: string; source?: string | null; url?: string | null; translation?: string | null; form?: string | null; token?: string | null; reviewed?: boolean; licence?: string | null }

const ROWS = [{ sk: 'प्रथम', en: 'he · she · resp.', base: 0 }, { sk: 'मध्यम', en: 'you', base: 3 }, { sk: 'उत्तम', en: 'I · we', base: 6 }]
const SPOKEN: LakaraId[] = ['lat', 'lan', 'lrt', 'lot', 'vidhi']
const LITERARY: LakaraId[] = ['lit', 'lut', 'lun', 'ashir', 'lrn']
const COLH = ['one · एक', 'two · द्वि', 'many · बहु']
const PADA_SK: Record<PadaId, string> = { P: 'परस्मैपद', A: 'आत्मनेपद' }

export function VerbClient({ d, examples }: { d: D; examples: Ex[] }) {
  const { subj, when, gen, num, sc, tr } = useSamvada()
  const [pada, setPada] = useState<PadaId>(padaOf(d))
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const dict = `https://ambuda.org/tools/dictionaries/mw,apte/${encodeURIComponent(d.root)}`
  const req = (lak: string, idx: number) => ({ aupadeshika: d.aupadeshika, gana: d.gana, prefixes: d.prefixes, lak, idx, pada })
  const kta0 = ktaCell(d, 'm', 0)

  const grid = (lak: LakaraId, literary = false) => {
    const L = LAKARA_NAMES[lak], here = lak === when
    if (!d.forms?.[lak]?.[pada]) return null
    return (
      <section key={lak} className={cn('flex flex-col gap-3.5 rounded-[26px] bg-paper p-[clamp(18px,2vw,28px)]', literary && 'opacity-85')} style={{ border: here ? `1.5px solid ${deep}` : '1px solid rgb(36 33 29 / .12)' }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-sk text-[26px] font-bold">{L.name}</span>
          <span className="disp text-lg font-semibold">{L.en}</span>
          <span className="flex-1" />
          {here && <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: TINT[subj.color], color: deep }}>in the bar</span>}
          {literary && <span className="rounded-full border border-ink/30 px-2.5 py-0.5 text-xs font-bold">for reading</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse">
            <thead><tr><th className="w-24" />{COLH.map((h) => <th key={h} scope="col" className="px-2.5 py-1 text-left text-xs font-semibold opacity-70">{h}</th>)}</tr></thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.sk} className="border-t border-ink/10">
                  <th scope="row" className="py-2.5 pr-2 text-left align-middle font-normal" style={{ color: DEEP[colorOfIdx(r.base)] }}>
                    <span className="block font-sk text-sm font-bold">{r.sk}</span><span className="text-xs font-semibold">{r.en}</span>
                  </th>
                  {[0, 1, 2].map((n) => {
                    const idx = r.base + n, c = tinCell(d, lak, idx, pada)
                    const on = !literary && when !== 'kta' && idx === subj.idx
                    return (
                      <td key={n} className="rounded-[10px] px-2.5 py-2 align-top" style={{ background: on ? TINT[subj.color] : undefined }}>
                        {c && <>
                          <span lang="sa" className="block text-xl leading-relaxed font-semibold whitespace-nowrap" style={{ fontFamily: font }}>
                            {toScript(c.stem, sc)}<span style={{ color: DEEP[colorOfIdx(idx)] }}>{toScript(c.end, sc)}</span>
                          </span>
                          {c.also.length > 0 && <span className="block text-[11px] opacity-70">also {c.also.map((a) => toScript(a.form, sc)).join(', ')}</span>}
                          <Derivation form={c.form} req={req(lak, idx)} />
                        </>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <>
      <SiteNav />
      <main className="wrap flex flex-col gap-7 pt-[clamp(24px,4vw,56px)] pb-[72px]">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-1.5">
            <span className="eyebrow" style={{ color: deep }}>One verb · Dhātupāṭha {d.code}</span>
            <p lang="sa" className="m-0 text-[clamp(96px,13vw,200px)] leading-[1.25]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : font }}>{toScript(d.display, sc)}</p>
            <p className="disp m-0 text-[clamp(26px,3vw,40px)] font-extrabold">
              {d.meaning_en || <span className="font-sk">{d.artha_sa}</span>}
              {tr && <span className="font-sans text-lg font-normal italic opacity-65"> · {iast(d.root)}</span>}
            </p>
            {d.meaning_en && d.artha_sa && <p className="m-0 text-[15px] opacity-75">Dhātupāṭha: <span className="font-sk">{d.artha_sa}</span>{d.gloss ? ` · ${d.gloss}` : ''}</p>}
          </div>
          <div className="flex flex-col gap-3.5">
            <VerbPicker current={d.display} />
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold">गण {d.gana}</span>
              {d.irregular && <span className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold">irregular</span>}
              <span className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold">{d.status === 'approved' ? 'approved by a teacher' : 'Vidyut-generated'}</span>
              <a href={dict} target="_blank" rel="noreferrer" className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold underline-offset-2 hover:underline">Dictionary on Ambuda ↗</a>
            </div>
            {d.padas.length > 1 && (
              <div role="group" aria-label="Pada" className="seg self-start">
                {d.padas.map((p) => <button key={p} aria-pressed={p === pada} onClick={() => setPada(p)} className={cn('pill min-h-11 rounded-full px-4 text-sm font-semibold', p === pada && 'bg-ink text-stone')}><span className="font-sk">{PADA_SK[p]}</span></button>)}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'present (he)', val: tinCell(d, 'lat', 0, pada)?.form },
                { label: 'future (he)', val: tinCell(d, 'lrt', 0, pada)?.form },
                { label: 'past participle', val: kta0 ? kta0.stem + '-' : '—' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5 rounded-2xl border border-ink/12 bg-paper px-3.5 py-2.5">
                  <span className="text-xs font-semibold opacity-70">{s.label}</span>
                  <span className="text-[22px] leading-normal font-bold" style={{ fontFamily: font }}>{toScript(s.val || '—', sc)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {d.participle && (
            <section className="flex flex-col gap-3.5 rounded-[26px] bg-paper p-[clamp(18px,2vw,28px)]" style={{ border: when === 'kta' ? `1.5px solid ${deep}` : '1px solid rgb(36 33 29 / .12)' }}>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-sk text-[26px] font-bold">क्तवतु</span><span className="disp text-lg font-semibold">past · spoken</span>
                <span className="flex-1" />
                {when === 'kta' && <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: TINT[subj.color], color: deep }}>in the bar</span>}
              </div>
              <table className="w-full border-collapse">
                <thead><tr><th className="w-24" />{COLH.map((h) => <th key={h} className="px-2.5 py-1 text-left text-xs font-semibold opacity-70">{h}</th>)}</tr></thead>
                <tbody>
                  {(['m', 'f'] as const).map((g) => (
                    <tr key={g} className="border-t border-ink/10">
                      <th scope="row" className="py-2.5 pr-2 text-left font-normal" style={{ color: deep }}><span className="block font-sk text-sm font-bold">{g === 'm' ? 'पुं' : 'स्त्री'}</span><span className="text-xs font-semibold">{g === 'm' ? 'masculine' : 'feminine'}</span></th>
                      {[0, 1, 2].map((n) => {
                        const c = ktaCell(d, g, n), on = when === 'kta' && gen === g && num === n
                        return (
                          <td key={n} className="rounded-[10px] px-2.5 py-2 align-top" style={{ background: on ? TINT[subj.color] : undefined }}>
                            {c && <><span lang="sa" className="block text-xl leading-relaxed font-semibold whitespace-nowrap" style={{ fontFamily: font }}>{toScript(c.stem, sc)}<span style={{ color: deep }}>{toScript(c.end, sc)}</span></span>
                              {c.also.length > 0 && <span className="block text-[11px] opacity-70">{c.also.map((a) => `${a.label}: ${toScript(a.form, sc)}`).join(', ')}</span>}</>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {ktaCell(d, 'm', 0)?.note && <p className="m-0 text-sm italic opacity-80">{ktaCell(d, 'm', 0)?.note}</p>}
            </section>
          )}
          {SPOKEN.map((l) => grid(l))}
        </div>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-ink/25 pt-4">
          <span className="disp text-2xl font-extrabold">The five literary lakāras</span>
          <span className="text-[15px] opacity-80">For reading the Gītā and the epics, not for everyday speech.</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">{LITERARY.map((l) => grid(l, true))}</div>

        {examples.length > 0 && (
          <section className="flex flex-col gap-3">
            <span className="disp text-2xl font-extrabold">In the texts</span>
            <span className="-mt-2 text-sm opacity-75">Verses from texts published on Ambuda (GRETIL, CC BY-NC-SA 4.0). The highlighted word is this verb.</span>
            {examples.map((e, i) => (
              <figure key={i} className="m-0 rounded-[22px] border border-ink/12 bg-paper px-6 py-5">
                <blockquote lang="sa" className="m-0 text-[22px] leading-relaxed font-semibold whitespace-pre-line" style={{ fontFamily: font }}>
                  {(() => {
                    const w = [e.token, e.form].find((x) => x && e.text.includes(x))
                    if (!w) return toScript(e.text, sc)
                    const i = e.text.indexOf(w)
                    return <>{toScript(e.text.slice(0, i), sc)}<mark className="rounded bg-transparent px-0.5" style={{ color: deep, boxShadow: `inset 0 -0.35em 0 ${TINT[subj.color]}` }}>{toScript(w, sc)}</mark>{toScript(e.text.slice(i + w.length), sc)}</>
                  })()}
                </blockquote>
                {e.translation && <p className="mt-1.5 mb-0 text-[15px]">{e.translation}</p>}
                <figcaption className="mt-2 text-sm opacity-75">{e.source}{e.url && <> · <a href={e.url} target="_blank" rel="noreferrer" className="underline">read on Ambuda ↗</a></>}{e.form && e.token && e.token !== e.form && <> · <span className="font-sk">{toScript(e.token, sc)}</span> = <span className="font-sk">{toScript(e.form, sc)}</span> after sandhi</>}{!e.reviewed && <> · found automatically, not yet checked by a teacher</>}</figcaption>
              </figure>
            ))}
          </section>
        )}
      </main>
      <Dock />
    </>
  )
}
