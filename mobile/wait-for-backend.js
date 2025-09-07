/**
 * Script para esperar a que el backend esté completamente funcional
 * Verifica que todos los endpoints necesarios estén disponibles
 */

const fetch = require('node-fetch');

console.log('⏳ ESPERANDO A QUE EL BACKEND ESTÉ COMPLETAMENTE FUNCIONAL');
console.log('==========================================================');

const baseUrl = 'http://192.168.0.110:3001';
const requiredEndpoints = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/users',
  '/api/products'
];

async function checkEndpoint(endpoint) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

async function waitForBackend() {
  console.log('🚀 Iniciando monitoreo del backend...\n');
  
  let attempts = 0;
  const maxAttempts = 30; // 5 minutos máximo
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`🔍 Intento ${attempts}/${maxAttempts} - Verificando endpoints...`);
    
    const results = await Promise.all(
      requiredEndpoints.map(async (endpoint) => {
        const isAvailable = await checkEndpoint(endpoint);
        return { endpoint, isAvailable };
      })
    );
    
    const availableEndpoints = results.filter(r => r.isAvailable);
    const unavailableEndpoints = results.filter(r => !r.isAvailable);
    
    console.log(`✅ Endpoints disponibles: ${availableEndpoints.length}/${requiredEndpoints.length}`);
    
    if (availableEndpoints.length === requiredEndpoints.length) {
      console.log('\n🎉 ¡BACKEND COMPLETAMENTE FUNCIONAL!');
      console.log('=====================================');
      console.log('✅ Todos los endpoints están disponibles');
      console.log('✅ La app móvil debería funcionar correctamente ahora');
      console.log('\n📱 PRÓXIMOS PASOS:');
      console.log('   1. Abre la app móvil');
      console.log('   2. Ve a la pantalla de login');
      console.log('   3. Prueba hacer login con credenciales válidas');
      console.log('   4. Si hay problemas, usa "🔧 Diagnóstico de Red"');
      return true;
    }
    
    if (unavailableEndpoints.length > 0) {
      console.log('❌ Endpoints faltantes:');
      unavailableEndpoints.forEach(r => {
        console.log(`   • ${r.endpoint}`);
      });
    }
    
    if (attempts < maxAttempts) {
      console.log('⏳ Esperando 10 segundos antes del siguiente intento...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('\n⚠️ TIMEOUT - Backend no está completamente funcional');
  console.log('====================================================');
  console.log('🔧 ACCIONES RECOMENDADAS:');
  console.log('   1. Verifica que el backend esté ejecutándose');
  console.log('   2. Revisa los logs del backend para errores');
  console.log('   3. Comprueba la configuración de la base de datos');
  console.log('   4. Reinicia el backend manualmente');
  
  return false;
}

// Ejecutar monitoreo
waitForBackend().catch(error => {
  console.error('❌ Error en el monitoreo:', error);
});
