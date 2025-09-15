/**
 * Script para probar la conexión con el backend
 * Ejecuta este script para verificar si la app móvil puede conectarse al servidor
 */

const fetch = require('node-fetch');

console.log('🔍 PROBANDO CONEXIÓN CON EL BACKEND');
console.log('====================================');

// IPs a probar
const testUrls = [
  'http://192.168.0.110:3001/api/health',
  'http://192.168.0.110:3001/api',
  'http://localhost:3001/api/health',
  'http://localhost:3001/api'
];

async function testConnection(url) {
  try {
    console.log(`\n🔍 Probando: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`✅ Conexión exitosa: ${response.status} ${response.statusText}`);
      try {
        const data = await response.text();
        console.log(`📄 Respuesta: ${data.substring(0, 100)}...`);
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

async function runConnectionTest() {
  console.log('🚀 Iniciando pruebas de conexión...\n');
  
  let successfulConnections = 0;
  
  for (const url of testUrls) {
    const success = await testConnection(url);
    if (success) {
      successfulConnections++;
    }
  }
  
  console.log('\n🎯 RESULTADO FINAL');
  console.log('==================');
  
  if (successfulConnections > 0) {
    console.log(`✅ ${successfulConnections}/${testUrls.length} conexiones exitosas`);
    console.log('✅ El backend está funcionando correctamente');
    console.log('\n💡 SOLUCIONES PARA LA APP MÓVIL:');
    console.log('1. Verifica que la app móvil esté en la misma red WiFi');
    console.log('2. Asegúrate de que el firewall no bloquee la conexión');
    console.log('3. Prueba reiniciar la app móvil');
    console.log('4. Verifica la configuración de red en la app');
  } else {
    console.log('❌ 0 conexiones exitosas');
    console.log('❌ El backend no está accesible');
    console.log('\n🔧 ACCIONES REQUERIDAS:');
    console.log('1. Verifica que el backend esté ejecutándose');
    console.log('2. Comprueba la IP del servidor');
    console.log('3. Verifica la configuración de red');
    console.log('4. Revisa el firewall y antivirus');
  }
  
  console.log('\n📋 Para más información:');
  console.log('- Backend: http://192.168.0.110:3001');
  console.log('- API: http://192.168.0.110:3001/api');
  console.log('- Health: http://192.168.0.110:3001/api/health');
}

// Ejecutar las pruebas
runConnectionTest().catch(error => {
  console.error('❌ Error ejecutando las pruebas:', error);
});
