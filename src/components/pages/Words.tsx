'use client'
import Link from 'next/link'
import { iast, toScript } from '@/lib/grammar'
import { nounMeaning, pick, type UIKey } from '@/lib/i18n'
import type { AvyayaLite, NounLite } from '@/lib/data'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Speak } from '@/components/samvada/Speak'

const CATS = ['question', 'place', 'time', 'join', 'manner', 'yesno'] as const

export function WordsClient({ words, kim }: { words: AvyayaLite[]; kim: NounLite[] }) {
  const { t, sc, tr, lang, subj, query } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-12 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="flex max-w-[820px] flex-col gap-3.5">
          <span className="eyebrow" style={{ color: deep }}>{t('w.eyebrow')}</span>
          <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('w.h1')}</h1>
          <p className="m-0 text-lg leading-relaxed">{t('w.p')}</p>
        </div>
        <nav aria-label={t('w.eyebrow')} className="-mt-6 flex flex-wrap gap-2">
          {CATS.map((c) => <a key={c} href={`#w-${c}`} className="pill rounded-full border border-ink/20 px-4 py-2 text-[14px] font-semibold no-underline">{t(`w.${c}` as UIKey)}</a>)}
        </nav>
        {CATS.map((c) => {
          const list = words.filter((w) => w.category === c)
          return (
            <section key={c} id={`w-${c}`} aria-labelledby={`wh-${c}`} className="flex scroll-mt-6 flex-col gap-3">
              <h2 id={`wh-${c}`} className="disp m-0 border-b border-ink/25 pb-2 text-[clamp(26px,3vw,40px)] font-extrabold">{t(`w.${c}` as UIKey)}</h2>
              <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
                {list.map((w) => (
                  <li key={w.word} className="flex min-w-0 flex-col gap-1 rounded-[22px] border border-ink/12 bg-paper px-5 py-4">
                    <span className="flex flex-wrap items-center gap-x-2.5">
                      <span lang="sa" className="min-w-0 text-[30px] leading-normal font-bold" style={{ fontFamily: font, color: deep }}>{toScript(w.word, sc)}</span>
                      <Speak text={w.word} />
                      <span className="flex-1" />
                      {tr && <span className="text-[14px] italic opacity-80">{iast(w.word)}</span>}
                    </span>
                    <span className="text-[17px] font-semibold">{pick(lang, [w.meaning_en, w.meaning_te, w.meaning_kn, w.meaning_ta])}</span>
                    {w.example && (
                      <span className="mt-1.5 rounded-2xl px-3 py-2 text-[15px] leading-snug" style={{ background: TINT[subj.color] }}>
                        <span lang="sa" className="block text-[18px] font-semibold" style={{ fontFamily: font }}>{toScript(w.example, sc)}</span>
                        {w.example_en && <span className="block opacity-80">{w.example_en}</span>}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
        {kim.length > 0 && (
          <section aria-labelledby="w-who" className="flex flex-col gap-3 rounded-[26px] bg-charcoal p-[clamp(20px,3vw,36px)] text-chalk">
            <h2 id="w-who" className="disp m-0 text-[clamp(24px,2.6vw,34px)] font-extrabold">{t('w.who')}</h2>
            <p className="m-0 max-w-[640px] text-[15px] text-[#D5CFC4]">{t('w.whoP')}</p>
            <div className="flex flex-wrap gap-2.5">
              {kim.map((n) => (
                <Link key={n.slug} href={`/noun/${n.slug}${query}`} className="pill flex items-baseline gap-2 rounded-full border border-chalk/30 px-4 py-2 text-chalk no-underline">
                  <span className="text-xl font-bold" style={{ fontFamily: font }}>{toScript(n.nom, sc)}</span><span className="text-[14px]">{nounMeaning(lang, n)}</span><span aria-hidden>→</span>
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
