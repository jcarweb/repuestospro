const fetch = require('node-fetch');

async function checkBackendStatus() {
  console.log('🔍 VERIFICANDO ESTADO DEL BACKEND');
  console.log('=================================');
  
  try {
    // Verificar si el backend está ejecutándose
    console.log('\n🔍 Verificando si el backend está ejecutándose...');
    const response = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend está ejecutándose');
      console.log('📄 Respuesta:', data);
    } else {
      console.log('❌ Backend no responde correctamente');
      return;
    }
    
    // Verificar endpoints específicos
    console.log('\n🔍 Verificando endpoints específicos...');
    
    const endpoints = [
      { url: 'http://localhost:3001/api/auth/login', method: 'POST', body: {} },
      { url: 'http://localhost:3001/api/auth/profile', method: 'GET', body: null },
      { url: 'http://localhost:3001/api/auth/verify', method: 'GET', body: null }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Probando: ${endpoint.method} ${endpoint.url}`);
        
        const options = {
          method: endpoint.method,
          timeout: 5000
        };
        
        if (endpoint.body !== null) {
          options.headers = { 'Content-Type': 'application/json' };
          options.body = JSON.stringify(endpoint.body);
        }
        
        const response = await fetch(endpoint.url, options);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 404) {
          console.log('❌ Endpoint no encontrado');
        } else if (response.status === 401) {
          console.log('✅ Endpoint existe (requiere autenticación)');
        } else if (response.status === 400) {
          console.log('✅ Endpoint existe (error de validación)');
        } else {
          console.log(`⚠️ Respuesta inesperada: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    // Verificar si hay algún problema con el registro de rutas
    console.log('\n🔍 Verificando registro de rutas...');
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.status === 401) {
        console.log('✅ Ruta /api/auth/verify existe (requiere token)');
      } else if (response.status === 404) {
        console.log('❌ Ruta /api/auth/verify no encontrada');
      } else {
        console.log(`⚠️ Respuesta inesperada: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error verificando rutas: ${error.message}`);
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
  
  console.log('\n🎯 VERIFICACIÓN COMPLETADA');
  console.log('==========================');
}

checkBackendStatus().catch(console.error);
