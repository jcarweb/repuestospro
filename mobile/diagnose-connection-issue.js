const fetch = require('node-fetch');

async function diagnoseConnection() {
  console.log('🔍 DIAGNOSTICANDO PROBLEMAS DE CONEXIÓN');
  console.log('=====================================');
  
  const endpoints = [
    'http://localhost:3001/api/health',
    'http://192.168.0.110:3001/api/health',
    'http://127.0.0.1:3001/api/health'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.text();
        console.log(`✅ Conexión exitosa: ${response.status} ${response.statusText}`);
        console.log(`📄 Respuesta: ${data.substring(0, 100)}...`);
      } else {
        console.log(`⚠️ Respuesta no exitosa: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
  }
  
  // Probar endpoints de autenticación
  console.log('\n🔍 PROBANDO ENDPOINTS DE AUTENTICACIÓN');
  console.log('=====================================');
  
  const authEndpoints = [
    'http://localhost:3001/api/auth/login',
    'http://192.168.0.110:3001/api/auth/login',
    'http://localhost:3001/api/auth/profile',
    'http://192.168.0.110:3001/api/auth/profile'
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      console.log(`\n🔍 Probando: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        timeout: 5000
      });
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 400 || response.status === 401) {
        console.log(`✅ Endpoint existe (error esperado por datos vacíos)`);
      } else if (response.status === 404) {
        console.log(`❌ Endpoint no encontrado`);
      } else {
        console.log(`⚠️ Respuesta inesperada: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
  }
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
  console.log('========================');
}

diagnoseConnection().catch(console.error);
