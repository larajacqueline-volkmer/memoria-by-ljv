// sw.js
// Service Worker for Memoria
// Caches core assets for offline use and updates cache when version changes.

const CACHE_NAME = 'memoria-cache-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './learn.html',
  './decks.html',
  './quests.html',
  './stats.html',
  './pdf.html',
  './settings.html',
  './style.css',
  './main.js',
  './vendor/pdfjs/pdf.min.js',
  './vendor/pdfjs/pdf.worker.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) return cachedRes;

      return fetch(req)
        .then((networkRes) => {
          if (
            req.method === 'GET' &&
            networkRes.status === 200 &&
            networkRes.type === 'basic'
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkRes.clone());
            });
          }
          return networkRes;
        })
        .catch(() => {
          if (
            req.mode === 'navigate' ||
            ((req.headers.get('accept') || '').includes('text/html'))
          ) {
            return caches.match('./index.html');
          }
        });
    })
  );
});
