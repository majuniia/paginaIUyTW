const CACHE_NAME = 'country-app-v3'; 
 

const ASSETS = [ 
  '/', 
  '/index.html', 
  '/styles.css', 
  '/app.js', 
  '/manifest.json' 
]; 
 

// Instalar y guardar en caché 
self.addEventListener('install', event => { 
  event.waitUntil( 
    caches.open(CACHE_NAME) 
      .then(cache => cache.addAll(ASSETS)) 
  ); 
}); 
 

// Activar y limpiar caché viejo 
self.addEventListener('activate', event => { 
  event.waitUntil( 
    caches.keys().then(keys => 
      Promise.all( 
        keys.filter(key => key !== CACHE_NAME) 
            .map(key => caches.delete(key)) 
      ) 
    ) 
  ); 
}); 
 

// Interceptar requests (offline) 
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .then(fetchResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          });
      })
      .catch(() => caches.match('./index.html'))
  );
});
