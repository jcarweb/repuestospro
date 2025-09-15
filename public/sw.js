// Service Worker para notificaciones push - Versión Defensiva CON LOGS DETALLADOS
const CACHE_NAME = 'piezasya-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/piezasya.png'
];

// Versión del cache para control de actualizaciones
const CACHE_VERSION = '1.0.0';

// Flag para controlar actualizaciones automáticas - DESHABILITADO POR DEFECTO
let AUTO_UPDATE_ENABLED = false;

// Función de logging detallado
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[SW-LOG ${timestamp}] ${message}`;
  
  // Log en consola del Service Worker
  console.log(logMessage, data || '');
  
  // Enviar log a la consola principal si es posible
  try {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_LOG',
          message: logMessage,
          data: data,
          timestamp: timestamp
        });
      });
    });
  } catch (error) {
    console.error('Error enviando log a cliente:', error);
  }
}

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  log('🚀 Service Worker instalando...');
  log('📦 Cache name:', CACHE_NAME);
  log('🔧 URLs a cachear:', urlsToCache);
  
  // DESHABILITAR ACTUALIZACIONES AUTOMÁTICAS PERMANENTEMENTE
  AUTO_UPDATE_ENABLED = false;
  log('❌ Actualizaciones automáticas DESHABILITADAS permanentemente');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        log('✅ Cache abierto exitosamente:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        log('✅ Todos los recursos agregados al cache');
      })
      .catch((error) => {
        log('❌ Error durante la instalación del Service Worker:', error);
        log('🔧 Continuando sin cache para evitar bloqueos');
        // Si falla la instalación, no bloquear la activación
        return Promise.resolve();
      })
  );
  
  // NO forzar la activación inmediata - esperar instrucciones del usuario
  log('⏳ NO forzando activación inmediata - esperando instrucciones del usuario');
  // self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  log('🔄 Service Worker activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      log('📦 Caches existentes encontrados:', cacheNames);
      
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          } else {
            log('✅ Cache actual mantenido:', cacheName);
          }
        })
      );
    })
    .then(() => {
      log('✅ Limpieza de caches completada');
      
      // NO tomar control automáticamente - esperar instrucciones del usuario
      log('⏳ NO tomando control automático - esperando instrucciones del usuario');
      // return self.clients.claim();
      return Promise.resolve();
    })
    .catch((error) => {
      log('❌ Error durante la activación del Service Worker:', error);
      log('🔧 Continuando incluso si hay errores');
      // Continuar incluso si hay errores
      return Promise.resolve();
    })
  );
});

// Interceptar peticiones de red con mejor manejo de errores
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;
  const method = request.method;
  
  log('🌐 Fetch event interceptado:', {
    url: url,
    method: method,
    mode: request.mode,
    credentials: request.credentials
  });
  
  // Solo manejar peticiones GET
  if (request.method !== 'GET') {
    log('⏭️ Ignorando petición no-GET:', method);
    return;
  }

  // SIEMPRE usar solo cache - NO intentar actualizaciones remotas
  log('🔒 Usando SOLO cache local - SIN actualizaciones remotas');
  
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          log('✅ Recurso encontrado en cache:', url);
          return response;
        }
        
        log('❌ Recurso NO encontrado en cache:', url);
        log('🔒 NO intentando descarga remota - devolviendo respuesta offline');
        
        // Si no está en cache, devolver una respuesta básica
        return new Response('Recurso no disponible en modo offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
      .catch((error) => {
        log('❌ Error en cache.match:', error);
        log('🔒 Devolviendo respuesta de error offline');
        
        return new Response('Error de conexión', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Función para fetch con timeout
function fetchWithTimeout(request, timeout) {
  log('⏱️ Iniciando fetch con timeout:', {
    url: request.url,
    timeout: timeout + 'ms'
  });
  
  return Promise.race([
    fetch(request).then(response => {
      log('✅ Fetch exitoso:', {
        url: request.url,
        status: response.status,
        statusText: response.statusText
      });
      return response;
    }).catch(error => {
      log('❌ Error en fetch:', {
        url: request.url,
        error: error.message
      });
      throw error;
    }),
    new Promise((_, reject) => {
      setTimeout(() => {
        log('⏰ Timeout alcanzado para:', request.url);
        reject(new Error('Timeout'));
      }, timeout);
    })
  ]);
}

// Manejar notificaciones push con mejor manejo de errores
self.addEventListener('push', (event) => {
  log('📱 Push notification recibido:', {
    hasData: !!event.data,
    dataType: event.data ? typeof event.data : 'undefined'
  });
  
  let notificationData = {
    title: 'PiezasYA',
    body: 'Tienes una nueva notificación',
    icon: '/piezasya.png',
    badge: '/piezasya.png',
    tag: 'piezasya-notification'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      log('📋 Datos de notificación parseados:', data);
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      log('❌ Error parseando datos de notificación:', error);
      log('🔧 Usando datos por defecto');
      // Usar datos por defecto si falla el parsing
    }
  }

  log('🔔 Mostrando notificación con datos:', notificationData);

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    requireInteraction: false,
    silent: false
  };

  try {
    const notification = self.registration.showNotification(notificationData.title, options);
    log('✅ Notificación mostrada exitosamente');
    return notification;
  } catch (error) {
    log('❌ Error mostrando notificación:', error);
    // Si falla, intentar mostrar una notificación básica
    try {
      return self.registration.showNotification('PiezasYA', {
        body: 'Notificación recibida',
        icon: '/piezasya.png'
      });
    } catch (fallbackError) {
      log('❌ Error en notificación de fallback:', fallbackError);
    }
  }
});

// Manejar clic en notificación
self.addEventListener('notificationclick', (event) => {
  log('👆 Clic en notificación:', {
    tag: event.notification.tag,
    action: event.action || 'default'
  });
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          log('🎯 Enfocando ventana existente');
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        const url = event.notification.data?.url || '/';
        log('🆕 Abriendo nueva ventana:', url);
        return clients.openWindow(url);
      }
    })
    .catch((error) => {
      log('❌ Error manejando clic en notificación:', error);
      // Si falla, intentar abrir la ventana de todas formas
      if (clients.openWindow) {
        log('🔄 Intentando abrir ventana de fallback');
        return clients.openWindow('/');
      }
    })
  );
});

// Manejar cierre de notificación
self.addEventListener('notificationclose', (event) => {
  log('❌ Notificación cerrada:', {
    tag: event.notification.tag,
    wasClean: event.wasClean
  });
  // Aquí puedes agregar analytics o tracking
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  log('📨 Mensaje recibido en SW:', {
    type: event.data?.type,
    data: event.data
  });
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    log('🚀 Activando Service Worker por solicitud del usuario');
    self.skipWaiting();
  }
  
  // Manejar mensajes de actualización
  if (event.data && event.data.type === 'UPDATE_SW') {
    log('🔄 Actualizando Service Worker por solicitud del usuario');
    self.skipWaiting();
  }

  // Habilitar/deshabilitar actualizaciones automáticas
  if (event.data && event.data.type === 'SET_AUTO_UPDATE') {
    AUTO_UPDATE_ENABLED = event.data.enabled;
    log('⚙️ Actualizaciones automáticas:', AUTO_UPDATE_ENABLED ? 'HABILITADAS' : 'DESHABILITADAS');
  }

  // Tomar control de las páginas
  if (event.data && event.data.type === 'CLAIM_CLIENTS') {
    log('🎯 Tomando control de las páginas por solicitud del usuario');
    self.clients.claim();
  }

  // Limpiar caches
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    log('🗑️ Limpiando caches por solicitud del usuario');
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      log('✅ Caches limpiados');
    }).catch(error => {
      log('❌ Error limpiando caches:', error);
    });
  }
});

// Manejar errores globales del Service Worker
self.addEventListener('error', (event) => {
  log('❌ Error en Service Worker:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

self.addEventListener('unhandledrejection', (event) => {
  log('❌ Promesa rechazada no manejada en Service Worker:', {
    reason: event.reason,
    promise: event.promise
  });
});

// Función para verificar el estado del Service Worker
function getServiceWorkerStatus() {
  return {
    autoUpdateEnabled: AUTO_UPDATE_ENABLED,
    cacheName: CACHE_NAME,
    cacheVersion: CACHE_VERSION,
    timestamp: new Date().toISOString()
  };
}

// Exponer estado del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_STATUS') {
    const status = getServiceWorkerStatus();
    log('📊 Estado del Service Worker solicitado:', status);
    event.ports[0].postMessage(status);
  }
});

// Log de inicio
log('🚀 Service Worker iniciado y listo');
log('🔒 Modo defensivo activado - SIN actualizaciones remotas');
log('📱 Esperando mensajes del cliente...');
