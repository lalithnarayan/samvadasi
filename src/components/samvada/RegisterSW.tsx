'use client'
import { useEffect } from 'react'

/** Registers the offline service worker (production only, so local development stays fresh). */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    const go = () => navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((r) => r.update()).catch(() => {})
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true })
  }, [])
  return null
}
