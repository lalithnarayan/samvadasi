import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(__dirname, '../..')
const read = (p: string) => JSON.parse(readFileSync(path.join(root, p), 'utf8'))

describe('/api/grammar verb index', () => {
  it('lists exactly the generated verbs (run `python3 scripts/vidyut/build_api_index.py`)', () => {
    const generated = (read('data/generated/dhatus.json').dhatus as { slug: string; aupadeshika: string; gana: number | string }[])
    const index = read('api/_data/verbs.json') as Record<string, [string, number, string[]]>
    expect(Object.keys(index).length).toBe(generated.length)
    for (const d of generated) expect(index[d.slug]?.slice(0, 2), d.slug).toEqual([d.aupadeshika, Number(d.gana)])
  })
})
