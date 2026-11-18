'use client'
import Link from 'next/link'
import { iast, nounPattern, splitScript, stemOf, toScript, VIBHAKTI } from '@/lib/grammar'
import { nounMeaning, type UIKey } from '@/lib/i18n'
import type { NounLite } from '@/lib/data'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'

const NUM_SK = ['एकवचनम्', 'द्विवचनम्', 'बहुवचनम्']

export function NounClient({ n, same }: { n: NounLite; same: NounLite[] }) {
  const { t, sc, tr, lang, subj, query, base } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const forms = n.forms || []
  const stem = stemOf(forms.flatMap((row) => row.map((c) => c[0])).filter(Boolean))
  const rows = n.kind === 'pronoun' ? forms.slice(0, 7) : forms
  const pat = nounPattern(n.display, n.gender, n.kind)
  const colh = [t('n.sg'), t('n.du'), t('n.pl')]
  const cell = (f: string) => {
    if (!f) return '—'
    const [s, e] = stem && f.startsWith(stem) ? splitScript(stem, f.slice(stem.length), sc) : ['', toScript(f, sc)]
    return <>{s}<span style={{ color: deep }}>{e}</span></>
  }
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-8 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="flex flex-col gap-2">
          <Link href={base + '/nouns' + query} className="self-start text-sm font-semibold underline-offset-2 hover:underline">← {t('n.back')}</Link>
          <span className="eyebrow" style={{ color: deep }}><span style={{ fontFamily: font }}>{toScript(pat, sc)}</span> · {t(`g.${n.gender}` as UIKey)}</span>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="m-0 min-w-0 font-normal text-[clamp(48px,11vw,168px)] leading-[1.25] [overflow-wrap:anywhere]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : font }}><span lang="sa">{toScript(n.nom, sc)}</span><span className="sr-only"> — {t('n.h1')}</span></h1>
            <Speak text={n.nom} className="size-11" />
            <ShareButton t={n.nom} s={nounMeaning('en', n)} k={pat} />
          </div>
          <p className="disp m-0 text-[clamp(24px,2.8vw,36px)] font-extrabold">{nounMeaning(lang, n)}{lang !== 'en' && <span className="font-sans text-lg font-normal opacity-80"> · {n.meaning_en}</span>}
            {tr && <span className="font-sans text-lg font-normal italic opacity-80"> · {iast(n.display)}</span>}</p>
          {n.gloss && <p className="m-0 max-w-[640px] text-[15px] opacity-80">{n.gloss}</p>}
        </div>

        <section aria-label={t('n.case')} className="min-w-0 rounded-[26px] border border-ink/12 bg-paper p-[clamp(14px,2vw,28px)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/20">
                  <th scope="col" className="w-[30%] px-3 py-2 text-[13px] font-semibold opacity-80">{t('n.case')}</th>
                  {colh.map((h, i) => <th key={i} scope="col" className="px-3 py-2"><span className="block text-[15px] font-bold" style={{ fontFamily: font }}>{toScript(NUM_SK[i], sc)}</span><span className="text-[12px] font-semibold opacity-80">{h}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ci) => (
                  <tr key={ci} className="border-t border-ink/10">
                    <th scope="row" className="px-3 py-3 align-top font-normal">
                      <span className="block text-[16px] font-bold" style={{ fontFamily: font, color: deep }}>{toScript(VIBHAKTI[ci], sc)}</span>
                      <span className="text-[13px]">{t(`case.${ci}` as UIKey)}</span>
                    </th>
                    {row.map((c, ni) => (
                      <td key={ni} className="px-3 py-3 align-top" style={{ background: ci === 0 && ni === 0 ? TINT[subj.color] : undefined }}>
                        <span lang="sa" className="block text-[22px] leading-relaxed font-semibold" style={{ fontFamily: font }}>{cell(c[0])}</span>
                        {c.length > 1 && <span className="block text-[12px] opacity-80">{t('v.also')} <span style={{ fontFamily: font }}>{c.slice(1).map((x) => toScript(x, sc)).join(', ')}</span></span>}
                        {tr && <span className="block text-[12px] italic opacity-80">{iast(c[0] || '')}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {n.kind === 'pronoun' && <p className="m-0 mt-3 text-[13px] italic opacity-80">{t('n.noVoc')}</p>}
        </section>

        {same.length > 0 && (
          <section aria-labelledby="same-h" className="flex flex-col gap-3">
            <h2 id="same-h" className="disp m-0 text-2xl font-extrabold">{t('n.same')} <span className="text-base font-semibold opacity-80" style={{ fontFamily: font }}>{toScript(pat, sc)}</span></h2>
            <div className="flex flex-wrap gap-2">
              {same.map((x) => (
                <Link key={x.slug} href={base + `/noun/${x.slug}${query}`} className="pill flex items-baseline gap-2 rounded-full border border-ink/20 bg-paper px-4 py-2 no-underline">
                  <span className="text-lg font-bold" style={{ fontFamily: font }}>{toScript(x.nom, sc)}</span><span className="text-[13px]">{nounMeaning(lang, x)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
