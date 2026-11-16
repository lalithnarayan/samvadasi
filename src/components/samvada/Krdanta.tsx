'use client'
import { baseVerb, ingForm, iast, toScript, type DhatuLite, type KrdantaId } from '@/lib/grammar'
import type { UIKey } from '@/lib/i18n'
import { DEEP, TINT, useSamvada } from './state'
import { Speak } from './Speak'

const ORDER: { id: KrdantaId; sk: string }[] = [
  { id: 'ktva', sk: 'क्त्वा' }, { id: 'tumun', sk: 'तुमुन्' }, { id: 'shatr', sk: 'शतृ' },
  { id: 'shanac', sk: 'शानच्' }, { id: 'tavya', sk: 'तव्यत्' }, { id: 'aniya', sk: 'अनीयर्' },
]

/** One short Sanskrit sentence per form that works for any verb, with its English. */
function example(id: KrdantaId, f: string, v: string): [string, string] | null {
  if (id === 'ktva') return [`${f} आगच्छामि।`, v ? `I'll ${v} and come back.` : '']
  if (id === 'tumun') return [`${f} इच्छामि।`, v ? `I want to ${v}.` : '']
  if (id === 'shatr' || id === 'shanac') return [`${f} बालकः हसति।`, v ? `The boy laughs while ${ingForm(v)}.` : '']
  if (id === 'tavya') return [`मया ${f}।`, v ? `I must ${v}.` : '']
  return null
}

/** Kṛdanta card on the verb page: गत्वा, गन्तुम्, गच्छन्, गन्तव्यम्… each with what it means and an example. */
export function KrdantaCard({ d }: { d: DhatuLite & { prefixes?: string[] } }) {
  const { sc, tr, t, lang, subj } = useSamvada()
  const k = d.krdanta
  if (!k || !Object.keys(k).length) return null
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const v = baseVerb(d.meaning_en)
  const prefixed = (d.prefixes?.length ?? 0) > 0
  return (
    <section aria-labelledby="krt-h" className="flex min-w-0 flex-col gap-4 rounded-[26px] border border-ink/12 bg-paper p-[clamp(18px,2vw,28px)]">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="krt-h" className="disp m-0 text-[26px] font-extrabold">{t('krt.title')}</h2>
        <span className="text-[15px] opacity-80">{t('krt.hint')}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ORDER.filter((o) => k[o.id]?.length).map((o) => {
          const forms = k[o.id]!, f = forms[0]
          const lyap = o.id === 'ktva' && prefixed
          const ex = example(o.id, f, v)
          return (
            <div key={o.id} className="flex min-w-0 flex-col gap-1.5 rounded-[20px] p-4" style={{ background: TINT[subj.color] }}>
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="text-[15px] font-bold" style={{ fontFamily: font, color: deep }}>{toScript(lyap ? 'ल्यप्' : o.sk, sc)}</span>
                <span className="text-[13px] font-semibold">{t((lyap ? 'krt.lyap' : `krt.${o.id}`) as UIKey)}</span>
              </span>
              <span className="flex items-center gap-2">
                <span lang="sa" className="text-[28px] leading-normal font-bold" style={{ fontFamily: font }}>{toScript(f, sc)}</span>
                <Speak text={f} />
              </span>
              {forms.length > 1 && <span className="text-[13px] opacity-80">{t('v.also')} <span style={{ fontFamily: font }}>{forms.slice(1).map((x) => toScript(x, sc)).join(', ')}</span></span>}
              {tr && <span className="text-[13px] italic opacity-80">{iast(f)}</span>}
              {ex && (
                <span className="mt-1 border-t border-ink/15 pt-2 text-[14px] leading-snug">
                  <span lang="sa" className="font-semibold" style={{ fontFamily: font }}>{toScript(ex[0], sc)}</span>
                  {lang === 'en' && ex[1] && <span className="block opacity-80">{ex[1]}</span>}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
