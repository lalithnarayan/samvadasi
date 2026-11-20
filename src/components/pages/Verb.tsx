'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { familyView, iast, ktaCell, splitScript, LAKARA_NAMES, padaOf, tinCell, toScript, colorOfIdx, type Derived, type DhatuLite, type FamilyId, type LakaraId, type PadaId, type VoiceId } from '@/lib/grammar'
import { meaningOf, type UIKey } from '@/lib/i18n'
import { verbAbout } from '@/lib/seo'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Dock } from '@/components/samvada/Dock'
import { Footer } from '@/components/samvada/Footer'
import { KrdantaCard } from '@/components/samvada/Krdanta'
import { Speak } from '@/components/samvada/Speak'
import { VerbPicker } from '@/components/samvada/VerbPicker'
import { Derivation } from '@/components/samvada/Derivation'
import { cn } from '@/lib/utils'

type D = DhatuLite & { aupadeshika: string; prefixes: string[] }
type Ex = { text: string; source?: string | null; url?: string | null; translation?: string | null; form?: string | null; token?: string | null; reviewed?: boolean; licence?: string | null }

// उत्तम (I / we) first, as learners expect; Vidyut's cell order is unchanged (base index)
const ROWS = [{ sk: 'उत्तम', en: 'per.u', base: 6 }, { sk: 'मध्यम', en: 'per.m', base: 3 }, { sk: 'प्रथम', en: 'vb.rowHe', base: 0 }] as const
const SPOKEN: LakaraId[] = ['lat', 'lan', 'lrt', 'lot', 'vidhi']
const LITERARY: LakaraId[] = ['lit', 'lut', 'lun', 'ashir', 'lrn']
const COLH = [['num.0', 'एक'], ['num.1', 'द्वि'], ['num.2', 'बहु']] as const
const PADA_SK: Record<PadaId, string> = { P: 'परस्मैपद', A: 'आत्मनेपद' }
const FAMS: { id: FamilyId; sk: string }[] = [{ id: 'mula', sk: 'मूल' }, { id: 'nic', sk: 'णिच्' }, { id: 'san', sk: 'सन्' }, { id: 'yan', sk: 'यङ्' }]
const VOICES: { id: VoiceId; sk: string }[] = [{ id: 'kartari', sk: 'कर्तरि' }, { id: 'karmani', sk: 'कर्मणि' }]
type Rel = DhatuLite & { prefixes: string[] }

