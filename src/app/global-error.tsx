'use client'

/** Last resort when a root layout itself fails: no fonts or styles are guaranteed here. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F4F1EB', color: '#24211D', fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <main style={{ maxWidth: 520, padding: 24 }}>
          <title>Samvadasi</title>
          <h1 style={{ fontSize: 36, margin: '0 0 12px' }}>संवदसि is having a moment</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5 }}>The page didn&apos;t load. Trying again almost always works.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: '14px 28px', borderRadius: 999, border: 0, background: '#24211D', color: '#F4F1EB', fontSize: 17, fontWeight: 700 }}>Try again</button>
        </main>
      </body>
    </html>
  )
}
