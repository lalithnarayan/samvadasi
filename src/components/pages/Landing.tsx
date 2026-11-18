'use client'
import Link from 'next/link'
import { useLayoutEffect, useRef, useState, type DependencyList } from 'react'
import { cellFor, splitScript, iast, joinWords, ktaCell, subject, tinCell, toScript, type DhatuLite, type PersonId, type Num } from '@/lib/grammar'
import { genderWordsIn, meaningOf, sentence, type UIKey } from '@/lib/i18n'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { Word } from '@/components/samvada/Word'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Dock } from '@/components/samvada/Dock'
import { Footer } from '@/components/samvada/Footer'
import { Speak } from '@/components/samvada/Speak'
import type { SubhLite } from '@/lib/data'
import { pick } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const GO = { base: 'go', third: 'goes', past: 'went', tail: '' }
const SLIDE = [[6, 'अहम्', 'I go'], [7, 'आवाम्', 'we two go'], [8, 'वयम्', 'we go'], [3, 'त्वम्', 'you go'], [4, 'युवाम्', 'you two go'], [5, 'यूयम्', 'you all go'], [0, 'सः', 'he goes'], [1, 'तौ', 'they two go'], [2, 'ते', 'they go']] as const
/** Shrinks a one-line (nowrap) element until it fits its column — glyph widths differ a lot between lipis. */
function useFit<T extends HTMLElement>(deps: DependencyList) {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const run = () => {
      el.style.fontSize = el.dataset.fs || ''
      const r = el.clientWidth / el.scrollWidth
      if (r < 1) el.style.fontSize = parseFloat(getComputedStyle(el).fontSize) * r * 0.97 + 'px'
    }
    run()
    const ro = new ResizeObserver(run)
    if (el.parentElement) ro.observe(el.parentElement)
    document.fonts?.ready.then(run)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}
const colorOf = (i: number) => (i >= 6 ? 'u' : i >= 3 ? 'm' : 'p') as 'u' | 'm' | 'p'
const MANNERS = [
  { id: 'friend', label: 'l.mFriend', pron: 'त्वं', idx: 3, c: 'm' as const, note: '“You go.” Ending for you.', s: ['m', 'm'], end: 'l.endYou' },
  { id: 'sir', label: 'l.mSir', pron: 'भवान्', idx: 0, c: 'p' as const, note: '“You go, sir.” Ending for he/she.', s: ['r', 'm'], end: 'l.endHe' },
  { id: 'madam', label: 'l.mMadam', pron: 'भवती', idx: 0, c: 'p' as const, note: '“You go, madam.” Same ending.', s: ['r', 'f'], end: 'l.endSame' },
] as const
// slider index → person and number (SLIDE order: I, we two, we, you, you two, you all, he, they two, they)
const SLIDE_SUBJ: [PersonId, Num][] = [['u', 0], ['u', 1], ['u', 2], ['m', 0], ['m', 1], ['m', 2], ['p', 0], ['p', 1], ['p', 2]]

function Seg<T extends string>({ items, value, onPick, label }: { items: { id: T; label: string }[]; value: T; onPick: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="seg self-start flex-wrap">
      {items.map((x) => (
        <button key={x.id} aria-pressed={x.id === value} onClick={() => onPick(x.id)} className={cn('pill min-h-[46px] rounded-full px-5 text-[15px] font-semibold', x.id === value && 'bg-ink text-stone')}>{x.label}</button>
      ))}
    </div>
  )
}

