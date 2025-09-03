const fetch = require('node-fetch');

console.log('🔧 PRUEBA DE CONECTIVIDAD DEL BACKEND');
console.log('=====================================\n');

const BACKEND_URL = 'http://192.168.150.104:3001';

// Función para probar endpoint
async function testEndpoint(url, description) {
  try {
    console.log(`🔍 Probando: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`   ✅ Response:`, JSON.stringify(data, null, 2));
      } catch (jsonError) {
        console.log(`   ⚠️ Response no es JSON válido:`, jsonError.message);
      }
    } else {
      console.log(`   ❌ Error HTTP: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error de conexión:`, error.message);
  }
  
  console.log('');
}

// Función para probar endpoint con token
async function testAuthenticatedEndpoint(url, token, description) {
  try {
    console.log(`🔍 Probando: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 5000,
    });
    
    console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`   ✅ Response:`, JSON.stringify(data, null, 2));
      } catch (jsonError) {
        console.log(`   ⚠️ Response no es JSON válido:`, jsonError.message);
      }
    } else {
      console.log(`   ❌ Error HTTP: ${response.status}`);
      try {
        const errorData = await response.json();
        console.log(`   ❌ Error details:`, JSON.stringify(errorData, null, 2));
      } catch (jsonError) {
        console.log(`   ❌ No se pudo leer error details`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error de conexión:`, error.message);
  }
  
  console.log('');
}

// Función principal
async function main() {
  console.log('🌐 PROBANDO ENDPOINTS BÁSICOS...\n');
  
  // Probar endpoints básicos
  await testEndpoint(`${BACKEND_URL}/health`, 'Health Check');
  await testEndpoint(`${BACKEND_URL}/api/health`, 'API Health Check');
  
  console.log('🔐 PROBANDO ENDPOINTS AUTENTICADOS...\n');
  
  // Probar endpoints que requieren autenticación
  const testToken = 'test-token-invalid'; // Token inválido para probar manejo de errores
  
  await testAuthenticatedEndpoint(
    `${BACKEND_URL}/api/profile`, 
    testToken, 
    'Profile (Token Inválido)'
  );
  
  console.log('📋 RESUMEN:');
  console.log('===========');
  console.log('✅ Si health check funciona: Backend está ejecutándose');
  console.log('✅ Si profile devuelve 401: Middleware de auth funciona');
  console.log('❌ Si hay errores de conexión: Problema de red');
  console.log('❌ Si hay errores 500: Problema en el código del backend');
}

// Ejecutar pruebas
main().catch(console.error);
