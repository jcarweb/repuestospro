/**
 * Script de diagnóstico específico para React Native
 * Ejecuta este script en la consola del navegador o en la app móvil
 */

console.log('🔍 INICIANDO DIAGNÓSTICO REACT NATIVE - APP MÓVIL');
console.log('==================================================');

// Función para verificar el entorno de React Native
function checkReactNativeEnvironment() {
  console.log('\n📱 VERIFICANDO ENTORNO REACT NATIVE');
  console.log('====================================');
  
  // Verificar si estamos en React Native
  if (typeof global !== 'undefined' && global.navigator) {
    console.log('✅ Entorno React Native detectado');
    
    // Verificar motor JavaScript
    if (global.HermesInternal) {
      console.log('✅ Motor JavaScript: Hermes');
    } else if (global.__fbBatchedBridge) {
      console.log('✅ Motor JavaScript: JSC (React Native)');
    } else {
      console.log('⚠️ Motor JavaScript: Desconocido');
    }
    
    // Verificar plataforma
    if (global.Platform) {
      console.log(`✅ Plataforma: ${global.Platform.OS}`);
    }
    
  } else if (typeof window !== 'undefined') {
    console.log('✅ Entorno Web detectado');
    
    // Verificar si es Expo Web
    if (window.__EXPO_WEBPACK_DEV_SERVER__) {
      console.log('✅ Servidor de desarrollo Expo detectado');
    }
    
  } else {
    console.log('❌ Entorno no reconocido');
  }
}

// Función para verificar errores de red
async function checkNetworkErrors() {
  console.log('\n🌐 VERIFICANDO ERRORES DE RED');
  console.log('==============================');
  
  try {
    // Verificar conectividad básica
    console.log('🔍 Probando conectividad de red...');
    
    // Intentar hacer una petición simple
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Conectividad de red exitosa');
    } else {
      console.log('⚠️ Conectividad de red con problemas:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Error de conectividad:', error.message);
    
    // Verificar si es un error específico de React Native
    if (error.message.includes('Network request failed')) {
      console.log('🚨 Error específico de React Native: Network request failed');
      console.log('💡 Posibles causas:');
      console.log('   - Permisos de red no concedidos');
      console.log('   - Configuración de red incorrecta');
      console.log('   - Firewall bloqueando conexiones');
    }
  }
}

// Función para verificar errores de bundling
function checkBundlingErrors() {
  console.log('\n📦 VERIFICANDO ERRORES DE BUNDLING');
  console.log('====================================');
  
  // Verificar si hay errores de Metro
  if (typeof global !== 'undefined' && global.__METRO_GLOBAL_PREFIX__) {
    console.log('✅ Metro bundler detectado');
  } else {
    console.log('⚠️ Metro bundler no detectado');
  }
  
  // Verificar errores de Hermes
  if (global.HermesInternal) {
    try {
      // Intentar acceder a funcionalidades de Hermes
      if (global.HermesInternal.enablePromiseRejectionTracker) {
        console.log('✅ Funcionalidades de Hermes disponibles');
      }
    } catch (error) {
      console.log('❌ Error accediendo a funcionalidades de Hermes:', error.message);
    }
  }
  
  // Verificar errores de JSC
  if (global.__fbBatchedBridge) {
    try {
      // Verificar bridge de React Native
      if (global.__fbBatchedBridge.flushedQueue) {
        console.log('✅ Bridge de React Native funcionando');
      }
    } catch (error) {
      console.log('❌ Error en bridge de React Native:', error.message);
    }
  }
}

// Función para verificar errores de Service Worker
function checkServiceWorkerErrors() {
  console.log('\n🔧 VERIFICANDO SERVICE WORKER');
  console.log('==============================');
  
  if ('serviceWorker' in navigator) {
    console.log('✅ Service Worker soportado');
    
    // Verificar registros existentes
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`📊 Service Workers registrados: ${registrations.length}`);
      
      if (registrations.length > 0) {
        registrations.forEach((reg, index) => {
          console.log(`\n🔧 Service Worker ${index + 1}:`);
          console.log(`   Scope: ${reg.scope}`);
          console.log(`   Estado: ${reg.active ? 'Activo' : 'No activo'}`);
          
          if (reg.active) {
            console.log(`   Script: ${reg.active.scriptURL}`);
          }
        });
      }
    }).catch(error => {
      console.log('❌ Error verificando Service Workers:', error.message);
    });
    
  } else {
    console.log('❌ Service Worker no soportado');
  }
}

