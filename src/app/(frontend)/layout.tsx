import React from 'react'
import { Shell, baseMetadata, baseViewport } from '@/components/samvada/Shell'

export const metadata = baseMetadata
export const viewport = baseViewport

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>
}
