/**
 * Script de diagnóstico para el Service Worker en la app móvil React Native
 * Ejecuta este script en la consola del navegador para diagnosticar problemas
 */

console.log('🔍 INICIANDO DIAGNÓSTICO DEL SERVICE WORKER - APP MÓVIL');
console.log('========================================================');

// Función para mostrar logs del Service Worker
function setupServiceWorkerLogging() {
  console.log('📡 Configurando captura de logs del Service Worker...');
  
  if ('serviceWorker' in navigator) {
    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_LOG') {
        console.log('📋 [SW]', event.data.message, event.data.data || '');
      }
    });
    
    console.log('✅ Logging del Service Worker configurado');
  } else {
    console.log('❌ Service Worker no está soportado en este navegador');
  }
}

// Función para verificar el estado del Service Worker
async function checkServiceWorkerStatus() {
  console.log('\n🔍 VERIFICANDO ESTADO DEL SERVICE WORKER');
  console.log('========================================');
  
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`📊 Service Workers registrados: ${registrations.length}`);
      
      for (let i = 0; i < registrations.length; i++) {
        const reg = registrations[i];
        console.log(`\n🔧 Service Worker ${i + 1}:`);
        console.log(`   Scope: ${reg.scope}`);
        console.log(`   Estado: ${reg.active ? 'Activo' : 'No activo'}`);
        console.log(`   Instalando: ${reg.installing ? 'Sí' : 'No'}`);
        console.log(`   Esperando: ${reg.waiting ? 'Sí' : 'No'}`);
        
        if (reg.active) {
          console.log(`   Script URL: ${reg.active.scriptURL}`);
          console.log(`   Estado: ${reg.active.state}`);
        }
      }
      
      // Verificar si hay un Service Worker controlando la página actual
      if (navigator.serviceWorker.controller) {
        console.log('\n🎯 Service Worker controlando la página actual:');
        console.log(`   Script URL: ${navigator.serviceWorker.controller.scriptURL}`);
        console.log(`   Estado: ${navigator.serviceWorker.controller.state}`);
      } else {
        console.log('\n⚠️ Ningún Service Worker está controlando la página actual');
      }
      
    } catch (error) {
      console.error('❌ Error verificando estado del Service Worker:', error);
    }
  } else {
    console.log('❌ Service Worker no está soportado');
  }
}

// Función para verificar caches
async function checkCaches() {
  console.log('\n📦 VERIFICANDO CACHES');
  console.log('=====================');
  
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      console.log(`📊 Caches encontrados: ${cacheNames.length}`);
      
      for (const cacheName of cacheNames) {
        console.log(`\n🗂️ Cache: ${cacheName}`);
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        console.log(`   Recursos almacenados: ${requests.length}`);
        
        // Mostrar algunos recursos como ejemplo
        for (let i = 0; i < Math.min(5, requests.length); i++) {
          console.log(`   - ${requests[i].url}`);
        }
        
        if (requests.length > 5) {
          console.log(`   ... y ${requests.length - 5} más`);
        }
      }
    } catch (error) {
      console.error('❌ Error verificando caches:', error);
    }
  } else {
    console.log('❌ Cache API no está soportada');
  }
}

// Función para verificar almacenamiento local
function checkLocalStorage() {
  console.log('\n💾 VERIFICANDO ALMACENAMIENTO LOCAL');
  console.log('==================================');
  
  const swKeys = [
    'sw-update-available',
    'sw-update-installed',
    'sw-version',
    'sw-cache-version'
  ];
  
  console.log('🔍 Buscando claves relacionadas con Service Worker:');
  for (const key of swKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`   ${key}: ${value}`);
    } else {
      console.log(`   ${key}: No encontrado`);
    }
  }
  
  // Mostrar todas las claves de localStorage
  console.log('\n📋 Todas las claves de localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      console.log(`   ${key}: ${value}`);
    }
  }
}

