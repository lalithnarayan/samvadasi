'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Step = { sutra: string; source: string; result: string }

/** "How is it built?" — asks Vidyut for the sūtra-by-sūtra derivation of one form. */
export function Derivation({ form, req }: { form: string; req: Record<string, unknown> }) {
  const [steps, setSteps] = useState<Step[] | null>(null)
  const [err, setErr] = useState('')
  const load = () => {
    if (steps) return
    fetch('/api/grammar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'derive', ...req }) })
      .then((r) => r.json())
      .then((d) => { const m = (d.derivations || []).find((x: { form: string }) => x.form === form) || d.derivations?.[0]; m ? setSteps(m.steps) : setErr(d.error || 'No derivation found') })
      .catch(() => setErr('The grammar service is not running.'))
  }
  return (
    <Dialog onOpenChange={(o) => o && load()}>
      <DialogTrigger asChild>
        <button className="text-[11px] font-semibold underline decoration-dotted underline-offset-2 opacity-60 hover:opacity-100" aria-label={`How is ${form} built?`}>how?</button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto bg-paper sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sk text-3xl">{form}</DialogTitle>
          <DialogDescription>Built step by step with Pāṇini’s sūtras, as derived by Vidyut.</DialogDescription>
        </DialogHeader>
        {err && <p className="text-sm">{err}</p>}
        {!steps && !err && <p className="text-sm opacity-70">Deriving…</p>}
        {steps && (
          <ol className="flex flex-col gap-1.5">
            {steps.map((s, i) => (
              <li key={i} className="flex items-baseline gap-3 border-b border-ink/10 pb-1.5">
                <span className="w-16 shrink-0 font-mono text-xs opacity-70">{s.sutra}</span>
                <span className="font-sk text-lg">{s.result}</span>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}
