'use client'
import { DEEP, useSamvada } from '@/components/samvada/state'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Footer } from '@/components/samvada/Footer'

const GH = 'https://github.com/lalithnarayan/samvadasi'

export function SupportClient({ upi, upiLink, qr, url }: { upi: string; upiLink: string; qr: string; url: string }) {
  const { t, subj } = useSamvada()
  const deep = DEEP[subj.color]
  const ways = [
    { t: t('sup.share'), href: null },
    { t: t('sup.fix'), href: `${GH}/issues/new` },
    { t: t('sup.star'), href: GH },
    { t: t('sup.teach'), href: `${GH}/discussions` },
    { t: t('sup.record'), href: '/record' },
  ]
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="wrap flex flex-col gap-10 pt-[clamp(24px,4vw,56px)] pb-[96px] outline-none">
        <div className="flex max-w-[760px] flex-col gap-4">
          <span className="eyebrow" style={{ color: deep }}>{t('sup.eyebrow')}</span>
          <h1 className="disp m-0 text-[clamp(44px,6.4vw,96px)] leading-[0.95] font-extrabold">{t('sup.h1')}</h1>
          <p className="m-0 text-lg leading-relaxed">{t('sup.p')}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <section aria-labelledby="give" className="flex min-w-0 flex-col gap-4 rounded-[26px] border border-ink/12 bg-paper p-[clamp(20px,2.4vw,32px)]">
            <h2 id="give" className="disp m-0 text-[28px] font-extrabold">{t('sup.give')}</h2>
            {!upi && !url && <p className="m-0 text-[15px] leading-relaxed">{t('sup.soon')}</p>}
            {upi && (
              <div className="flex flex-wrap items-center gap-5">
                {qr && <div role="img" aria-label={`UPI QR · ${upi}`} className="size-[168px] shrink-0 rounded-2xl bg-white p-3" dangerouslySetInnerHTML={{ __html: qr }} />}
                <div className="flex min-w-0 flex-col gap-2">
                  <a href={upiLink} className="pill self-start rounded-full bg-ink px-6 py-3 font-semibold text-stone no-underline">{t('sup.upi')} →</a>
                  <span className="font-mono text-[15px] break-all">{upi}</span>
                  <span className="text-[13px] opacity-75">{t('sup.upiHint')}</span>
                </div>
              </div>
            )}
            {url && <a href={url} target="_blank" rel="noreferrer" className="pill self-start rounded-full border border-ink/30 px-6 py-3 font-semibold no-underline">{t('sup.give')} ↗</a>}
            <p className="m-0 mt-auto text-[13px] leading-relaxed opacity-75">{t('sup.costs')}</p>
          </section>
          <section aria-labelledby="ways" className="flex min-w-0 flex-col gap-3 rounded-[26px] border border-ink/12 bg-paper p-[clamp(20px,2.4vw,32px)]">
            <h2 id="ways" className="disp m-0 text-[28px] font-extrabold">{t('sup.other')}</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {ways.map((w) => (
                <li key={w.t} className="rounded-2xl border border-ink/12 px-4 py-3 text-[15px] leading-relaxed">
                  {w.href ? <a href={w.href} {...(w.href.startsWith('/') ? {} : { target: '_blank', rel: 'noreferrer' })} className="underline-offset-4 hover:underline">{w.t} ↗</a> : w.t}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
