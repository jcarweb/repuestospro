/**
 * Script para probar específicamente los endpoints de autenticación
 * Esto ayuda a identificar si el problema está en la autenticación
 */

const fetch = require('node-fetch');

console.log('🔐 PROBANDO ENDPOINTS DE AUTENTICACIÓN');
console.log('======================================');

const baseUrl = 'http://192.168.0.110:3001/api';

async function testAuthEndpoint(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🔍 Probando: ${method} ${baseUrl}${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    clearTimeout(timeoutId);
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente');
      try {
        const responseData = await response.text();
        console.log(`📄 Respuesta: ${responseData.substring(0, 200)}...`);
      } catch (e) {
        console.log('📄 Respuesta recibida (no se pudo parsear)');
      }
      return true;
    } else {
      console.log('⚠️ Endpoint con problemas');
      try {
        const errorData = await response.text();
        console.log(`❌ Error: ${errorData.substring(0, 200)}...`);
      } catch (e) {
        console.log('❌ Error recibido (no se pudo parsear)');
      }
      return false;
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Timeout - El endpoint no responde');
    } else {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
    return false;
  }
}

async function runAuthTests() {
  console.log('🚀 Iniciando pruebas de endpoints de autenticación...\n');
  
  const tests = [
    { endpoint: '/health', method: 'GET' },
    { endpoint: '/auth/login', method: 'POST', data: { email: 'test@test.com', password: 'test123' } },
    { endpoint: '/auth/register', method: 'POST', data: { name: 'Test User', email: 'test@test.com', password: 'test123' } },
    { endpoint: '/auth/forgot-password', method: 'POST', data: { email: 'test@test.com' } },
    { endpoint: '/auth/verify-email', method: 'POST', data: { token: 'test-token' } },
  ];
  
  let successfulTests = 0;
  
  for (const test of tests) {
    const success = await testAuthEndpoint(test.endpoint, test.method, test.data);
    if (success) {
      successfulTests++;
    }
  }
  
  console.log('\n🎯 RESULTADO FINAL');
  console.log('==================');
  console.log(`✅ Endpoints funcionando: ${successfulTests}/${tests.length}`);
  
  if (successfulTests === 0) {
    console.log('❌ PROBLEMA CRÍTICO: Ningún endpoint de autenticación funciona');
    console.log('🔧 ACCIONES REQUERIDAS:');
    console.log('   1. Verifica que el backend esté ejecutándose');
    console.log('   2. Comprueba la configuración de la base de datos');
    console.log('   3. Revisa los logs del backend');
    console.log('   4. Ejecuta: complete-reset.bat');
  } else if (successfulTests < tests.length) {
    console.log('⚠️ PROBLEMA PARCIAL: Algunos endpoints fallan');
    console.log('🔧 ACCIONES RECOMENDADAS:');
    console.log('   1. Revisa los endpoints específicos que fallan');
    console.log('   2. Verifica la configuración de la API');
    console.log('   3. Ejecuta: emergency-fix.bat');
  } else {
    console.log('✅ TODOS LOS ENDPOINTS FUNCIONANDO');
    console.log('🔧 SI LA APP MÓVIL AÚN NO FUNCIONA:');
    console.log('   1. El problema está en la app móvil, no en el backend');
    console.log('   2. Ejecuta: complete-reset.bat');
    console.log('   3. Limpia cache de la app móvil');
    console.log('   4. Reinicia el dispositivo/emulador');
  }
  
  console.log('\n📋 INFORMACIÓN ADICIONAL:');
  console.log('• Backend URL: http://192.168.0.110:3001');
  console.log('• API Base: http://192.168.0.110:3001/api');
  console.log('• Health Check: http://192.168.0.110:3001/api/health');
  
  console.log('\n🔧 COMANDOS DE SOLUCIÓN:');
  console.log('• emergency-fix.bat - Solución rápida');
  console.log('• complete-reset.bat - Reseteo completo');
  console.log('• fix-connection.bat - Solución de problemas');
}

// Ejecutar pruebas
runAuthTests().catch(error => {
  console.error('❌ Error ejecutando pruebas:', error);
});
