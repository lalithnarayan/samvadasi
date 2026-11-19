// Shared by the server lookup and the in-browser verb search.
/**
 * Loose spelling key, the same for a Devanagari form (via IAST) and for what someone types:
 * gacchati, gachchati, gachhati, gacChati (Harvard-Kyoto), gaccati all → "gacati".
 */
export function loose(s: string): string {
  let t = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  t = t.replace(/x/g, 'ks').replace(/w/g, 'v').replace(/z/g, 's')
  t = t.replace(/c+h+/g, 'c').replace(/ch/g, 'c').replace(/sh/g, 's').replace(/([kgjtdpb])h/g, '$1')
  t = t.replace(/([^aeiou])r[iu](?=[^aeiou]|$)/g, '$1r')
  t = t.replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/ai/g, 'e').replace(/au/g, 'o')
  t = t.replace(/(.)\1+/g, '$1').replace(/[^a-z]/g, '')
  return t.replace(/h$/, '')
}
