// Service Worker simplificado para evitar problemas de carga
const CACHE_NAME = 'piezasya-simple-v1';

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  // No cachear nada en la instalación para evitar problemas
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones de red - ESTRATEGIA SIMPLE
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Solo manejar peticiones GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estrategia: Network First para recursos dinámicos
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Si no hay nada en cache, devolver una respuesta básica
            return new Response('Recurso no disponible', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

console.log('Service Worker simplificado cargado');
