'use client'
import React, { useState } from 'react'
import { Button, useField, useFormFields } from '@payloadcms/ui'

type Table = Record<string, Record<string, string[][]>>
const LAKS: [string, string][] = [['lat', 'लट् present'], ['lan', 'लङ् past'], ['lrt', 'लृट् future'], ['lot', 'लोट् request'], ['vidhi', 'विधिलिङ् should'], ['lit', 'लिट्'], ['lut', 'लुट्'], ['lun', 'लुङ्'], ['ashir', 'आशीर्लिङ्'], ['lrn', 'लृङ्']]
const ROWS = ['प्रथम (he/she)', 'मध्यम (you)', 'उत्तम (I/we)']
const box: React.CSSProperties = { border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: 16, marginBottom: 20, background: 'var(--theme-elevation-0)' }

/** Generate every form with Vidyut, verify stored forms, and review them in a table. */
export function VidyutPanel() {
  const aupadeshika = useFormFields(([f]) => f.aupadeshika?.value as string)
  const gana = useFormFields(([f]) => f.gana?.value as number)
  const prefixes = useFormFields(([f]) => (f.prefixes?.value as string[]) || [])
  const forms = useField<Table>({ path: 'forms' })
  const participle = useField<any>({ path: 'participle' })
  const padas = useField<string[]>({ path: 'padas' })
  const generatedWith = useField<string>({ path: 'generatedWith' })
  const [lak, setLak] = useState('lat')
  const [pada, setPada] = useState<string>('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const table = forms.value || {}
  const ps = padas.value || []
  const p = pada && ps.includes(pada) ? pada : ps[0]

  const call = async (body: object) => {
    const r = await fetch('/api/grammar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json()
    if (!j.ok) throw new Error(j.error || 'Vidyut error')
    return j
  }
  const generate = async () => {
    if (!aupadeshika || !gana) return setMsg('Fill in the upadeśa (SLP1) and gaṇa first.')
    setBusy(true); setMsg('Generating with Vidyut…')
    try {
      const j = await call({ action: 'generate', aupadeshika, gana, prefixes })
      forms.setValue(j.forms); participle.setValue(j.participle); padas.setValue(j.padas)
      generatedWith.setValue(`${j.generatedWith} · ${new Date().toISOString().slice(0, 10)}`)
      setMsg(`Generated ${j.padas.length * 10 * 9} forms (${j.padas.join(' + ')}). Save to keep them.`)
    } catch (e: any) { setMsg('Could not generate: ' + e.message + '. Is the grammar service running (python api/grammar.py)?') }
    setBusy(false)
  }
  const verify = async () => {
    const items: object[] = []
    for (const [l, byPada] of Object.entries(table)) for (const [pd, nine] of Object.entries(byPada || {})) nine.forEach((v, idx) => v[0] && items.push({ lak: l, idx, pada: pd, form: v[0] }))
    if (!items.length) return setMsg('Nothing to verify yet — generate first.')
    setBusy(true); setMsg(`Checking ${items.length} forms…`)
    try {
      const j = await call({ action: 'verify', aupadeshika, gana, prefixes, items })
      setMsg(j.mismatched ? `${j.mismatched} of ${j.checked} forms differ from Vidyut: ` + j.mismatches.slice(0, 5).map((m: any) => `${m.lak}[${m.idx}] ${m.form} → ${m.expected.join('/')}`).join('; ') : `All ${j.checked} forms match Vidyut. A reviewer can now approve.`)
    } catch (e: any) { setMsg('Could not verify: ' + e.message) }
    setBusy(false)
  }

  const nine = table?.[lak]?.[p] || []
  return (
    <div style={box}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <strong style={{ marginRight: 8 }}>Vidyut</strong>
        <Button buttonStyle="primary" size="small" onClick={generate} disabled={busy}>Generate all forms</Button>
        <Button buttonStyle="secondary" size="small" onClick={verify} disabled={busy}>Verify stored forms</Button>
        <span style={{ opacity: 0.7, fontSize: 13 }}>{generatedWith.value}</span>
      </div>
      {msg && <p style={{ margin: '0 0 12px', fontSize: 14 }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
        {LAKS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setLak(id)} style={{ padding: '4px 10px', borderRadius: 999, border: '1px solid var(--theme-elevation-200)', background: id === lak ? 'var(--theme-elevation-800)' : 'transparent', color: id === lak ? 'var(--theme-elevation-0)' : 'inherit', cursor: 'pointer', fontSize: 13 }}>{label}</button>
        ))}
        {ps.length > 1 && ps.map((x) => (
          <button key={x} type="button" onClick={() => setPada(x)} style={{ marginLeft: 6, padding: '4px 10px', borderRadius: 999, border: '1px dashed var(--theme-elevation-300)', background: x === p ? 'var(--theme-elevation-150)' : 'transparent', cursor: 'pointer', fontSize: 13 }}>{x === 'P' ? 'परस्मैपद' : 'आत्मनेपद'}</button>
        ))}
      </div>
      {nine.length ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 18 }}>
          <thead><tr><th />{['one', 'two', 'many'].map((h) => <th key={h} style={{ textAlign: 'left', fontSize: 12, opacity: 0.7, padding: 4 }}>{h}</th>)}</tr></thead>
          <tbody>
            {ROWS.map((r, ri) => (
              <tr key={r} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                <th style={{ textAlign: 'left', fontSize: 12, padding: 6, fontWeight: 600 }}>{r}</th>
                {[0, 1, 2].map((n) => { const v = nine[ri * 3 + n] || []; return <td key={n} style={{ padding: 6 }}>{v[0] || '—'}{v.length > 1 && <div style={{ fontSize: 12, opacity: 0.65 }}>also {v.slice(1).join(', ')}</div>}</td> })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p style={{ opacity: 0.7, fontSize: 14 }}>No forms yet for this lakāra. Press “Generate all forms”.</p>}
      {participle.value && (
        <p style={{ marginTop: 12, fontSize: 15 }}>
          Spoken past (क्तवतु): <strong>{participle.value.m?.[0]?.[0]}</strong> / <strong>{participle.value.f?.[0]?.[0]}</strong> · participle stem {participle.value.kta?.[0]}-
        </p>
      )}
    </div>
  )
}
