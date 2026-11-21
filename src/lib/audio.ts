/** The key a recording or AI clip is stored under: punctuation dropped, spaces collapsed. */
export const audioKey = (s: string) => s.replace(/[।॥|?]/g, ' ').replace(/\s+/g, ' ').trim()
