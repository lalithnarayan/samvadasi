'use client'
import { iast, toScript } from '@/lib/grammar'
import { pick } from '@/lib/i18n'
import type { GreetingLite } from '@/lib/data'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'
import { Speak } from '@/components/samvada/Speak'
import { ShareButton } from '@/components/samvada/Share'

export function GreetingsClient({ items }: { items: GreetingLite[] }) {
  const { t, sc, tr, lang, subj } = useSamvada()
  const font = `var(--font-sk-${sc})`, deep = DEEP[subj.color]
  const greet = items.filter((x) => x.kind === 'greeting'), names = items.filter((x) => x.kind === 'name')
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-12 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="flex max-w-[820px] flex-col gap-3.5">
          <span className="eyebrow" style={{ color: deep }}>{t('gr.eyebrow')}</span>
          <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('gr.h1')}</h1>
          <p className="m-0 text-lg leading-relaxed">{t('gr.p')}</p>
        </div>
        <section aria-labelledby="gr-g" className="flex flex-col gap-3">
          <h2 id="gr-g" className="disp m-0 border-b border-ink/25 pb-2 text-[clamp(26px,3vw,40px)] font-extrabold">{t('gr.greetings')}</h2>
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {greet.map((g) => (
              <li key={g.text} className="flex min-w-0 flex-col gap-1.5 rounded-[22px] border border-ink/12 bg-paper px-5 py-4">
                <span className="flex items-start gap-2">
                  <span lang="sa" className="min-w-0 flex-1 text-[30px] leading-snug font-bold [overflow-wrap:anywhere]" style={{ fontFamily: font, color: deep }}>{toScript(g.text, sc)}</span>
                  <Speak text={g.text} />
                  <ShareButton t={g.text} s={pick(lang, g.meaning)} k={t('gr.greetings')} />
                </span>
                {tr && <span className="text-[14px] italic opacity-80">{iast(g.text)}</span>}
                <span className="text-[18px] font-semibold">{pick(lang, g.meaning)}</span>
                {pick(lang, g.when) && <span className="text-[14px] leading-snug opacity-90">{pick(lang, g.when)}</span>}
                {g.reply && <span className="mt-1 self-start rounded-full px-3 py-1 text-[14px]" style={{ background: TINT[subj.color] }}>{t('gr.reply')}: <span lang="sa" className="font-bold" style={{ fontFamily: font }}>{toScript(g.reply, sc)}</span></span>}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="gr-n" className="flex flex-col gap-3">
          <h2 id="gr-n" className="disp m-0 border-b border-ink/25 pb-2 text-[clamp(26px,3vw,40px)] font-extrabold">{t('gr.names')}</h2>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {names.map((g) => (
              <li key={g.text} className="flex min-w-0 flex-col gap-1 rounded-[22px] border border-ink/12 bg-paper px-5 py-4">
                <span className="flex items-center gap-2">
                  <span lang="sa" className="min-w-0 flex-1 text-[28px] leading-snug font-bold [overflow-wrap:anywhere]" style={{ fontFamily: font }}>{toScript(g.text, sc)}</span>
                  <ShareButton t={g.text} s={pick(lang, g.meaning)} k={t('gr.names')} />
                </span>
                <span className="text-[12px] font-semibold opacity-80">{t(g.gender === 'f' ? 'gr.girl' : 'gr.boy')}{tr && <> · <i>{iast(g.text)}</i></>}</span>
                <span className="text-[17px] font-semibold">{pick(lang, g.meaning)}</span>
                {pick(lang, g.when) && <span className="text-[14px] leading-snug opacity-90">{pick(lang, g.when)}</span>}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}
