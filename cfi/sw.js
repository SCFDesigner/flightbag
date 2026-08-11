/* CFI Binder service worker — makes the whole binder work with no internet.
   Core files are cached on install; figures and PDFs are cached as they are
   viewed, or all at once via "Save all for offline" in Settings. */
const CACHE = 'cfi-binder-v3';
const CORE = ['./', './index.html', './custom.js', './data.js'];
// Content files change as lessons are edited — always try the network first so
// an online device picks up updates, falling back to cache when offline.
// Figures and PDFs never change once written, so those stay cache-first.
const isContent = url => /\/(index\.html|custom\.js|data\.js|manifest\.webmanifest)$/.test(url)
                      || url.endsWith('/cfi/') || url.endsWith('/');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url).pathname;

  if (req.mode === 'navigate' || isContent(url)) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true })
                       .then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;                       // figures: cached wins
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});

// "Save all for offline" — the page posts the full asset list here.
self.addEventListener('message', async e => {
  if (!e.data || e.data.type !== 'CACHE_ALL') return;
  const urls = e.data.urls || [];
  const cache = await caches.open(CACHE);
  let done = 0, failed = 0;
  for (const u of urls) {
    try {
      const hit = await cache.match(u, { ignoreSearch: true });
      if (!hit) await cache.add(u);
    } catch (err) { failed++; }
    done++;
    if (done % 10 === 0 || done === urls.length) {
      (await self.clients.matchAll()).forEach(c =>
        c.postMessage({ type: 'CACHE_PROGRESS', done, total: urls.length, failed }));
    }
  }
});
