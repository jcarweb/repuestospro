/**
 * Script específico para diagnosticar problemas de red en la app móvil
 * Ejecuta este script para identificar problemas específicos de conectividad
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO ESPECÍFICO DE RED MÓVIL');
console.log('=======================================');

// URLs a probar
const testUrls = [
  'http://192.168.0.110:3001/api/health',
  'http://192.168.0.110:3001/api/auth/login',
  'http://192.168.0.110:3001/api/auth/register',
  'http://localhost:3001/api/health',
  'http://localhost:3001/api/auth/login'
];

async function testMobileConnection(url) {
  try {
    console.log(`\n🔍 Probando: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PiezasYA-Mobile/1.0.0',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`✅ Conexión exitosa: ${response.status} ${response.statusText}`);
      try {
        const data = await response.text();
        console.log(`📄 Respuesta: ${data.substring(0, 200)}...`);
      } catch (e) {
        console.log('📄 Respuesta recibida (no se pudo parsear)');
      }
      return { success: true, status: response.status, url };
    } else {
      console.log(`⚠️ Respuesta no exitosa: ${response.status} ${response.statusText}`);
      return { success: false, status: response.status, url, error: response.statusText };
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Timeout - El servidor no responde en 10 segundos');
    } else {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
    return { success: false, url, error: error.message };
  }
}

async function checkNetworkConfiguration() {
  console.log('\n📱 VERIFICANDO CONFIGURACIÓN DE RED');
  console.log('====================================');
  
  // Verificar archivo de configuración de red
  const networkUtilsPath = path.join(__dirname, 'src/utils/networkUtils.ts');
  if (fs.existsSync(networkUtilsPath)) {
    const content = fs.readFileSync(networkUtilsPath, 'utf8');
    
    if (content.includes('192.168.0.110')) {
      console.log('✅ IP 192.168.0.110 configurada en networkUtils.ts');
    } else {
      console.log('❌ IP 192.168.0.110 NO configurada en networkUtils.ts');
    }
    
    if (content.includes('knownNetworks')) {
      console.log('✅ Redes conocidas configuradas');
    } else {
      console.log('❌ Redes conocidas NO configuradas');
    }
  } else {
    console.log('❌ Archivo networkUtils.ts no encontrado');
  }
  
  // Verificar archivo de configuración de API
  const apiConfigPath = path.join(__dirname, 'src/config/api.ts');
  if (fs.existsSync(apiConfigPath)) {
    console.log('✅ Archivo api.ts encontrado');
  } else {
    console.log('❌ Archivo api.ts no encontrado');
  }
}

async function checkAuthContext() {
  console.log('\n🔐 VERIFICANDO AUTHCONTEXT');
  console.log('===========================');
  
  const authContextPath = path.join(__dirname, 'src/contexts/AuthContext.tsx');
  if (fs.existsSync(authContextPath)) {
    const content = fs.readFileSync(authContextPath, 'utf8');
    
    if (content.includes('isAuthenticated: false')) {
      console.log('✅ AuthContext configurado para mostrar login primero');
    } else {
      console.log('❌ AuthContext NO está forzado a mostrar login');
    }
    
    if (content.includes('Limpieza forzada')) {
      console.log('✅ Limpieza automática de datos implementada');
    } else {
      console.log('❌ Limpieza automática NO implementada');
    }
  } else {
    console.log('❌ Archivo AuthContext.tsx no encontrado');
  }
}

async function runMobileDiagnostic() {
  console.log('🚀 Iniciando diagnóstico específico para app móvil...\n');
  
  // Verificar configuración
  await checkNetworkConfiguration();
  await checkAuthContext();
  
  // Probar conexiones
  console.log('\n🌐 PROBANDO CONEXIONES ESPECÍFICAS');
  console.log('===================================');
  
  let successfulConnections = 0;
  const results = [];
  
  for (const url of testUrls) {
    const result = await testMobileConnection(url);
    results.push(result);
    if (result.success) {
      successfulConnections++;
    }
  }
  
  // Análisis de resultados
  console.log('\n🎯 ANÁLISIS DE RESULTADOS');
  console.log('==========================');
  
  const healthEndpoints = results.filter(r => r.url.includes('/health'));
  const authEndpoints = results.filter(r => r.url.includes('/auth'));
  
  console.log(`📊 Conexiones exitosas: ${successfulConnections}/${testUrls.length}`);
  console.log(`🏥 Health endpoints: ${healthEndpoints.filter(r => r.success).length}/${healthEndpoints.length}`);
  console.log(`🔐 Auth endpoints: ${authEndpoints.filter(r => r.success).length}/${authEndpoints.length}`);
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES');
  console.log('==================');
  
  if (successfulConnections === 0) {
    console.log('❌ PROBLEMA CRÍTICO: No hay conexiones exitosas');
    console.log('🔧 ACCIONES REQUERIDAS:');
    console.log('   1. Verifica que el backend esté ejecutándose');
    console.log('   2. Comprueba la IP del servidor');
    console.log('   3. Verifica la configuración de red');
    console.log('   4. Revisa el firewall y antivirus');
    console.log('   5. Ejecuta: complete-reset.bat');
  } else if (successfulConnections < testUrls.length) {
    console.log('⚠️ PROBLEMA PARCIAL: Algunas conexiones fallan');
    console.log('🔧 ACCIONES RECOMENDADAS:');
    console.log('   1. Verifica endpoints específicos que fallan');
    console.log('   2. Revisa la configuración de la API');
    console.log('   3. Ejecuta: fix-connection.bat');
  } else {
    console.log('✅ CONEXIONES FUNCIONANDO: Todas las conexiones son exitosas');
    console.log('🔧 SI LA APP MÓVIL AÚN NO FUNCIONA:');
    console.log('   1. Ejecuta: complete-reset.bat');
    console.log('   2. Limpia cache de la app móvil');
    console.log('   3. Reinicia el dispositivo/emulador');
  }
  
  // Información específica para la app móvil
  console.log('\n📱 INFORMACIÓN PARA LA APP MÓVIL');
  console.log('=================================');
  console.log('• Backend URL: http://192.168.0.110:3001/api');
  console.log('• Health Check: http://192.168.0.110:3001/api/health');
  console.log('• Login Endpoint: http://192.168.0.110:3001/api/auth/login');
  console.log('• Register Endpoint: http://192.168.0.110:3001/api/auth/register');
  
  console.log('\n🔧 COMANDOS ÚTILES:');
  console.log('• complete-reset.bat - Reseteo completo');
  console.log('• fix-connection.bat - Solución de problemas');
  console.log('• quick-start.bat - Inicio rápido');
  
  return results;
}

// Ejecutar diagnóstico
runMobileDiagnostic().catch(error => {
  console.error('❌ Error ejecutando diagnóstico:', error);
});
