const CACHE_NAME = 'country-app-v6';

const ASSETS = [
  'https://seqqueiralourdes.github.io/paginaIUyTW/',
  'https://seqqueiralourdes.github.io/paginaIUyTW/index.html',
  'https://seqqueiralourdes.github.io/paginaIUyTW/styles.css',
  'https://seqqueiralourdes.github.io/paginaIUyTW/app.js',
  'https://seqqueiralourdes.github.io/paginaIUyTW/manifest.json',
  'https://seqqueiralourdes.github.io/paginaIUyTW/icons/icon-192.png',
  'https://seqqueiralourdes.github.io/paginaIUyTW/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || caches.match('https://seqqueiralourdes.github.io/paginaIUyTW/index.html'));
      })
  );
});
