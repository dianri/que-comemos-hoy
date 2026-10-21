/**
 * Service Worker para "¿Qué comemos hoy?" PWA
 */

const CACHE_NAME = 'que-comemos-hoy-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Instalación: pre-cache de activos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activación: purga de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First con fallback a cache para peticiones de navegación y assets
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a Supabase, Chrome Extensions o APIs externas
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar copia en cache si es un recurso propio válido
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay red, recuperar de la caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Para navegación principal, devolver index.html de la caché
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
