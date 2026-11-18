'use client'
import { track as vercelTrack } from '@vercel/analytics'

type Props = Record<string, string | number | boolean>
declare global { interface Window { umami?: { track: (name: string, data?: Props) => void } } }

/**
 * Funnel events: visit → first_practice → session_done → day2_return → streak_7.
 * Sent to Umami when it is set up, and to Vercel (custom events need a Vercel Pro plan; ignored otherwise).
 */
export function track(name: string, data?: Props) {
  try { window.umami?.track(name, data) } catch {}
  try { vercelTrack(name, data) } catch {}
}
