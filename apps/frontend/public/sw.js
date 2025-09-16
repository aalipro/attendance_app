self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  clients.claim();
});
// Simple runtime cache for static assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin && (url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))) {
    e.respondWith((async () => {
      try {
        const res = await fetch(e.request);
        return res;
      } catch (err) {
        return caches.match(e.request);
      }
    })());
  }
});
