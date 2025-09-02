// Script de limpieza del Service Worker - Ejecutar desde la consola del navegador
// Copiar y pegar este código en la consola del navegador (F12 -> Console)

(function() {
  console.log('🧹 Iniciando limpieza completa del Service Worker...');
  
  let logs = [];
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    logs.push(logMessage);
    console.log(logMessage);
  };

  const cleanupServiceWorker = async () => {
    try {
      addLog('1. Verificando soporte de Service Worker...');
      
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker no está soportado en este navegador');
      }
      
      addLog('✅ Service Worker soportado');
      
      // 2. Obtener registro actual
      addLog('2. Obteniendo registro actual del Service Worker...');
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        addLog(`✅ Service Worker encontrado: ${registration.scope}`);
        
        // 3. Desregistrar Service Worker
        addLog('3. Desregistrando Service Worker...');
        await registration.unregister();
        addLog('✅ Service Worker desregistrado');
      } else {
        addLog('ℹ️ No hay Service Worker registrado');
      }
      
      // 4. Limpiar caches
      addLog('4. Limpiando caches del Service Worker...');
      const cacheNames = await caches.keys();
      addLog(`📁 Encontrados ${cacheNames.length} caches`);
      
      for (const cacheName of cacheNames) {
        addLog(`🗑️ Eliminando cache: ${cacheName}`);
        await caches.delete(cacheName);
      }
      addLog('✅ Todos los caches eliminados');
      
      // 5. Limpiar almacenamiento local relacionado
      addLog('5. Limpiando almacenamiento local...');
      
      // Limpiar localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('sw') || key.includes('service') || key.includes('cache'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        addLog(`🗑️ Eliminando localStorage: ${key}`);
        localStorage.removeItem(key);
      });
      
      // Limpiar sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('sw') || key.includes('service') || key.includes('cache'))) {
          sessionKeysToRemove.push(key);
        }
      }
      
      sessionKeysToRemove.forEach(key => {
        addLog(`🗑️ Eliminando sessionStorage: ${key}`);
        sessionStorage.removeItem(key);
      });
      
      addLog('✅ Almacenamiento local limpiado');
      
      // 6. Verificar que no hay Service Workers activos
      addLog('6. Verificando que no hay Service Workers activos...');
      const activeRegistrations = await navigator.serviceWorker.getRegistrations();
      
      if (activeRegistrations.length === 0) {
        addLog('✅ No hay Service Workers activos');
      } else {
        addLog(`⚠️ Aún hay ${activeRegistrations.length} Service Workers activos`);
        for (const reg of activeRegistrations) {
          addLog(`   - ${reg.scope} (${reg.active ? 'Activo' : 'Inactivo'})`);
        }
      }
      
      // 7. Limpiar IndexedDB si existe
      addLog('7. Verificando IndexedDB...');
      if ('indexedDB' in window) {
        try {
          const dbNames = await new Promise((resolve, reject) => {
            const request = indexedDB.databases();
            request.then(dbs => resolve(dbs.map(db => db.name))).catch(() => resolve([]));
          });
          
          if (dbNames.length > 0) {
            addLog(`📊 Encontradas ${dbNames.length} bases de datos IndexedDB`);
            dbNames.forEach(dbName => {
              if (dbName.includes('sw') || dbName.includes('service') || dbName.includes('cache')) {
                addLog(`🗑️ Eliminando IndexedDB: ${dbName}`);
                indexedDB.deleteDatabase(dbName);
              }
            });
          }
        } catch (error) {
          addLog(`⚠️ No se pudo verificar IndexedDB: ${error.message}`);
        }
      }
      
      addLog('✅ Limpieza completada');
      
      // 8. Mostrar resumen
      addLog('📋 RESUMEN DE LIMPIEZA:');
      addLog('   • Service Worker desregistrado');
      addLog('   • Caches eliminados');
      addLog('   • Almacenamiento local limpiado');
      addLog('   • IndexedDB verificado');
      
      addLog('🔄 RECOMENDACIONES:');
      addLog('   • Recargar la página');
      addLog('   • Si el problema persiste, limpiar datos del navegador');
      addLog('   • Verificar permisos de notificaciones');
      
      return true;
      
    } catch (error) {
      addLog(`❌ Error durante la limpieza: ${error.message}`);
      console.error('Error completo:', error);
      return false;
    }
  };

  const showLogs = () => {
    console.log('\n📋 LOGS COMPLETOS DE LIMPIEZA:');
    logs.forEach(log => console.log(log));
  };

  const forceReload = () => {
    addLog('🔄 Forzando recarga de la página...');
    window.location.reload(true);
  };

  // Ejecutar limpieza
  cleanupServiceWorker().then(success => {
    if (success) {
      console.log('\n🎉 LIMPIEZA COMPLETADA EXITOSAMENTE!');
      console.log('💡 Comandos disponibles:');
      console.log('   • showLogs() - Mostrar todos los logs');
      console.log('   • forceReload() - Recargar la página');
      console.log('   • cleanupServiceWorker() - Ejecutar limpieza nuevamente');
    } else {
      console.log('\n⚠️ LA LIMPIEZA NO SE COMPLETÓ COMPLETAMENTE');
      console.log('💡 Revisar logs para más detalles');
    }
  });

  // Exponer funciones globalmente
  window.swCleanup = {
    logs,
    showLogs,
    forceReload,
    cleanupServiceWorker
  };
  
})();
