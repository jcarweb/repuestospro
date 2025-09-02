#!/usr/bin/env node

/**
 * Script para resolver el error "Failed to download remote update" en la aplicación móvil
 * Este script limpia y reinstala el Service Worker para evitar errores de actualizaciones remotas
 */

console.log('🔧 SOLUCIONANDO ERROR: "Failed to download remote update"');
console.log('==================================================');

async function fixServiceWorkerError() {
  try {
    console.log('\n1️⃣ Verificando si el Service Worker está registrado...');
    
    if ('serviceWorker' in navigator) {
      // Obtener todas las registraciones de Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log(`✅ Encontrados ${registrations.length} Service Worker(s) registrados`);
        
        // Desregistrar todos los Service Workers existentes
        for (const registration of registrations) {
          console.log('🗑️ Desregistrando Service Worker:', registration.scope);
          await registration.unregister();
        }
        
        console.log('✅ Todos los Service Workers han sido desregistrados');
      } else {
        console.log('ℹ️ No hay Service Workers registrados');
      }
      
      // Limpiar caches del Service Worker
      if ('caches' in window) {
        console.log('\n2️⃣ Limpiando caches del Service Worker...');
        
        const cacheNames = await caches.keys();
        console.log(`📦 Encontrados ${cacheNames.length} caches`);
        
        for (const cacheName of cacheNames) {
          if (cacheName.includes('piezasya') || cacheName.includes('sw')) {
            console.log(`🗑️ Eliminando cache: ${cacheName}`);
            await caches.delete(cacheName);
          }
        }
        
        console.log('✅ Caches del Service Worker limpiados');
      }
      
      // Limpiar localStorage y sessionStorage
      console.log('\n3️⃣ Limpiando almacenamiento local...');
      
      const keysToRemove = [
        'sw-update-available',
        'sw-update-installed',
        'sw-version',
        'sw-cache-version'
      ];
      
      for (const key of keysToRemove) {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Eliminado de localStorage: ${key}`);
        }
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`🗑️ Eliminado de sessionStorage: ${key}`);
        }
      }
      
      console.log('✅ Almacenamiento local limpiado');
      
      // Forzar recarga de la página para aplicar cambios
      console.log('\n4️⃣ Recargando la página para aplicar cambios...');
      
      setTimeout(() => {
        console.log('🔄 Recargando página en 3 segundos...');
        window.location.reload();
      }, 3000);
      
    } else {
      console.log('❌ Service Worker no está soportado en este navegador');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    console.log('\n🔄 Intentando recargar la página de todas formas...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}

// Ejecutar la función principal
fixServiceWorkerError();

// También agregar un botón manual en caso de que el script no funcione
setTimeout(() => {
  if (document.body) {
    const manualButton = document.createElement('button');
    manualButton.textContent = '🔄 Recargar Página Manualmente';
    manualButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    `;
    manualButton.onclick = () => window.location.reload();
    
    document.body.appendChild(manualButton);
    
    console.log('🔘 Botón de recarga manual agregado');
  }
}, 1000);
