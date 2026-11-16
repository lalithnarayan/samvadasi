import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Locally the Vidyut grammar service runs separately (npm run grammar) and VIDYUT_URL points at it.
  // On Vercel leave VIDYUT_URL unset: api/grammar.py is deployed as a Python function at the same path.
  async rewrites() {
    const url = process.env.VIDYUT_URL || (process.env.NODE_ENV === 'development' ? `http://127.0.0.1:${process.env.VIDYUT_PORT || 5328}` : '')
    const card = process.env.CARD_URL || (process.env.NODE_ENV === 'development' ? `http://127.0.0.1:${process.env.CARD_PORT || 5329}` : '')
    return [
      ...(url ? [{ source: '/api/grammar', destination: `${url}/api/grammar` }] : []),
      ...(card ? [{ source: '/api/card', destination: `${card}/api/card` }] : []),
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
