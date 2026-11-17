'use client'
import { useMemo, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ComboOption = { value: string; label: string; sub?: string; group?: string; search?: string }

/** A dropdown you can type into: search by Sanskrit (any lipi), IAST or meaning. */
export function Combo({ id, value, onChange, options, placeholder, none, empty, font, className }: {
  id: string; value: string; onChange: (v: string) => void; options: ComboOption[]
  placeholder: string; none?: string; empty: string; font?: string; className?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const cur = options.find((o) => o.value === value)
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? options.filter((o) => `${o.label} ${o.sub || ''} ${o.search || ''}`.toLowerCase().includes(s)) : options
  }, [q, options])
  const groups = useMemo(() => {
    const m = new Map<string, ComboOption[]>()
    for (const o of shown) { const k = o.group || ''; m.set(k, [...(m.get(k) || []), o]) }
    return [...m.entries()]
  }, [shown])
  const pick = (v: string) => { onChange(v); setOpen(false); setQ('') }
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ('') }}>
      <PopoverTrigger asChild>
        <button id={id} type="button" role="combobox" aria-expanded={open} disabled={!options.length}
          className={cn('flex h-12 w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-ink/25 bg-paper px-3 text-left text-[16px] disabled:opacity-50', className)}>
          <span className="min-w-0 truncate">
            {cur ? <><span className="font-semibold" style={{ fontFamily: font }}>{cur.label}</span>{cur.sub && <span className="opacity-80"> · {cur.sub}</span>}</> : <span className="opacity-80">{none || placeholder}</span>}
          </span>
          <span aria-hidden className="shrink-0 opacity-70">⌄</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(420px,92vw)] p-0" align="start" collisionPadding={{ top: 12, bottom: 130 }}>
        <Command shouldFilter={false}>
          <CommandInput placeholder={placeholder} value={q} onValueChange={setQ} />
          <CommandList className="max-h-[min(320px,calc(var(--radix-popover-content-available-height,400px)-56px))] overscroll-contain">
            <CommandEmpty>{empty}</CommandEmpty>
            {none && !q && <CommandGroup><CommandItem value="__none" onSelect={() => pick('')} className="opacity-80">{none}</CommandItem></CommandGroup>}
            {groups.map(([gname, list]) => (
              <CommandGroup key={gname || '_'} heading={gname || undefined}>
                {list.map((o) => (
                  <CommandItem key={o.value} value={o.value} onSelect={() => pick(o.value)} className="flex items-baseline gap-2">
                    <span className="text-[17px] font-semibold" style={{ fontFamily: font }}>{o.label}</span>
                    {o.sub && <span className="truncate text-[14px] opacity-80">{o.sub}</span>}
                    {o.value === value && <span aria-hidden className="ml-auto">✓</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
