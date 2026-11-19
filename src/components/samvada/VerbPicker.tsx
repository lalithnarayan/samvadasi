'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toScript } from '@/lib/grammar'
import { useSamvada } from './state'
import { loadIndex, searchLocal, type Hit } from '@/lib/verbSearch'

/**
 * Search all ~2,400 dhatus by English, Devanagari, Dhātupāṭha meaning or number. Results come
 * from an index in the browser at once; a server lookup (cached at the edge) adds verbs found by
 * a conjugated form, such as "gacchati". A slower, older answer never replaces a newer one.
 */
export function VerbPicker({ current }: { current: string }) {
  const router = useRouter()
  const { query, t, sc, base } = useSamvada()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [busy, setBusy] = useState(false)
  const cache = useRef(new Map<string, Hit[]>())
  useEffect(() => {
    if (!open) return
    let live = true
    const ctl = new AbortController()
    const key = q.trim()
    loadIndex().then((rows) => { if (live) setHits((prev) => (cache.current.get(key) || (rows.length ? searchLocal(rows, key) : prev))) })
    if (!key || cache.current.has(key)) return () => { live = false }
    const timer = setTimeout(() => {
      setBusy(true)
      fetch('/search?q=' + encodeURIComponent(key), { signal: ctl.signal }).then((r) => r.json()).then(async (server: Hit[]) => {
        const local = searchLocal(await loadIndex(), key)
        const merged = [...server, ...local.filter((h) => !server.some((x) => x.slug === h.slug))].slice(0, 20)
        cache.current.set(key, merged)
        if (live) setHits(merged)
      }).catch(() => {}).finally(() => { if (live) setBusy(false) })
    }, 220)
    return () => { live = false; clearTimeout(timer); ctl.abort() }
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
          <CommandInput placeholder={t('v.searchPh')} value={q} onValueChange={setQ} aria-busy={busy} />
          <CommandList>
            <CommandEmpty>{busy ? '…' : t('vb.noFound')}</CommandEmpty>
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
