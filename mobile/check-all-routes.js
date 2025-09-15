const fetch = require('node-fetch');

async function checkAllRoutes() {
  console.log('🔍 VERIFICANDO TODAS LAS RUTAS DISPONIBLES');
  console.log('==========================================');
  
  const baseUrl = 'http://localhost:3001';
  
  // Lista de rutas a verificar
  const routes = [
    // Rutas básicas
    { path: '/', method: 'GET' },
    { path: '/health', method: 'GET' },
    { path: '/api/health', method: 'GET' },
    
    // Rutas de autenticación
    { path: '/api/auth/login', method: 'POST' },
    { path: '/api/auth/register', method: 'POST' },
    { path: '/api/auth/profile', method: 'GET' },
    { path: '/api/auth/verify', method: 'GET' },
    { path: '/api/auth/logout', method: 'POST' },
    
    // Rutas de productos
    { path: '/api/products', method: 'GET' },
    
    // Rutas de categorías
    { path: '/api/categories', method: 'GET' },
    
    // Rutas de marcas
    { path: '/api/brands', method: 'GET' },
    
    // Rutas de tiendas
    { path: '/api/stores', method: 'GET' },
    
    // Rutas de perfil
    { path: '/api/profile', method: 'GET' },
  ];
  
  for (const route of routes) {
    try {
      const url = `${baseUrl}${route.path}`;
      console.log(`\n🔍 Probando: ${route.method} ${route.path}`);
      
      const options = {
        method: route.method,
        timeout: 3000
      };
      
      if (route.method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({});
      }
      
      const response = await fetch(url, options);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        console.log('✅ Ruta funciona correctamente');
      } else if (response.status === 404) {
        console.log('❌ Ruta no encontrada');
      } else if (response.status === 401) {
        console.log('✅ Ruta existe (requiere autenticación)');
      } else if (response.status === 400) {
        console.log('✅ Ruta existe (error de validación)');
      } else if (response.status === 405) {
        console.log('✅ Ruta existe (método no permitido)');
      } else {
        console.log(`⚠️ Respuesta inesperada: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎯 VERIFICACIÓN COMPLETADA');
  console.log('==========================');
}

checkAllRoutes().catch(console.error);