export function VerbClient({ d: base, examples, relatives = [] }: { d: D; examples: Ex[]; relatives?: Rel[] }) {
  const { subj, when, gen, num, sc, tr, t, lang, query, base: lb } = useSamvada()
  const colh = COLH.map(([k, sk]) => `${t(k)} · ${toScript(sk, sc)}`)
  const mean = meaningOf(base, lang, sc)
  // Verb family (सनादि) and voice (प्रयोग): stored for everyday and prefixed verbs, asked from Vidyut for the rest.
  const [fam, setFam] = useState<FamilyId>('mula')
  const [voice, setVoice] = useState<VoiceId>('kartari')
  const [derived, setDerived] = useState<Derived | null>(base.derived || null)
  const [loading, setLoading] = useState<'idle' | 'busy' | 'error'>('idle')
  const wantsFamily = fam !== 'mula' || voice !== 'kartari'
  useEffect(() => {
    if (!wantsFamily || derived || loading === 'busy') return
    setLoading('busy')
    fetch('/api/grammar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'derived', aupadeshika: base.aupadeshika, gana: base.gana, prefixes: base.prefixes }) })
      .then((r) => r.json()).then((j) => { if (j.derived) { setDerived(j.derived); setLoading('idle') } else setLoading('error') })
      .catch(() => setLoading('error'))
  }, [wantsFamily, derived, loading, base.aupadeshika, base.gana, base.prefixes])
  const view = familyView(base, fam, voice, derived)
  const d: D = view ? { ...base, ...view } : base
  const missing = wantsFamily && !view
  const [padaPick, setPada] = useState<PadaId>(padaOf(base))
  const pada: PadaId = d.padas.includes(padaPick) ? padaPick : padaOf(d)
  const rootRel = relatives.find((r) => !r.prefixes.length)
  const prefixed = relatives.filter((r) => r.prefixes.length)
  const lat3 = (x: DhatuLite) => tinCell(x, 'lat', 0)?.form || x.display
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const dict = `https://ambuda.org/tools/dictionaries/mw,apte/${encodeURIComponent(d.root)}`
  const req = (lak: string, idx: number) => ({ aupadeshika: d.aupadeshika, gana: d.gana, prefixes: d.prefixes, lak, idx, pada, sanadi: fam === 'mula' ? null : fam, prayoga: voice })
  const kta0 = ktaCell(d, 'm', 0)

  const grid = (lak: LakaraId, literary = false) => {
    const L = LAKARA_NAMES[lak], here = lak === when
    if (!d.forms?.[lak]?.[pada]) return null
    return (
      <section key={lak} className={cn('flex min-w-0 flex-col gap-3.5 rounded-[26px] bg-paper p-[clamp(18px,2vw,28px)]', literary && 'border-dashed')} style={{ border: here ? `1.5px solid ${deep}` : `1px ${literary ? 'dashed' : 'solid'} rgb(36 33 29 / .2)` }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[26px] font-bold" style={{ fontFamily: font }}>{toScript(L.name, sc)}</span>
          <span className="disp text-lg font-semibold">{t((L.literary ? `lak.${lak}` : `when.${lak}`) as UIKey)}</span>
          <span className="flex-1" />
          {here && <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: TINT[subj.color], color: deep }}>{t('vb.inBar')}</span>}
          {literary && <span className="rounded-full border border-ink/30 px-2.5 py-0.5 text-xs font-bold">{t('vb.forReading')}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse">
            <thead><tr><th className="w-24"><span className="sr-only">{t('dock.who')}</span></th>{colh.map((h) => <th key={h} scope="col" className="px-2.5 py-1 text-left text-xs font-semibold opacity-80">{h}</th>)}</tr></thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.sk} className="border-t border-ink/10">
                  <th scope="row" className="py-2.5 pr-2 text-left align-middle font-normal" style={{ color: DEEP[colorOfIdx(r.base)] }}>
                    <span className="block text-sm font-bold" style={{ fontFamily: font }}>{toScript(r.sk, sc)}</span><span className="text-xs font-semibold">{t(r.en)}</span>
                  </th>
                  {[0, 1, 2].map((n) => {
                    const idx = r.base + n, c = tinCell(d, lak, idx, pada)
                    const on = !literary && when !== 'kta' && idx === subj.idx
                    return (
                      <td key={n} className="rounded-[10px] px-2.5 py-2 align-top" style={{ background: on ? TINT[subj.color] : undefined }}>
                        {c && <>
                          <span lang="sa" className="block text-xl leading-relaxed font-semibold whitespace-nowrap" style={{ fontFamily: font }}>
                            {splitScript(c.stem, c.end, sc)[0]}<span style={{ color: DEEP[colorOfIdx(idx)] }}>{splitScript(c.stem, c.end, sc)[1]}</span>
                          </span>
                          {c.also.length > 0 && <span className="block text-[11px] opacity-80">{t('v.also')} {c.also.map((a) => toScript(a.form, sc)).join(', ')}</span>}
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
      <main id="main" tabIndex={-1} className="wrap outline-none flex flex-col gap-7 pt-[clamp(24px,4vw,56px)] pb-[72px]">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-1.5">
            <span className="eyebrow" style={{ color: deep }}>{t('vb.eyebrow', { code: d.code })}</span>
            {rootRel && <Link href={lb + `/verb/${rootRel.slug}${query}`} className="self-start text-sm font-semibold underline-offset-2 hover:underline">{t('pre.root')}: <span style={{ fontFamily: font }}>{toScript(rootRel.display, sc)}</span> · {meaningOf(rootRel, lang, sc).main} ↗</Link>}
            <h1 className={cn('m-0 font-normal', d.display.includes('+') ? 'text-[clamp(56px,8vw,128px)]' : 'text-[clamp(96px,13vw,200px)]', sc === 'deva' ? 'leading-[1.25]' : 'leading-[1.7]')} style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : font }}><span lang="sa">{toScript(d.display, sc)}</span><span className="sr-only"> — {t('vb.h1')}</span></h1>
            <p className="disp m-0 text-[clamp(26px,3vw,40px)] font-extrabold">
              <span style={mean.sanskrit ? { fontFamily: font } : undefined}>{mean.main}</span>{mean.sub && <span className="font-sans text-lg font-normal opacity-80"> · {mean.sub}</span>}
              {tr && <span className="font-sans text-lg font-normal italic opacity-75"> · {iast(d.root)}</span>}
            </p>
            {!mean.sanskrit && d.artha_sa && <p className="m-0 text-[15px] opacity-75">{t('vb.dp')}: <span style={{ fontFamily: font }}>{toScript(d.artha_sa, sc)}</span>{d.gloss ? ` · ${d.gloss}` : ''}</p>}
            <p className="m-0 mt-2 max-w-[62ch] text-[15px] leading-relaxed opacity-85">{verbAbout(d, lang, sc)}</p>
          </div>
          <div className="flex flex-col gap-3.5">
            <VerbPicker current={toScript(d.display, sc)} />
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold"><span style={{ fontFamily: font }}>{toScript('गण', sc)}</span> {d.gana}</span>
              {d.irregular && <span className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold">{t('v.irregular')}</span>}
              <span className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold">{d.status === 'approved' ? t('vb.approved') : t('vb.generated')}</span>
              <a href={dict} target="_blank" rel="noreferrer" className="rounded-full border border-ink/25 px-3.5 py-1.5 text-[13px] font-semibold underline-offset-2 hover:underline">{t('vb.dict')}</a>
            </div>
            {d.padas.length > 1 && (
              <div role="group" aria-label="Pada" className="seg self-start">
                {d.padas.map((p) => <button key={p} aria-pressed={p === pada} onClick={() => setPada(p)} className={cn('pill min-h-11 rounded-full px-4 text-sm font-semibold', p === pada && 'bg-ink text-stone')}><span style={{ fontFamily: font }}>{toScript(PADA_SK[p], sc)}</span></button>)}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t('vb.presentHe'), val: tinCell(d, 'lat', 0, pada)?.form },
                { label: t('vb.futureHe'), val: tinCell(d, 'lrt', 0, pada)?.form },
                { label: t('vb.pp'), val: kta0 ? kta0.stem + '-' : '—' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5 rounded-2xl border border-ink/12 bg-paper px-3.5 py-2.5">
                  <span className="text-xs font-semibold opacity-80">{s.label}</span>
                  <span className="flex items-center justify-between gap-1"><span className="text-[22px] leading-normal font-bold" style={{ fontFamily: font }}>{toScript(s.val || '—', sc)}</span>{s.val && !s.val.endsWith('-') && <Speak text={s.val} className="size-8" />}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section aria-labelledby="famh" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 id="famh" className="disp m-0 text-2xl font-extrabold">{t('fam.title')}</h2>
            <span className="text-sm opacity-75">{t('fam.hint')}</span>
          </div>
          <div role="group" aria-label={t('fam.title')} className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {FAMS.map((f) => {
              const on = f.id === fam
              const v = familyView(base, f.id, voice, derived)
              const sample = v ? tinCell(v, 'lat', 0)?.form : null
              return (
                <button key={f.id} aria-pressed={on} onClick={() => setFam(f.id)}
                  className={cn('pill flex min-h-[92px] flex-col gap-1 rounded-[22px] border px-4 py-3 text-left', on ? 'border-ink bg-ink text-stone' : 'border-ink/15 bg-paper')}>
                  <span className="flex items-baseline gap-2"><span className="text-lg font-bold" style={{ fontFamily: font }}>{toScript(f.sk, sc)}</span><span className="text-[13px] font-semibold opacity-80">{t(`fam.${f.id}` as UIKey)}</span></span>
                  <span lang="sa" className="text-[22px] leading-normal font-semibold" style={{ fontFamily: font }}>{sample ? toScript(sample, sc) : (derived ? '—' : '…')}</span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="disp text-lg font-extrabold">{t('voice.title')}</span>
            <div role="group" aria-label={t('voice.title')} className="seg">
              {VOICES.map((v) => (
                <button key={v.id} aria-pressed={v.id === voice} onClick={() => setVoice(v.id)} className={cn('pill flex min-h-11 flex-col items-center justify-center rounded-full px-4 leading-tight', v.id === voice && 'bg-ink text-stone')}>
                  <span className="text-[15px] font-bold" style={{ fontFamily: font }}>{toScript(v.sk, sc)}</span><span className="text-[11px] font-semibold">{t(`voice.${v.id}` as UIKey)}</span>
                </button>
              ))}
            </div>
            <span className="text-sm opacity-75">{voice === 'karmani' ? t('voice.note') : t('voice.hint')}</span>
          </div>
          {loading === 'busy' && <p className="m-0 text-sm opacity-75">{t('fam.loading')}</p>}
          {loading === 'error' && <p className="m-0 text-sm">{t('fam.error')}</p>}
          {missing && derived && <p className="m-0 text-sm">{t('fam.none')}</p>}
        </section>

        {prefixed.length > 0 && (
          <section aria-labelledby="preh" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 id="preh" className="disp m-0 text-2xl font-extrabold">{t('pre.title')}</h2>
              <span className="text-sm opacity-75">{t('pre.hint')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {prefixed.map((r) => (
                <Link key={r.slug} href={lb + `/verb/${r.slug}${query}`} className="pill flex min-h-11 items-baseline gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2 no-underline">
                  <span lang="sa" className="text-lg font-bold" style={{ fontFamily: font }}>{toScript(lat3(r), sc)}</span>
                  <span className="text-[13px] opacity-80">{meaningOf(r, lang, sc).main}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!missing && <div className="grid gap-5 lg:grid-cols-2">
          {d.participle && (
            <section className="flex min-w-0 flex-col gap-3.5 rounded-[26px] bg-paper p-[clamp(18px,2vw,28px)]" style={{ border: when === 'kta' ? `1.5px solid ${deep}` : '1px solid rgb(36 33 29 / .12)' }}>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-[26px] font-bold" style={{ fontFamily: font }}>{toScript('क्तवतु', sc)}</span><span className="disp text-lg font-semibold">{t('when.kta')}</span>
                <span className="flex-1" />
                {when === 'kta' && <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: TINT[subj.color], color: deep }}>{t('vb.inBar')}</span>}
              </div>
              <div className="overflow-x-auto"><table className="w-full min-w-[440px] border-collapse">
                <thead><tr><th className="w-24"><span className="sr-only">{t('dock.who')}</span></th>{colh.map((h) => <th key={h} className="px-2.5 py-1 text-left text-xs font-semibold opacity-80">{h}</th>)}</tr></thead>
                <tbody>
                  {(['m', 'f'] as const).map((g) => (
                    <tr key={g} className="border-t border-ink/10">
                      <th scope="row" className="py-2.5 pr-2 text-left font-normal" style={{ color: deep }}><span className="block text-sm font-bold" style={{ fontFamily: font }}>{toScript(g === 'm' ? 'पुं' : 'स्त्री', sc)}</span><span className="text-xs font-semibold">{t(g === 'm' ? 'col.masc' : 'col.fem')}</span></th>
                      {[0, 1, 2].map((n) => {
                        const c = ktaCell(d, g, n), on = when === 'kta' && gen === g && num === n
                        return (
                          <td key={n} className="rounded-[10px] px-2.5 py-2 align-top" style={{ background: on ? TINT[subj.color] : undefined }}>
                            {c && <><span lang="sa" className="block text-xl leading-relaxed font-semibold whitespace-nowrap" style={{ fontFamily: font }}>{splitScript(c.stem, c.end, sc)[0]}<span style={{ color: deep }}>{splitScript(c.stem, c.end, sc)[1]}</span></span>
                              {c.also.length > 0 && <span className="block text-[11px] opacity-80">{c.also.map((a) => `${t(`lbl.${a.label}` as UIKey)}: ${toScript(a.form, sc)}`).join(', ')}</span>}</>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table></div>
              {ktaCell(d, 'm', 0)?.note && <p className="m-0 text-sm italic opacity-80">{ktaCell(d, 'm', 0)?.note}</p>}
            </section>
          )}
          {SPOKEN.map((l) => grid(l))}
        </div>}

        {fam === 'mula' && <KrdantaCard d={d} />}

        <div className="mt-4 flex flex-col gap-1.5 border-t border-ink/25 pt-4">
          <span className="disp text-2xl font-extrabold">{t('vb.litH')}</span>
          <span className="text-[15px] opacity-80">{wantsFamily ? t('fam.literary') : t('vb.litP')}</span>
        </div>
        {!wantsFamily && <div className="grid gap-5 lg:grid-cols-2">{LITERARY.map((l) => grid(l, true))}</div>}

        {examples.length > 0 && (
          <section className="flex flex-col gap-3">
            <span className="disp text-2xl font-extrabold">{t('vb.texts')}</span>
            <span className="-mt-2 text-sm opacity-75">{t('vb.textsP')}</span>
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
                <figcaption className="mt-2 text-sm opacity-75">{e.source}{e.url && <> · <a href={e.url} target="_blank" rel="noreferrer" className="underline">{t('vb.readOn')}</a></>}{e.form && e.token && e.token !== e.form && <> · <span style={{ fontFamily: font }}>{toScript(e.token, sc)}</span> = <span style={{ fontFamily: font }}>{toScript(e.form, sc)}</span> {t('vb.sandhi')}</>}{!e.reviewed && <> · {t('vb.unchecked')}</>}</figcaption>
              </figure>
            ))}
          </section>
        )}
      </main>
      <Footer />
      <Dock />
    </>
  )
}
