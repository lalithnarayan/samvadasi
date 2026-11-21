import 'server-only'
import en from './dict/en'
import te from './dict/te'
import kn from './dict/kn'
import ta from './dict/ta'
import type { Dict, Lang } from '.'

/** The strings a server-rendered page hands to the browser: its own language only. */
export const dictFor = (lang: Lang): Dict => ({ en, te, kn, ta })[lang]