// Función para forzar limpieza del Service Worker
async function forceCleanServiceWorker() {
  console.log('\n🧹 FORZANDO LIMPIEZA DEL SERVICE WORKER');
  console.log('========================================');
  
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log(`🗑️ Desregistrando ${registrations.length} Service Worker(s)...`);
        
        for (const registration of registrations) {
          await registration.unregister();
          console.log(`   ✅ Desregistrado: ${registration.scope}`);
        }
        
        console.log('✅ Todos los Service Workers han sido desregistrados');
      } else {
        console.log('ℹ️ No hay Service Workers para desregistrar');
      }
      
      // Limpiar caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`🗑️ Limpiando ${cacheNames.length} cache(s)...`);
        
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log(`   ✅ Cache eliminado: ${cacheName}`);
        }
      }
      
      // Limpiar localStorage relacionado con SW
      const swKeys = [
        'sw-update-available',
        'sw-update-installed',
        'sw-version',
        'sw-cache-version'
      ];
      
      for (const key of swKeys) {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`   ✅ localStorage limpiado: ${key}`);
        }
      }
      
      console.log('🎉 Limpieza completada. Recarga la página para aplicar cambios.');
      
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error);
    }
  }
}

// Función para registrar un nuevo Service Worker
async function registerNewServiceWorker() {
  console.log('\n🚀 REGISTRANDO NUEVO SERVICE WORKER');
  console.log('===================================');
  
  if ('serviceWorker' in navigator) {
    try {
      console.log('📝 Registrando Service Worker en /sw.js...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('✅ Service Worker registrado exitosamente:', {
        scope: registration.scope,
        active: !!registration.active,
        waiting: !!registration.waiting,
        installing: !!registration.installing
      });
      
      // Configurar para modo defensivo
      if (registration.active) {
        registration.active.postMessage({
          type: 'SET_AUTO_UPDATE',
          enabled: false
        });
        console.log('🔒 Service Worker configurado en modo defensivo');
      }
      
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  } else {
    console.log('❌ Service Worker no está soportado');
  }
}

// Función para verificar errores específicos de React Native
function checkReactNativeErrors() {
  console.log('\n📱 VERIFICANDO ERRORES ESPECÍFICOS DE REACT NATIVE');
  console.log('==================================================');
  
  // Verificar si hay errores de Hermes
  if (global.HermesInternal) {
    console.log('✅ Motor JavaScript Hermes detectado');
  } else {
    console.log('⚠️ Motor JavaScript JSC detectado (puede causar problemas)');
  }
  
  // Verificar errores de red
  console.log('\n🌐 Verificando conectividad de red...');
  fetch('/sw.js')
    .then(response => {
      console.log('✅ Conexión al servidor exitosa:', response.status);
    })
    .catch(error => {
      console.log('❌ Error de conectividad:', error.message);
    });
  
  // Verificar errores de bundling
  console.log('\n📦 Verificando estado del bundler...');
  if (window.__EXPO_WEBPACK_DEV_SERVER__) {
    console.log('✅ Servidor de desarrollo Expo detectado');
  } else {
    console.log('⚠️ Servidor de desarrollo no detectado');
  }
}

// Función principal de diagnóstico
async function runDiagnostic() {
  console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO PARA APP MÓVIL...\n');
  
  // Configurar logging
  setupServiceWorkerLogging();
  
  // Esperar un poco para que se configure el logging
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Ejecutar verificaciones
  await checkServiceWorkerStatus();
  await checkCaches();
  checkLocalStorage();
  checkReactNativeErrors();
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
  console.log('==========================');
  console.log('📋 Para limpiar el Service Worker, ejecuta: forceCleanServiceWorker()');
  console.log('📋 Para registrar uno nuevo, ejecuta: registerNewServiceWorker()');
  console.log('📋 Para ver logs en tiempo real, revisa la consola');
}

// Ejecutar diagnóstico automáticamente
runDiagnostic();

// Exponer funciones para uso manual
window.serviceWorkerDiagnostic = {
  checkStatus: checkServiceWorkerStatus,
  checkCaches: checkCaches,
  checkStorage: checkLocalStorage,
  forceClean: forceCleanServiceWorker,
  registerNew: registerNewServiceWorker,
  checkReactNative: checkReactNativeErrors,
  runFull: runDiagnostic
};

console.log('\n🔧 FUNCIONES DISPONIBLES:');
console.log('========================');
console.log('serviceWorkerDiagnostic.checkStatus() - Verificar estado');
console.log('serviceWorkerDiagnostic.checkCaches() - Verificar caches');
console.log('serviceWorkerDiagnostic.checkStorage() - Verificar almacenamiento');
console.log('serviceWorkerDiagnostic.forceClean() - Limpiar Service Worker');
console.log('serviceWorkerDiagnostic.registerNew() - Registrar nuevo Service Worker');
console.log('serviceWorkerDiagnostic.checkReactNative() - Verificar errores RN');
console.log('serviceWorkerDiagnostic.runFull() - Ejecutar diagnóstico completo');
