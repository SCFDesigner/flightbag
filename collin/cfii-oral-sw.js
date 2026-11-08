// Offline cache for CFII Oral Prep (collin/cfii-oral.html). Network first, cache fallback.
const CACHE = 'cfii-oral-v2';
const FILES = ['cfii-oral.html', 'cfii-oral-data.js', '../theme/flightbag-theme.css', '../theme/flightbag-theme.js', '../icons/favicon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cfii-oral-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (!FILES.some(f => u.pathname.endsWith(f.replace('../', '/')))) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
