'use client'
import { useSyncExternalStore } from 'react'

/**
 * One way to keep small things in the browser (practice progress, script level, text size).
 * Components read with `useStored`, which re-renders every reader when any of them writes, works
 * during server rendering (returns the fallback) and never sets state inside an effect.
 */
const listeners = new Map<string, Set<() => void>>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

function rawOf(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

export function readStored<T>(key: string, parse: (raw: string | null) => T): T {
  const raw = rawOf(key), hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value as T
  const value = parse(raw)
  cache.set(key, { raw, value })
  return value
}

export function writeStored(key: string, value: unknown) {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)) } catch { /* private mode or full */ }
  listeners.get(key)?.forEach((f) => f())
}

function subscribe(key: string, f: () => void) {
  const set = listeners.get(key) ?? new Set()
  set.add(f); listeners.set(key, set)
  const onStorage = (e: StorageEvent) => { if (e.key === key) f() } // another tab wrote
  window.addEventListener('storage', onStorage)
  return () => { set.delete(f); window.removeEventListener('storage', onStorage) }
}

export function useStored<T>(key: string, parse: (raw: string | null) => T, server: T): T {
  return useSyncExternalStore((f) => subscribe(key, f), () => readStored(key, parse), () => server)
}

/** Parse JSON, falling back on anything unreadable. */
export const json = <T,>(fallback: T) => (raw: string | null): T => {
  try { const v = raw ? JSON.parse(raw) : null; return v && typeof v === 'object' ? { ...fallback, ...v } : fallback } catch { return fallback }
}

/** True in the browser after hydration, false on the server — without an effect. */
export const useIsClient = () => useSyncExternalStore(() => () => {}, () => true, () => false)
