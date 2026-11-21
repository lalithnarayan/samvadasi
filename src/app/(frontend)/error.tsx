'use client'
import { ErrorView } from '@/components/samvada/ErrorView'

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) { return <ErrorView {...props} /> }
