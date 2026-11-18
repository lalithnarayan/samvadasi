/* Samvadasi offline support: pages you open are kept, so they work without a connection. */
const V = 'samvada-v2'
const PRE = ['/', '/phrases', '/verbs', '/practice', '/offline', '/icons/icon-192.png']
const MAX_PAGES = 120

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(PRE)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

async function trim(c) {
  const ks = (await c.keys()).filter((r) => r.mode === 'navigate' || new URL(r.url).pathname.startsWith('/verb/'))
  for (let i = 0; i < ks.length - MAX_PAGES; i++) await c.delete(ks[i])
}

self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET') return
  const u = new URL(r.url)
  if (u.origin !== location.origin || /^\/(admin|cms-api|api)\b/.test(u.pathname)) return
  // Fonts and icons never change: cache first. Styles and scripts: always the server's copy first,
  // the cache only when offline, so a new deploy can never be shown with an old stylesheet.
  if (u.pathname.startsWith('/icons/') || /\.(woff2?|png|svg)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res })))
    return
  }
  if (u.pathname.startsWith('/_next/static/')) {
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)) } return res }).catch(() => caches.match(r).then((hit) => hit || Response.error())))
    return
  }
  if (r.mode === 'navigate' || r.headers.get('RSC')) {
    const key = r.headers.get('RSC') ? r : new Request(u.origin + u.pathname)
    e.respondWith(fetch(r).then((res) => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(key, cp).then(() => trim(c))) }
      return res
    }).catch(async () => (await caches.match(key)) || (r.mode === 'navigate' ? caches.match('/offline') : Response.error())))
  }
})
