import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'संवदसि · Samvadasi',
    short_name: 'संवदसि',
    description: 'Speak Sanskrit by changing just the ending.',
    start_url: '/?source=app',
    display: 'standalone',
    background_color: '#F4F1EB',
    theme_color: '#F4F1EB',
    lang: 'en',
    categories: ['education', 'books'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
