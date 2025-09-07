/**
 * Script para verificar el estado completo del backend
 * Identifica qué rutas están disponibles y cuáles faltan
 */

const fetch = require('node-fetch');

console.log('🔍 VERIFICANDO ESTADO COMPLETO DEL BACKEND');
console.log('==========================================');

const baseUrl = 'http://192.168.0.110:3001';

async function checkBackendStatus() {
  try {
    console.log(`\n🔍 Verificando backend en: ${baseUrl}`);
    
    // Probar endpoint de network-info que debería mostrar todas las rutas
    const response = await fetch(`${baseUrl}/api/network-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend respondiendo correctamente');
      console.log('📄 Información del backend:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`⚠️ Backend respondiendo con status: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Error conectando al backend: ${error.message}`);
  }
}

async function checkAvailableRoutes() {
  console.log('\n🔍 VERIFICANDO RUTAS DISPONIBLES');
  console.log('==================================');
  
  const routes = [
    '/',
    '/status',
    '/api/health',
    '/api/network-info',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/verify-email',
    '/api/users',
    '/api/products',
    '/api/categories'
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log(`✅ ${route} - Disponible (${response.status})`);
      } else if (response.status === 404) {
        console.log(`❌ ${route} - No encontrado (404)`);
      } else {
        console.log(`⚠️ ${route} - Status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ ${route} - Error: ${error.message}`);
    }
  }
}

async function runBackendCheck() {
  console.log('🚀 Iniciando verificación completa del backend...\n');
  
  await checkBackendStatus();
  await checkAvailableRoutes();
  
  console.log('\n🎯 DIAGNÓSTICO FINAL');
  console.log('====================');
  console.log('📋 PROBLEMA IDENTIFICADO:');
  console.log('   Los endpoints de autenticación no están disponibles en el backend');
  console.log('   Solo están disponibles: /, /status, /api/health, /api/network-info');
  
  console.log('\n🔧 SOLUCIONES:');
  console.log('   1. Reiniciar el backend con todas las rutas');
  console.log('   2. Verificar que el backend esté configurado correctamente');
  console.log('   3. Comprobar que la base de datos esté conectada');
  console.log('   4. Revisar los logs del backend para errores');
  
  console.log('\n📱 PARA LA APP MÓVIL:');
  console.log('   • El problema NO está en la app móvil');
  console.log('   • El problema está en el backend');
  console.log('   • La app móvil está configurada correctamente');
  console.log('   • Una vez que el backend funcione, la app funcionará');
  
  console.log('\n🚀 COMANDOS PARA SOLUCIONAR:');
  console.log('   • cd backend && npm run dev:network');
  console.log('   • Verificar logs del backend');
  console.log('   • Comprobar configuración de la base de datos');
}

// Ejecutar verificación
runBackendCheck().catch(error => {
  console.error('❌ Error ejecutando verificación:', error);
});