export function LandingClient({ gam, tiles, total, featuredCount, verse }: { gam: DhatuLite; tiles: { root: string; meaning_en: string; artha_sa: string; slug: string }[]; total: number; featuredCount: number; verse?: SubhLite }) {
  const { subj, when, sc, tr, query, t, lang, base } = useSamvada()
  const line = (s: ReturnType<typeof subject>, w: Parameters<typeof sentence>[2]) => sentence(lang, s, w, GO).replace(/[.!]$/, '')
  const [slide, setSlide] = useState(0)
  const [order, setOrder] = useState<'en' | 'sa'>('en')
  const [manner, setManner] = useState('friend')
  const [g4, setG4] = useState<'m' | 'f'>('m')
  const [slideKey, setSlideKey] = useState(0)

  const cell = cellFor(gam, when, subj)
  const words = joinWords([subj.sk, cell?.form || ''])
  const emDeva = Math.max(1.5, [...(cell?.form || '')].reduce((a, c) => a + ('ािीोौः'.includes(c) ? 0.36 : c === '्' ? -0.3 : 'ुूृेैं'.includes(c) ? 0 : 0.72), 0))
  const marquee = [0, 3, 6, 2, 5, 8].map((i) => toScript(tinCell(gam, when === 'kta' ? 'lat' : when, i)?.form || '', sc)).join('  ·  ') + '  ·  '

  const sl = SLIDE[slide], slc = colorOf(sl[0]), slCell = tinCell(gam, 'lat', sl[0])
  const M = MANNERS.find((m) => m.id === manner)!, mCell = tinCell(gam, 'lat', M.idx)
  const en = lang === 'en'
  const g4rows = [
    { pron: g4 === 'm' ? 'सः' : 'सा', cell: tinCell(gam, 'lat', 0), en: en ? (g4 === 'm' ? 'He goes.' : 'She goes.') : line(subject('p', 0, g4), 'lat') + '.', tag: t('l.tag1'), c: 'p' as const },
    { pron: g4 === 'm' ? 'सः' : 'सा', cell: ktaCell(gam, g4, 0), en: en ? (g4 === 'm' ? 'He went.' : 'She went.') : line(subject('p', 0, g4), 'kta') + '.', tag: t('l.tag2'), c: 'm' as const },
    { pron: 'अहम्', cell: ktaCell(gam, g4, 0), en: en ? (g4 === 'm' ? 'I went (a man).' : 'I went (a woman).') : `${line(subject('u', 0, g4), 'kta')} (${genderWordsIn(lang, g4, 0)}).`, tag: t('l.tag3'), c: 'u' as const },
  ]
  const slideLabel = en ? sl[2] : line(subject(SLIDE_SUBJ[slide][0], SLIDE_SUBJ[slide][1], 'm'), 'lat')
  const mannerNote = en ? M.note : `“${line(subject(M.s[0], 0, M.s[1]), 'lat')}.” ${t(M.end)}`
  const heroRef = useFit<HTMLParagraphElement>([cell?.form, sc, emDeva])
  const slideRef = useFit<HTMLParagraphElement>([slCell?.form, sc])
  const mannerRef = useFit<HTMLParagraphElement>([mCell?.form, M.pron, sc])
  const ord = order === 'en' ? ['u', 'm', 'p'] : ['p', 'm', 'u']

  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="outline-none">
      <section aria-label={t('l.eyebrow')} className="relative flex min-h-[calc(100vh-220px)] flex-col justify-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[8%] opacity-[0.08]">
          <div className="marq">
            {[0, 1].map((k) => <span key={k} className="whitespace-nowrap pr-16 text-[clamp(90px,14vw,210px)] leading-[1.3] text-transparent [-webkit-text-stroke:1px_currentColor]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})` }}>{marquee}</span>)}
          </div>
        </div>
        <div className="wrap relative flex w-full flex-col gap-1.5 pt-6 pb-10">
          <span className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('l.eyebrow')}</span>
          <h1 className="disp hero-t m-0 max-w-[560px] text-[clamp(22px,2.4vw,30px)] leading-tight font-semibold">{t('l.h1')}</h1>
          {cell && <p aria-live="polite" className="m-0 whitespace-nowrap leading-[1.32]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})`, fontSize: `min(280px, calc(88vw / ${emDeva.toFixed(2)}))` }} data-fs={`min(280px, calc(88vw / ${emDeva.toFixed(2)}))`} ref={heroRef}>
            <Word stem={cell.stem} end={cell.end} color={DEEP[subj.color]} />
          </p>}
          <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1">
            <span className="font-sk text-[clamp(22px,2.4vw,32px)] font-semibold" style={{ fontFamily: `var(--font-sk-${sc})` }}>{toScript(words.join(' '), sc)}</span>
            <span className="disp text-[clamp(20px,2.2vw,30px)]">“{line(subj, when)}”</span>
            {tr && <span className="text-[15px] italic opacity-75">{iast(words.join(' '))}</span>}
          </div>
          {cell?.also.length ? <p className="m-0 text-sm opacity-80">{t('l.alsoSaid')}: {cell.also.map((a) => `${toScript(a.form, sc)} (${t(`lbl.${a.label}` as UIKey)})`).join(', ')}</p> : null}
          <p className="mt-3.5 mb-0 text-[15px] opacity-80">{t('l.useBar')}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={base + '/today' + query} className="pill disp flex min-h-[56px] items-center rounded-full bg-ink px-8 text-lg font-bold text-stone no-underline">{t('l.todayCta')} →</Link>
            <span className="text-[14px] opacity-80">{t('l.todaySub')}</span>
          </div>
        </div>
        <svg className="spin absolute top-[14%] right-[clamp(20px,6vw,120px)] hidden size-[140px] sm:block" aria-hidden viewBox="0 0 200 200" style={{ color: DEEP[subj.color] }}>
          <defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <text className="disp" style={{ fontSize: 16, fontWeight: 800, letterSpacing: 3, fill: 'currentColor' }}><textPath href="#circ">{t('l.spin')}</textPath></text>
        </svg>
      </section>

      <section aria-labelledby="s1" className="border-t border-ink/12 py-[clamp(72px,10vw,140px)] transition-colors duration-500" style={{ background: TINT[slc] }}>
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-2">
          <div className="reveal flex flex-col gap-[18px]">
            <span className="eyebrow" style={{ color: DEEP[slc] }}>{t('l.s1e')}</span>
            <h2 id="s1" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">{t('l.s1h')}</h2>
            <p className="m-0 max-w-[460px] text-lg leading-relaxed">{t('l.s1a')} <span style={{ fontFamily: `var(--font-sk-${sc})` }}>{toScript('गच्छ', sc)}</span> {t('l.s1b')}</p>
          </div>
          <div className="reveal flex flex-col gap-2.5" style={{ color: DEEP[slc] }}>
            <p lang="sa" className="m-0 whitespace-nowrap leading-[1.3] text-ink" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})`, fontSize: 'clamp(76px,10vw,156px)' }} data-fs="clamp(76px,10vw,156px)" ref={slideRef}>
              {splitScript(slCell?.stem || '', slCell?.end || '', sc)[0]}<span key={slideKey} className="ending" style={{ color: DEEP[slc] }}>{splitScript(slCell?.stem || '', slCell?.end || '', sc)[1]}</span>
            </p>
            <span className="disp text-[clamp(22px,2.6vw,34px)] font-semibold text-ink"><span className="font-sk">{toScript(sl[1], sc)}</span> — “{slideLabel}”</span>
            <label htmlFor="scrub" className="sr-only">{t('l.choose')}</label>
            <input id="scrub" className="rng" type="range" min={0} max={8} step={1} value={slide} onChange={(e) => { setSlide(Number(e.target.value)); setSlideKey((k) => k + 1) }} />
            <div className="flex justify-between text-[13px] font-bold">{(['l.sI', 'l.sWe', 'l.sYou', 'l.sYouAll', 'l.sHe', 'l.sThey'] as const).map((k) => <span key={k}>{t(k)}</span>)}</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="s2" className="border-t border-ink/12 bg-stone py-[clamp(72px,10vw,140px)]">
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-2">
          <div className="reveal flex flex-col gap-[18px]">
            <span className="eyebrow">{t('l.s2e')}</span>
            <h2 id="s2" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">{t('l.s2h')}</h2>
            <p className="m-0 max-w-[460px] text-lg leading-relaxed"><span style={{ fontFamily: `var(--font-sk-${sc})` }}>{toScript('प्रथम', sc)}</span> {t('l.s2p')}</p>
            <Seg label={t('l.order')} value={order} onPick={setOrder} items={[{ id: 'en', label: t('l.enOrder') }, { id: 'sa', label: t('l.saOrder') }]} />
          </div>
          <div className="reveal relative h-[336px]">
            {(['u', 'm', 'p'] as const).map((k) => {
              const pos = ord.indexOf(k), base = { u: 6, m: 3, p: 0 }[k]
              return (
                <div key={k} className="bar-move absolute inset-x-0 flex h-[100px] items-center gap-[18px] rounded-[20px] border px-6" style={{ top: pos * 118, borderColor: DEEP[k], background: TINT[k] }}>
                  <span className="disp w-12 text-[52px] font-extrabold" style={{ color: DEEP[k] }}>{pos + 1}</span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-2xl font-bold" style={{ fontFamily: `var(--font-sk-${sc})` }}>{order === 'sa' ? toScript({ u: 'उत्तमपुरुषः', m: 'मध्यमपुरुषः', p: 'प्रथमपुरुषः' }[k], sc) : t(({ u: 'l.cU', m: 'l.cM', p: 'l.cP' } as const)[k])}</span>
                    <span className="disp text-[17px] font-semibold">{t(order === 'sa' ? ({ u: 'l.cU', m: 'l.cM', p: 'l.cP' } as const)[k] : ({ u: 'l.p1', m: 'l.p2', p: 'l.p3' } as const)[k])}</span>
                  </span>
                  <span className="flex-1" />
                  <span lang="sa" className="hidden text-[32px] sm:inline" style={{ fontFamily: 'var(--font-display)', color: DEEP[k] }}>{toScript(tinCell(gam, 'lat', base)?.form || '', sc)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="s3" className="border-t border-ink/12 py-[clamp(72px,10vw,140px)] transition-colors duration-500" style={{ background: TINT[M.c] }}>
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-2">
          <div className="reveal flex flex-col gap-[18px]">
            <span className="eyebrow" style={{ color: DEEP[M.c] }}>{t('l.s3e')}</span>
            <h2 id="s3" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">{t('l.s3h')}</h2>
            <Seg label={t('l.talking')} value={manner} onPick={setManner} items={MANNERS.map((m) => ({ id: m.id as string, label: t(m.label) }))} />
          </div>
          <div className="reveal flex flex-col gap-2">
            <p lang="sa" className="m-0 whitespace-nowrap leading-[1.3]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})`, fontSize: 'clamp(60px,8.4vw,132px)' }} data-fs="clamp(60px,8.4vw,132px)" ref={mannerRef}>
              {toScript(M.pron, sc)} {splitScript(mCell?.stem || '', mCell?.end || '', sc)[0]}<span key={manner} className="ending" style={{ color: DEEP[M.c] }}>{splitScript(mCell?.stem || '', mCell?.end || '', sc)[1]}</span>
            </p>
            <span className="disp text-[clamp(20px,2.4vw,30px)] font-semibold">{mannerNote}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="s4" className="border-t border-ink/12 bg-stone py-[clamp(72px,10vw,140px)]">
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-2">
          <div className="reveal flex flex-col gap-[18px]">
            <span className="eyebrow">{t('l.s4e')}</span>
            <h2 id="s4" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">{t('l.s4h')}</h2>
            <p className="m-0 max-w-[460px] text-lg leading-relaxed">{t('l.s4a')}<span style={{ fontFamily: `var(--font-sk-${sc})` }}>{toScript('-तवान् / -तवती', sc)}</span>{t('l.s4b')}</p>
            <Seg label={t('dock.gender')} value={g4} onPick={setG4} items={[{ id: 'm', label: t('l.masc') }, { id: 'f', label: t('l.fem') }]} />
          </div>
          <div className="reveal flex flex-col gap-1">
            {g4rows.map((r, i) => (
              <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0 border-b border-ink/14 py-1.5">
                <span lang="sa" className="font-sk leading-[1.55] font-semibold" style={{ fontFamily: `var(--font-sk-${sc})`, fontSize: sc === 'taml' ? 'clamp(24px,3vw,44px)' : 'clamp(30px,3.6vw,52px)' }}>
                  {toScript(joinWords([r.pron, r.cell?.form || ''])[0], sc)} {splitScript(r.cell?.stem || '', r.cell?.end || '', sc)[0]}<span key={g4} className="ending" style={{ color: DEEP[r.c] }}>{splitScript(r.cell?.stem || '', r.cell?.end || '', sc)[1]}</span>
                </span>
                <span className="text-right text-sm font-semibold">{r.en}<br /><span className="font-normal opacity-80">{r.tag}</span></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {verse && (
        <section aria-labelledby="sv" className="border-t border-ink/12 bg-stone py-[clamp(56px,8vw,110px)]">
          <div className="wrap flex flex-col gap-3">
            <span id="sv" className="eyebrow" style={{ color: DEEP[subj.color] }}>{t('sb.today')}</span>
            <p lang="sa" className="m-0 text-[clamp(19px,3.6vw,52px)] leading-[1.6] font-semibold whitespace-pre-line [overflow-wrap:anywhere]" style={{ fontFamily: `var(--font-sk-${sc})` }}>{toScript(verse.text, sc)}</p>
            <p className="disp m-0 max-w-[860px] text-[clamp(18px,1.7vw,24px)] font-semibold">{pick(lang, verse.meaning)}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Speak text={verse.text} />
              <Link href={base + `/subhashita/${verse.slug}${query}`} className="pill rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-stone no-underline">{t('sb.read')} →</Link>
              <Link href={base + '/subhashitas' + query} className="text-[14px] font-semibold underline-offset-4 hover:underline">{t('sb.all')}</Link>
            </div>
          </div>
        </section>
      )}
      <section aria-labelledby="s5" className="bg-charcoal pt-[clamp(72px,10vw,140px)] pb-[clamp(48px,6vw,80px)] text-chalk">
        <div className="wrap flex flex-col gap-9">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <h2 id="s5" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">{t('l.verbsN', { n: total.toLocaleString('en-IN') })}<br />{t('l.one')}</h2>
            <Link href={base + '/verbs' + query} className="disp flex min-h-11 items-center text-[19px] font-bold">{t('l.seeEveryday', { n: featuredCount })}</Link>
          </div>
          <div className="reveal flex flex-wrap gap-2.5">
            {tiles.map((v, i) => (
              <Link key={v.slug} href={base + `/verb/${v.slug}${query}`} className={`tile c${i % 3} flex items-baseline gap-2.5 rounded-full border border-[#5A554D] px-[18px] py-2.5 no-underline`}>
                <span className="font-sk text-[21px] font-semibold">{toScript(v.root, sc)}</span><span className="text-sm">{meaningOf(v, lang, sc).main}</span>
              </Link>
            ))}
          </div>
          <nav aria-labelledby="s5" className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/phrases', n: '01', t: t('nav.phrases'), d: t('c.phrases'), bg: 'var(--color-u-tint)', c: 'var(--color-u-deep)', fg: 'var(--color-ink)' },
              { href: '/verbs', n: '02', t: t('nav.verbs'), d: t('c.verbs'), bg: 'var(--color-m-tint)', c: 'var(--color-m-deep)', fg: 'var(--color-ink)' },
              { href: '/verb/01.1137', n: '03', t: t('nav.oneVerb'), d: t('c.one'), bg: 'var(--color-p-tint)', c: 'var(--color-p-deep)', fg: 'var(--color-ink)' },
              { href: '/practice', n: '04', t: t('nav.practice'), d: t('c.practice'), bg: '#3A3631', c: 'var(--color-chalk)', fg: 'var(--color-chalk)' },
              { href: '/nouns', n: '05', t: t('nav.nouns'), d: t('c.nouns'), bg: 'var(--color-m-tint)', c: 'var(--color-m-deep)', fg: 'var(--color-ink)' },
              { href: '/build', n: '06', t: t('nav.build'), d: t('c.build'), bg: 'var(--color-p-tint)', c: 'var(--color-p-deep)', fg: 'var(--color-ink)' },
              { href: '/packs', n: '07', t: t('nav.packs'), d: t('c.packs'), bg: 'var(--color-u-tint)', c: 'var(--color-u-deep)', fg: 'var(--color-ink)' },
              { href: '/greetings', n: '08', t: t('nav.greetings'), d: t('c.greet'), bg: '#3A3631', c: 'var(--color-chalk)', fg: 'var(--color-chalk)' },
            ].map((c) => (
              <Link key={c.href} href={base + c.href + query} className="lift flex min-h-[240px] flex-col justify-between rounded-[26px] border border-transparent p-[26px] no-underline" style={{ background: c.bg, color: c.fg }}>
                <span className="eyebrow" style={{ color: c.c }}>{c.n}</span>
                <span className="flex flex-col gap-2"><span className="disp card-t text-[38px] leading-none font-extrabold">{c.t}</span><span className="text-[15px] leading-snug">{c.d}</span></span>
                <span className="arr self-end text-[30px] [transform:rotate(-45deg)]" aria-hidden>→</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
      </main>
      <Footer />
      <Dock />
    </>
  )
}