// Función para verificar errores específicos de "Failed to download remote update"
function checkRemoteUpdateErrors() {
  console.log('\n🚨 VERIFICANDO ERRORES DE ACTUALIZACIÓN REMOTA');
  console.log('==============================================');
  
  // Verificar si hay errores en la consola relacionados
  const consoleErrors = [];
  const originalError = console.error;
  
  // Interceptar errores de consola
  console.error = function(...args) {
    consoleErrors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Verificar errores específicos
  setTimeout(() => {
    const remoteUpdateErrors = consoleErrors.filter(error => 
      error.includes('Failed to download') || 
      error.includes('remote update') ||
      error.includes('java.io.IOException')
    );
    
    if (remoteUpdateErrors.length > 0) {
      console.log('🚨 Errores de actualización remota detectados:');
      remoteUpdateErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      
      console.log('\n💡 ANÁLISIS DEL ERROR:');
      console.log('   - Este error indica intentos de descarga remota');
      console.log('   - Puede ser causado por Service Worker o bundler');
      console.log('   - Verificar configuración de red y cache');
      
    } else {
      console.log('✅ No se detectaron errores de actualización remota');
    }
    
    // Restaurar console.error original
    console.error = originalError;
  }, 2000);
}

// Función para verificar configuración de Expo
function checkExpoConfiguration() {
  console.log('\n⚙️ VERIFICANDO CONFIGURACIÓN DE EXPO');
  console.log('=====================================');
  
  // Verificar si estamos en Expo
  if (typeof global !== 'undefined' && global.__EXPO_DEVTOOLS_LISTENER__) {
    console.log('✅ Entorno Expo detectado');
    
    // Verificar configuración de desarrollo
    if (global.__EXPO_DEVTOOLS_LISTENER__) {
      console.log('✅ DevTools de Expo disponibles');
    }
    
  } else if (typeof window !== 'undefined' && window.__EXPO_WEBPACK_DEV_SERVER__) {
    console.log('✅ Expo Web detectado');
    
  } else {
    console.log('⚠️ Entorno Expo no detectado');
  }
  
  // Verificar variables de entorno
  if (global.__EXPO_ENV__) {
    console.log(`✅ Entorno Expo: ${global.__EXPO_ENV__}`);
  }
}

// Función para generar reporte de diagnóstico
function generateDiagnosticReport() {
  console.log('\n📋 GENERANDO REPORTE DE DIAGNÓSTICO');
  console.log('====================================');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'React Native',
    platform: global.Platform?.OS || 'Desconocido',
    engine: global.HermesInternal ? 'Hermes' : 'JSC',
    expo: !!(global.__EXPO_DEVTOOLS_LISTENER__ || window.__EXPO_WEBPACK_DEV_SERVER__),
    serviceWorker: 'serviceWorker' in navigator,
    metro: !!global.__METRO_GLOBAL_PREFIX__
  };
  
  console.log('📊 Reporte de diagnóstico:');
  console.log(JSON.stringify(report, null, 2));
  
  return report;
}

// Función principal de diagnóstico
async function runReactNativeDiagnostic() {
  console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DE REACT NATIVE...\n');
  
  // Ejecutar todas las verificaciones
  checkReactNativeEnvironment();
  await checkNetworkErrors();
  checkBundlingErrors();
  checkServiceWorkerErrors();
  checkRemoteUpdateErrors();
  checkExpoConfiguration();
  
  // Generar reporte final
  const report = generateDiagnosticReport();
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
  console.log('==========================');
  console.log('📋 Para verificar estado del Service Worker: checkServiceWorkerErrors()');
  console.log('📋 Para verificar errores de red: checkNetworkErrors()');
  console.log('📋 Para generar reporte: generateDiagnosticReport()');
  
  return report;
}

// Ejecutar diagnóstico automáticamente
runReactNativeDiagnostic();

// Exponer funciones para uso manual
window.reactNativeDiagnostic = {
  checkEnvironment: checkReactNativeEnvironment,
  checkNetwork: checkNetworkErrors,
  checkBundling: checkBundlingErrors,
  checkServiceWorker: checkServiceWorkerErrors,
  checkRemoteUpdate: checkRemoteUpdateErrors,
  checkExpo: checkExpoConfiguration,
  generateReport: generateDiagnosticReport,
  runFull: runReactNativeDiagnostic
};

console.log('\n🔧 FUNCIONES DISPONIBLES:');
console.log('========================');
console.log('reactNativeDiagnostic.checkEnvironment() - Verificar entorno RN');
console.log('reactNativeDiagnostic.checkNetwork() - Verificar errores de red');
console.log('reactNativeDiagnostic.checkBundling() - Verificar errores de bundling');
console.log('reactNativeDiagnostic.checkServiceWorker() - Verificar Service Worker');
console.log('reactNativeDiagnostic.checkRemoteUpdate() - Verificar errores de actualización');
console.log('reactNativeDiagnostic.checkExpo() - Verificar configuración Expo');
console.log('reactNativeDiagnostic.generateReport() - Generar reporte completo');
console.log('reactNativeDiagnostic.runFull() - Ejecutar diagnóstico completo');
