// Vocery Lightweight Service Worker (PWA Enabled, Zero-Stale Cache)
const CACHE_NAME = 'vocery-v6.1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first pass-through so updates are always live and immediate
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
