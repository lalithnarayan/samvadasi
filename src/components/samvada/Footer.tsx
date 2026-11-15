import { Wordmark } from './Wordmark'

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-charcoal text-chalk">
      <div className="wrap flex flex-wrap gap-x-8 gap-y-2 pt-7 pb-2 text-[13px] leading-relaxed text-[#B9B2A6]">
        <span>संवदसि (saṃvadasi) means “you converse”.</span>
        <span>Forms generated and verified with <a className="underline" href="https://github.com/ambuda-org/vidyut">Vidyut</a> by Ambuda.</span>
        <span>Set in Rozha One, Noto Serif, Bricolage Grotesque and Instrument Sans.</span>
        <span>Free and open source · samavada.si</span>
      </div>
      <div aria-hidden className="wrap -mb-[0.3em] text-[clamp(120px,26vw,380px)] leading-[1.1]"><Wordmark /></div>
    </footer>
  )
}
