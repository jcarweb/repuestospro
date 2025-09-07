const fetch = require('node-fetch');

async function checkBackendLogs() {
  console.log('🔍 VERIFICANDO LOGS DEL BACKEND');
  console.log('===============================');
  
  try {
    // Verificar si el backend está ejecutándose
    console.log('\n🔍 Verificando estado del backend...');
    const response = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend está ejecutándose');
      console.log('📄 Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Backend no responde correctamente');
      return;
    }
    
    // Verificar si hay algún endpoint que funcione
    console.log('\n🔍 Verificando endpoints básicos...');
    
    const basicEndpoints = [
      { path: '/', method: 'GET' },
      { path: '/api/health', method: 'GET' },
      { path: '/api/db-status', method: 'GET' }
    ];
    
    for (const endpoint of basicEndpoints) {
      try {
        const url = `http://localhost:3001${endpoint.path}`;
        console.log(`\n🔍 Probando: ${endpoint.method} ${endpoint.path}`);
        
        const response = await fetch(url, {
          method: endpoint.method,
          timeout: 5000
        });
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Endpoint funciona');
          console.log('📄 Respuesta:', JSON.stringify(data, null, 2));
        } else {
          console.log('❌ Endpoint no funciona');
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    // Verificar si hay algún problema con el registro de rutas
    console.log('\n🔍 Verificando si las rutas están registradas...');
    
    // Intentar acceder a una ruta que debería existir
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        timeout: 5000
      });
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.log('❌ Las rutas de autenticación no están registradas');
        console.log('🔧 Posibles causas:');
        console.log('   - El backend no está cargando las rutas correctamente');
        console.log('   - Hay un error en el registro de rutas');
        console.log('   - El backend necesita ser reiniciado');
      } else if (response.status === 400) {
        console.log('✅ Las rutas están registradas (error de validación esperado)');
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
  console.log('\n🔧 RECOMENDACIONES:');
  console.log('1. Reiniciar el backend');
  console.log('2. Verificar que no hay errores en el registro de rutas');
  console.log('3. Verificar que el backend está compilado correctamente');
}

checkBackendLogs().catch(console.error);
