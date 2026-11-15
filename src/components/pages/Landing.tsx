'use client'
import Link from 'next/link'
import { useState } from 'react'
import { cellFor, englishLine, iast, joinWords, ktaCell, subject, tinCell, toScript, type DhatuLite } from '@/lib/grammar'
import { DEEP, TINT, useSamvada } from '@/components/samvada/state'
import { Word } from '@/components/samvada/Word'
import { SiteNav } from '@/components/samvada/SiteNav'
import { Dock } from '@/components/samvada/Dock'
import { Footer } from '@/components/samvada/Footer'
import { cn } from '@/lib/utils'

const GO = { base: 'go', third: 'goes', past: 'went', tail: '' }
const SLIDE = [[6, 'अहम्', 'I go'], [7, 'आवाम्', 'we two go'], [8, 'वयम्', 'we go'], [3, 'त्वम्', 'you go'], [4, 'युवाम्', 'you two go'], [5, 'यूयम्', 'you all go'], [0, 'सः', 'he goes'], [1, 'तौ', 'they two go'], [2, 'ते', 'they go']] as const
const colorOf = (i: number) => (i >= 6 ? 'u' : i >= 3 ? 'm' : 'p') as 'u' | 'm' | 'p'
const MANNERS = [
  { id: 'friend', label: 'To a friend', pron: 'त्वं', idx: 3, c: 'm' as const, note: '“You go.” Ending for you.' },
  { id: 'sir', label: 'To a sir', pron: 'भवान्', idx: 0, c: 'p' as const, note: '“You go, sir.” Ending for he/she.' },
  { id: 'madam', label: 'To a madam', pron: 'भवती', idx: 0, c: 'p' as const, note: '“You go, madam.” Same ending.' },
]

function Seg<T extends string>({ items, value, onPick, label }: { items: { id: T; label: string }[]; value: T; onPick: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="seg self-start flex-wrap">
      {items.map((x) => (
        <button key={x.id} aria-pressed={x.id === value} onClick={() => onPick(x.id)} className={cn('pill min-h-[46px] rounded-full px-5 text-[15px] font-semibold', x.id === value && 'bg-ink text-stone')}>{x.label}</button>
      ))}
    </div>
  )
}

