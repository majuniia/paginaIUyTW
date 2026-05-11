// ═══════════════════════════════════════════════════
// sw.js — Service Worker de Country Los Álamos
// Versión: country-app-v8
// Base: https://majuniia.github.io/paginaIUyTW
// ═══════════════════════════════════════════════════

// Nombre único del caché. Al cambiarlo (ej. v9) forzamos
// que el navegador descargue todos los recursos nuevamente.
const CACHE_NAME = 'country-app-v8';

// URL base del sitio. Usamos una variable para no repetir
// y facilitar cambios si el repositorio se mueve.
const BASE = 'https://majuniia.github.io/paginaIUyTW';

// Lista de recursos que se cachean durante la instalación.
// Son los archivos mínimos para que la app funcione offline.
const ASSETS = [
  BASE + '/',                    // página principal
  BASE + '/index.html',          // estructura HTML
  BASE + '/styles.css',          // todos los estilos
  BASE + '/app.js',              // lógica principal (slider, modales, login, etc.)
  BASE + '/auth.js',             // autenticación de residentes
  BASE + '/form-handler.js',     // envío de formularios con cola offline
  BASE + '/manifest.json',       // manifiesto para instalación PWA
  BASE + '/icons/icon-192.png',  // icono pequeño
  BASE + '/icons/icon-512.png',  // icono grande
  BASE + '/reglamento-completo.pdf' // documento descargable
];

// ─── EVENTO INSTALL ──────────────────────────────
// Se ejecuta cuando el Service Worker se instala por primera vez
// o cuando detecta un cambio en el archivo.
self.addEventListener('install', event => {
  // waitUntil asegura que la instalación no termine hasta que
  // el caché esté completamente poblado.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))  // guarda todos los recursos listados
      .then(() => self.skipWaiting())       // activa el SW inmediatamente, sin esperar a que se cierren pestañas
  );
});

// ─── EVENTO ACTIVATE ─────────────────────────────
// Se dispara cuando el SW se activa (nueva versión).
// Aprovechamos para limpiar cachés viejas que ya no necesitamos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)   // solo borramos cachés que no sean la actual
          .map(key => caches.delete(key))      // eliminamos cada una
      )
    ).then(() => self.clients.claim())         // toma control de todas las pestañas abiertas
  );
});

// ─── EVENTO FETCH ────────────────────────────────
// Intercepta todas las peticiones de red de la página.
// Estrategia: Network First (Red primero) con fallback a caché.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)                      // intenta obtener el recurso de la red
      .then(fetchResponse => {
        // Si la red responde OK, guardamos una copia en caché
        // para futuros usos offline y devolvemos la respuesta fresca.
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      })
      .catch(() => {
        // Si la red falla (sin conexión), buscamos en el caché.
        // Si no está en caché, devolvemos index.html como fallback
        // para que la app no muestre el dinosaurio del navegador.
        return caches.match(event.request)
          .then(response => response || caches.match(BASE + '/index.html'));
      })
  );
});
