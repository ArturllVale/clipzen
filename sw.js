const CACHE_NAME = 'clipboard-zen-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './src/css/style.css',
  './src/js/script.js',
  './manifest.json',
  './src/assets/icons/icon-192x192.png',
  './src/assets/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache first
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Trata a mensagem SKIP_WAITING para pular a espera e ativar o novo service worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});