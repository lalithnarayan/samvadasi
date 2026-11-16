/** URL of a preview / share card image (api/card.py). Text should already be in the lipi to show. */
export function cardUrl(o: { t: string; s?: string; k?: string; c?: 'u' | 'm' | 'p'; f?: 'og' | 'sq' }) {
  const q = new URLSearchParams({ t: o.t })
  if (o.s) q.set('s', o.s)
  if (o.k) q.set('k', o.k)
  if (o.c) q.set('c', o.c)
  if (o.f) q.set('f', o.f)
  return `/api/card?${q.toString()}`
}
