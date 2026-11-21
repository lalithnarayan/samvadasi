import type { JSONField } from 'payload'

/**
 * Payload's partial update (PATCH, and every save in the admin) deep-merges the stored document
 * with the incoming data, and that turns nested arrays inside a JSON field into objects keyed
 * "0", "1", "2" … — a saved noun's 8 × 3 table came back as [{ "0": ["सः"], … }], breaking the noun
 * page and the sentence builder. Every JSON field that holds arrays goes through this repair,
 * on the way in (so the database stays clean) and on the way out (so rows already damaged still work).
 */
export function restoreArrays(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(restoreArrays)
  if (v && typeof v === 'object') {
    const keys = Object.keys(v)
    if (keys.length && keys.every((k, i) => k === String(i))) return keys.map((k) => restoreArrays((v as Record<string, unknown>)[k]))
    return Object.fromEntries(keys.map((k) => [k, restoreArrays((v as Record<string, unknown>)[k])]))
  }
  return v
}

/** A JSON field whose arrays survive partial updates. */
export const jsonField = (name: string, admin: JSONField['admin'] = {}): JSONField => ({
  name, type: 'json', admin,
  hooks: { beforeChange: [({ value }) => restoreArrays(value)], afterRead: [({ value }) => restoreArrays(value)] },
})
