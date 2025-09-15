const fetch = require('node-fetch');

// Configuración
const API_BASE = 'http://192.168.150.104:3001/api';
const TEST_TOKEN = 'test-token'; // Token de prueba

// Datos de prueba para el perfil
const testProfileData = {
  name: 'Usuario de Prueba',
  email: 'test@example.com',
  phone: '+57 300 123 4567'
};

// Función para probar endpoints de perfil
async function testProfileEndpoints() {
  console.log('🧪 PRUEBA DE ENDPOINTS DE PERFIL');
  console.log('================================\n');

  const endpoints = [
    { path: '/profile', method: 'GET', description: 'Obtener perfil' },
    { path: '/profile', method: 'PUT', description: 'Actualizar perfil', body: testProfileData },
    { path: '/profile/activities', method: 'GET', description: 'Obtener actividades' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Probando: ${endpoint.description}`);
      console.log(`   ${endpoint.method} ${endpoint.path}`);
      
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(`${API_BASE}${endpoint.path}`, options);
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`   ✅ Respuesta exitosa:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
        } catch (parseError) {
          console.log(`   ✅ Respuesta exitosa (no JSON):`, response.statusText);
        }
      } else {
        try {
          const errorData = await response.json();
          console.log(`   ❌ Error:`, JSON.stringify(errorData, null, 2).substring(0, 200) + '...');
        } catch (parseError) {
          console.log(`   ❌ Error: ${response.statusText}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error de conexión:`, error.message);
    }
    
    console.log(''); // Línea en blanco
  }
}

// Función para probar conectividad básica
async function testBasicConnectivity() {
  console.log('🌐 PRUEBA DE CONECTIVIDAD BÁSICA');
  console.log('================================\n');

  try {
    // Probar endpoint de health
    console.log('🔍 Probando endpoint de health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check exitoso:', healthData.message);
    } else {
      console.log('❌ Health check falló:', healthResponse.status, healthResponse.statusText);
    }
    
    // Probar endpoint raíz
    console.log('\n🔍 Probando endpoint raíz de la API...');
    const rootResponse = await fetch(`${API_BASE}`);
    
    if (rootResponse.ok || rootResponse.status === 404) {
      console.log('✅ Endpoint raíz accesible:', rootResponse.status, rootResponse.statusText);
    } else {
      console.log('❌ Endpoint raíz falló:', rootResponse.status, rootResponse.statusText);
    }
    
  } catch (error) {
    console.log('❌ Error de conectividad:', error.message);
  }
}

// Función principal
async function runTests() {
  console.log('🚀 INICIANDO PRUEBAS DE API DE PERFIL');
  console.log('=====================================\n');
  
  await testBasicConnectivity();
  console.log('\n' + '='.repeat(50) + '\n');
  await testProfileEndpoints();
  
  console.log('\n📋 RESUMEN DE PRUEBAS');
  console.log('=====================');
  console.log('• Si las pruebas de conectividad fallan, hay un problema de red');
  console.log('• Si las pruebas de perfil fallan con 401, hay un problema de autenticación');
  console.log('• Si las pruebas de perfil fallan con 500, hay un problema del servidor');
  console.log('\n💡 Para la app móvil:');
  console.log('• Verifica que estés en la misma red WiFi');
  console.log('• Verifica que la IP esté configurada correctamente');
  console.log('• Reinicia la app después de cambiar la configuración');
}

// Ejecutar pruebas
runTests().catch(console.error);
