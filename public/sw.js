/**
 * Service Worker para "¿Qué comemos hoy?" PWA
 */

const CACHE_NAME = 'que-comemos-hoy-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/badge-96.png',
  '/badge.png'
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

// Gestión de Notificaciones Push Web para Moderación, Aprobación y Administradores
self.addEventListener('push', (event) => {
  let data = {
    title: '🛎️ Aviso en ¿Qué comemos hoy?',
    body: 'Hay una novedad en la carta.',
    icon: '/icon-192.png',
    badge: '/badge-96.png',
    url: '/',
    data: {
      url: '/',
    },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const targetUrl = (data.data && data.data.url) || data.url || '/';
  const notificationType =
    (data.data && data.data.type) ||
    (targetUrl.includes('openModeration') ? 'dish_pending_review' : 'dish_approved');

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-96.png',
    data: {
      ...(data.data || {}),
      url: targetUrl,
      type: notificationType,
    },
    vibrate: [200, 100, 200],
    tag: `${notificationType}-${Date.now()}`,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Evento de clic en la notificación nativa: enfocar la app y navegar a la ruta destino (receta o moderación)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta de la aplicación, enfocarla y navegar a la ruta
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Si no hay ninguna ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
