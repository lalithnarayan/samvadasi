import type { Metadata } from 'next'
import { OfflineClient } from '@/components/pages/Offline'

export const metadata: Metadata = { title: 'Offline', robots: { index: false } }
export default function OfflinePage() { return <OfflineClient /> }
