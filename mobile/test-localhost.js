/**
 * Script para probar la conexión con localhost
 * Verifica si el backend está funcionando en localhost:3001
 */

const fetch = require('node-fetch');

console.log('🔍 PROBANDO CONEXIÓN CON LOCALHOST');
console.log('===================================');

const testUrls = [
  'http://localhost:3001/api/health',
  'http://localhost:3001/api/auth/login',
  'http://127.0.0.1:3001/api/health',
  'http://127.0.0.1:3001/api/auth/login'
];

async function testLocalhostConnection(url) {
  try {
    console.log(`\n🔍 Probando: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
      return true;
    } else {
      console.log(`⚠️ Respuesta no exitosa: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Timeout - El servidor no responde en 5 segundos');
    } else {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
    return false;
  }
}

async function runLocalhostTest() {
  console.log('🚀 Iniciando pruebas de localhost...\n');
  
  let successfulConnections = 0;
  
  for (const url of testUrls) {
    const success = await testLocalhostConnection(url);
    if (success) {
      successfulConnections++;
    }
  }
  
  console.log('\n🎯 RESULTADO FINAL');
  console.log('==================');
  
  if (successfulConnections > 0) {
    console.log(`✅ ${successfulConnections}/${testUrls.length} conexiones exitosas`);
    console.log('✅ El backend está funcionando en localhost');
    console.log('\n💡 SOLUCIÓN PARA LA APP MÓVIL:');
    console.log('1. Ejecuta: force-localhost.bat');
    console.log('2. La app usará localhost en lugar de la IP de red');
    console.log('3. Esto debería resolver el problema de conectividad');
  } else {
    console.log('❌ 0 conexiones exitosas');
    console.log('❌ El backend no está funcionando en localhost');
    console.log('\n🔧 ACCIONES REQUERIDAS:');
    console.log('1. Verifica que el backend esté ejecutándose');
    console.log('2. Comprueba que esté en el puerto 3001');
    console.log('3. Revisa la configuración del backend');
    console.log('4. Ejecuta: cd backend && npm run dev:network');
  }
  
  console.log('\n📋 INFORMACIÓN ADICIONAL:');
  console.log('• Backend esperado: http://localhost:3001');
  console.log('• API: http://localhost:3001/api');
  console.log('• Health: http://localhost:3001/api/health');
  
  console.log('\n🔧 COMANDOS DE SOLUCIÓN:');
  console.log('• force-localhost.bat - Usar localhost');
  console.log('• complete-reset.bat - Reseteo completo');
  console.log('• emergency-fix.bat - Solución de emergencia');
}

// Ejecutar pruebas
runLocalhostTest().catch(error => {
  console.error('❌ Error ejecutando pruebas:', error);
});