export function LandingClient({ gam, tiles, total, featuredCount }: { gam: DhatuLite; tiles: { root: string; en: string; slug: string }[]; total: number; featuredCount: number }) {
  const { subj, when, sc, tr, query } = useSamvada()
  const [slide, setSlide] = useState(0)
  const [order, setOrder] = useState<'en' | 'sa'>('en')
  const [manner, setManner] = useState('friend')
  const [g4, setG4] = useState<'m' | 'f'>('m')
  const [slideKey, setSlideKey] = useState(0)

  const cell = cellFor(gam, when, subj)
  const words = joinWords([subj.sk, cell?.form || ''])
  const em = Math.max(1.5, [...(cell?.form || '')].reduce((a, c) => a + ('ािीोौः'.includes(c) ? 0.36 : c === '्' ? -0.3 : 'ुूृेैं'.includes(c) ? 0 : 0.72), 0))
  const marquee = [0, 3, 6, 2, 5, 8].map((i) => toScript(tinCell(gam, when === 'kta' ? 'lat' : when, i)?.form || '', sc)).join('  ·  ') + '  ·  '

  const sl = SLIDE[slide], slc = colorOf(sl[0]), slCell = tinCell(gam, 'lat', sl[0])
  const M = MANNERS.find((m) => m.id === manner)!, mCell = tinCell(gam, 'lat', M.idx)
  const g4rows = [
    { pron: g4 === 'm' ? 'सः' : 'सा', cell: tinCell(gam, 'lat', 0), en: g4 === 'm' ? 'He goes.' : 'She goes.', tag: 'present: no change', c: 'p' as const },
    { pron: g4 === 'm' ? 'सः' : 'सा', cell: ktaCell(gam, g4, 0), en: g4 === 'm' ? 'He went.' : 'She went.', tag: 'spoken past: changes', c: 'm' as const },
    { pron: 'अहम्', cell: ktaCell(gam, g4, 0), en: g4 === 'm' ? 'I went (a man).' : 'I went (a woman).', tag: 'even for “I”', c: 'u' as const },
  ]
  const ord = order === 'en' ? ['u', 'm', 'p'] : ['p', 'm', 'u']

  return (
    <>
      <SiteNav />
      <section aria-label="Try it" className="relative flex min-h-[calc(100vh-220px)] flex-col justify-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[8%] opacity-[0.08]">
          <div className="marq">
            {[0, 1].map((k) => <span key={k} className="whitespace-nowrap pr-16 text-[clamp(90px,14vw,210px)] leading-[1.3] text-transparent [-webkit-text-stroke:1px_currentColor]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})` }}>{marquee}</span>)}
          </div>
        </div>
        <div className="wrap relative flex w-full flex-col gap-1.5 pt-6 pb-10">
          <span className="eyebrow" style={{ color: DEEP[subj.color] }}>Conversational Sanskrit</span>
          <h1 className="disp m-0 max-w-[560px] text-[clamp(22px,2.4vw,30px)] leading-tight font-semibold">Speak Sanskrit by changing just the ending.</h1>
          {cell && <p aria-live="polite" className="m-0 whitespace-nowrap leading-[1.32]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})`, fontSize: `min(280px, calc(88vw / ${em.toFixed(2)}))` }}>
            <Word stem={cell.stem} end={cell.end} color={DEEP[subj.color]} />
          </p>}
          <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1">
            <span className="font-sk text-[clamp(22px,2.4vw,32px)] font-semibold" style={{ fontFamily: `var(--font-sk-${sc})` }}>{toScript(words.join(' '), sc)}</span>
            <span className="disp text-[clamp(20px,2.2vw,30px)]">“{englishLine(subj, when, GO).replace(/\.$/, '')}”</span>
            {tr && <span className="text-[15px] italic opacity-75">{iast(words.join(' '))}</span>}
          </div>
          {cell?.also.length ? <p className="m-0 text-sm opacity-80">Also said: {cell.also.map((a) => `${toScript(a.form, sc)} (${a.label})`).join(', ')}</p> : null}
          <p className="mt-3.5 mb-0 text-[15px] opacity-80">Use the bar at the bottom. Who, how many, man or woman, and when. Watch the end of the word.</p>
        </div>
        <svg className="spin absolute top-[14%] right-[clamp(20px,6vw,120px)] hidden size-[140px] sm:block" aria-hidden viewBox="0 0 200 200" style={{ color: DEEP[subj.color] }}>
          <defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <text className="disp" style={{ fontSize: 16, fontWeight: 800, letterSpacing: 3, fill: 'currentColor' }}><textPath href="#circ">TAP BELOW · WATCH THE ENDING · </textPath></text>
        </svg>
      </section>

      <section aria-labelledby="s1" className="border-t border-ink/12 py-[clamp(72px,10vw,140px)] transition-colors duration-500" style={{ background: TINT[slc] }}>
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-2">
          <div className="reveal flex flex-col gap-[18px]">
            <span className="eyebrow" style={{ color: DEEP[slc] }}>01 — the trick</span>
            <h2 id="s1" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">The stem stays. The ending moves.</h2>
            <p className="m-0 max-w-[460px] text-lg leading-relaxed">Drag through all nine people. <span className="font-sk">गच्छ</span> never changes. Only the last syllable does.</p>
          </div>
          <div className="reveal flex flex-col gap-2.5" style={{ color: DEEP[slc] }}>
            <p lang="sa" className="m-0 whitespace-nowrap text-[clamp(76px,10vw,156px)] leading-[1.3] text-ink" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})` }}>
              {toScript(slCell?.stem || '', sc)}<span key={slideKey} className="ending" style={{ color: DEEP[slc] }}>{toScript(slCell?.end || '', sc)}</span>
            </p>
            <span className="disp text-[clamp(22px,2.6vw,34px)] font-semibold text-ink"><span className="font-sk">{toScript(sl[1], sc)}</span> — “{sl[2]}”</span>
            <label htmlFor="scrub" className="sr-only">Choose the person</label>
            <input id="scrub" className="rng" type="range" min={0} max={8} step={1} value={slide} onChange={(e) => { setSlide(Number(e.target.value)); setSlideKey((k) => k + 1) }} />
            <div className="flex justify-between text-[13px] font-bold"><span>I</span><span>we</span><span>you</span><span>you all</span><span>he</span><span>they</span></div>
          </div>
        </div>
      </section>

      <section aria-labelledby="s2" className="border-t border-ink/12 bg-stone py-[clamp(72px,10vw,140px)]">
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-2">
          <div className="reveal flex flex-col gap-[18px]">
            <span className="eyebrow">02 — the twist</span>
            <h2 id="s2" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">Sanskrit counts backwards.</h2>
            <p className="m-0 max-w-[460px] text-lg leading-relaxed"><span className="font-sk">प्रथम</span> means “first”, and it is he / she. Flip the order.</p>
            <Seg label="Order" value={order} onPick={setOrder} items={[{ id: 'en', label: 'English order' }, { id: 'sa', label: 'Sanskrit order' }]} />
          </div>
          <div className="reveal relative h-[336px]">
            {(['u', 'm', 'p'] as const).map((k) => {
              const pos = ord.indexOf(k), base = { u: 6, m: 3, p: 0 }[k]
              return (
                <div key={k} className="bar-move absolute inset-x-0 flex h-[100px] items-center gap-[18px] rounded-[20px] border px-6" style={{ top: pos * 118, borderColor: DEEP[k], background: TINT[k] }}>
                  <span className="disp w-12 text-[52px] font-extrabold" style={{ color: DEEP[k] }}>{pos + 1}</span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-sk text-2xl font-bold">{order === 'sa' ? { u: 'उत्तमपुरुषः', m: 'मध्यमपुरुषः', p: 'प्रथमपुरुषः' }[k] : { u: 'I, we', m: 'you', p: 'he, she' }[k]}</span>
                    <span className="disp text-[17px] font-semibold">{order === 'sa' ? { u: 'I, we', m: 'you', p: 'he, she' }[k] : { u: '1st person', m: '2nd person', p: '3rd person' }[k]}</span>
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
            <span className="eyebrow" style={{ color: DEEP[M.c] }}>03 — the manners</span>
            <h2 id="s3" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">Respectful “you” takes the he/she ending.</h2>
            <Seg label="Who are you talking to" value={manner} onPick={setManner} items={MANNERS.map((m) => ({ id: m.id, label: m.label }))} />
          </div>
          <div className="reveal flex flex-col gap-2">
            <p lang="sa" className="m-0 whitespace-nowrap text-[clamp(60px,8.4vw,132px)] leading-[1.3]" style={{ fontFamily: sc === 'deva' ? 'var(--font-display)' : `var(--font-sk-${sc})` }}>
              {toScript(M.pron, sc)} {toScript(mCell?.stem || '', sc)}<span key={manner} className="ending" style={{ color: DEEP[M.c] }}>{toScript(mCell?.end || '', sc)}</span>
            </p>
            <span className="disp text-[clamp(20px,2.4vw,30px)] font-semibold">{M.note}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="s4" className="border-t border-ink/12 bg-stone py-[clamp(72px,10vw,140px)]">
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-2">
          <div className="reveal flex flex-col gap-[18px]">
            <span className="eyebrow">04 — he or she?</span>
            <h2 id="s4" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">Only the spoken past cares.</h2>
            <p className="m-0 max-w-[460px] text-lg leading-relaxed">Most verbs ignore gender. The everyday past (<span className="font-sk">-तवान् / -तवती</span>) follows it, even when you talk about yourself.</p>
            <Seg label="Gender" value={g4} onPick={setG4} items={[{ id: 'm', label: 'Masculine' }, { id: 'f', label: 'Feminine' }]} />
          </div>
          <div className="reveal flex flex-col gap-1">
            {g4rows.map((r, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 border-b border-ink/14 py-1.5">
                <span lang="sa" className="font-sk text-[clamp(30px,3.6vw,52px)] leading-[1.55] font-semibold" style={{ fontFamily: `var(--font-sk-${sc})` }}>
                  {toScript(joinWords([r.pron, r.cell?.form || ''])[0], sc)} {toScript(r.cell?.stem || '', sc)}<span key={g4} className="ending" style={{ color: DEEP[r.c] }}>{toScript(r.cell?.end || '', sc)}</span>
                </span>
                <span className="text-right text-sm font-semibold">{r.en}<br /><span className="font-normal opacity-70">{r.tag}</span></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="s5" className="bg-charcoal pt-[clamp(72px,10vw,140px)] pb-[clamp(48px,6vw,80px)] text-chalk">
        <div className="wrap flex flex-col gap-9">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <h2 id="s5" className="disp m-0 text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold">{total.toLocaleString('en-IN')} verbs.<br />One pattern.</h2>
            <Link href={'/verbs' + query} className="disp flex min-h-11 items-center text-[19px] font-bold">See the {featuredCount} everyday ones →</Link>
          </div>
          <div className="reveal flex flex-wrap gap-2.5">
            {tiles.map((t, i) => (
              <Link key={t.slug} href={`/verb/${t.slug}${query}`} className={`tile c${i % 3} flex items-baseline gap-2.5 rounded-full border border-[#5A554D] px-[18px] py-2.5 no-underline`}>
                <span className="font-sk text-[21px] font-semibold">{toScript(t.root, sc)}</span><span className="text-sm">{t.en.replace(/^to /, '')}</span>
              </Link>
            ))}
          </div>
          <nav aria-label="The book" className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/phrases', n: '01', t: 'Phrases', d: 'Everyday sentences that change as you tap.', bg: 'var(--color-u-tint)', c: 'var(--color-u-deep)', fg: 'var(--color-ink)' },
              { href: '/verbs', n: '02', t: 'Verbs', d: 'Every dhatu on one page. Pick a tense, read across.', bg: 'var(--color-m-tint)', c: 'var(--color-m-deep)', fg: 'var(--color-ink)' },
              { href: '/verb/01.1137', n: '03', t: 'One verb', d: 'Every form of a single verb, and how Pāṇini builds it.', bg: 'var(--color-p-tint)', c: 'var(--color-p-deep)', fg: 'var(--color-ink)' },
              { href: '/practice', n: '04', t: 'Practice', d: 'Ten cards. Say each one aloud, then turn it over.', bg: '#3A3631', c: 'var(--color-chalk)', fg: 'var(--color-chalk)' },
            ].map((c) => (
              <Link key={c.href} href={c.href + query} className="lift flex min-h-[240px] flex-col justify-between rounded-[26px] border border-transparent p-[26px] no-underline" style={{ background: c.bg, color: c.fg }}>
                <span className="eyebrow" style={{ color: c.c }}>{c.n}</span>
                <span className="flex flex-col gap-2"><span className="disp text-[38px] leading-none font-extrabold">{c.t}</span><span className="text-[15px] leading-snug">{c.d}</span></span>
                <span className="arr self-end text-[30px] [transform:rotate(-45deg)]" aria-hidden>→</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <Footer />
      <Dock />
    </>
  )
}
