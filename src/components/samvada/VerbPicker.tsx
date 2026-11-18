'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toScript } from '@/lib/grammar'
import { useSamvada } from './state'

type Hit = { slug: string; display: string; meaning: string; gana: number; code: string }

/** Search all ~2,200 dhatus by English, Devanagari, Dhātupāṭha meaning or number. */
export function VerbPicker({ current }: { current: string }) {
  const router = useRouter()
  const { query, t, sc, base } = useSamvada()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => fetch('/search?q=' + encodeURIComponent(q)).then((r) => r.json()).then(setHits).catch(() => setHits([])), 180)
    return () => clearTimeout(t)
  }, [q, open])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="pill flex min-h-14 w-full items-center justify-between rounded-full border border-ink/25 bg-paper px-5 text-left text-[17px]">
          <span><span className="font-bold">{current}</span> <span className="opacity-75">· {t('vb.choose')}</span></span>
          <span aria-hidden>⌄</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(560px,92vw)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('v.searchPh')} value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>{t('vb.noFound')}</CommandEmpty>
            <CommandGroup>
              {hits.map((h) => (
                <CommandItem key={h.slug} value={h.slug} onSelect={() => { setOpen(false); router.push(base + `/verb/${h.slug}${query}`) }} className="flex items-baseline gap-3">
                  <span className="text-lg font-bold" style={{ fontFamily: `var(--font-sk-${sc})` }}>{toScript(h.display, sc)}</span>
                  <span className="flex-1 truncate">{h.meaning}</span>
                  <span className="text-xs opacity-75">{h.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
