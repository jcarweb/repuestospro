#!/usr/bin/env node

/**
 * 🔧 Script de Verificación de Conectividad MongoDB
 * 
 * Este script verifica la conectividad entre:
 * 1. Frontend (Vercel) -> Backend (Render)
 * 2. Backend (Render) -> MongoDB Atlas
 * 
 * Uso: node verificar-conectividad-mongodb.js
 */

const https = require('https');
const http = require('http');

// Configuración
const CONFIG = {
  frontendUrl: 'https://piezasya.vercel.app',
  backendUrl: 'https://piezasya-back.onrender.com/api',
  timeout: 10000
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: CONFIG.timeout,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testBackendHealth() {
  log('\n🔍 Probando salud del backend...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl.replace('/api', '')}/health`);
    
    if (response.statusCode === 200) {
      log('✅ Backend está funcionando correctamente', 'green');
      return true;
    } else {
      log(`❌ Backend respondió con código ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error conectando al backend: ${error.message}`, 'red');
    return false;
  }
}

async function testBackendDatabase() {
  log('\n🗄️ Probando conexión del backend a MongoDB...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/db-status`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.connected) {
        log('✅ Backend conectado a MongoDB exitosamente', 'green');
        log(`   📊 Estado: ${data.status}`, 'blue');
        log(`   🏪 Colecciones: ${data.collections?.length || 0}`, 'blue');
        return true;
      } else {
        log('❌ Backend no está conectado a MongoDB', 'red');
        log(`   📊 Estado: ${data.status}`, 'red');
        return false;
      }
    } else {
      log(`❌ Backend respondió con código ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error verificando base de datos: ${error.message}`, 'red');
    return false;
  }
}

async function testFrontendBackendConnection() {
  log('\n🌐 Probando conexión frontend -> backend...', 'cyan');
  
  try {
    // Simular una petición que haría el frontend
    const response = await makeRequest(`${CONFIG.backendUrl}/profile`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    // Esperamos un 401 (no autorizado) o 200 (autorizado)
    if (response.statusCode === 401 || response.statusCode === 200) {
      log('✅ Frontend puede conectarse al backend', 'green');
      return true;
    } else {
      log(`❌ Backend respondió con código inesperado ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error en conexión frontend->backend: ${error.message}`, 'red');
    return false;
  }
}

async function testFrontendMockData() {
  log('\n🎭 Verificando si el frontend usa datos mock...', 'cyan');
  
  try {
    // Hacer una petición al frontend para ver si está funcionando
    const response = await makeRequest(CONFIG.frontendUrl);
    
    if (response.statusCode === 200) {
      log('✅ Frontend está funcionando', 'green');
      
      // Verificar si hay scripts que indiquen uso de datos mock
      if (response.data.includes('datos mock') || response.data.includes('mock')) {
        log('⚠️  El frontend puede estar usando datos mock', 'yellow');
        log('   💡 Revisa la consola del navegador para confirmar', 'yellow');
      } else {
        log('✅ No se detectaron indicios de datos mock en el HTML', 'green');
      }
      return true;
    } else {
      log(`❌ Frontend respondió con código ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error verificando frontend: ${error.message}`, 'red');
    return false;
  }
}

function printSummary(results) {
  log('\n' + '='.repeat(60), 'bright');
  log('📋 RESUMEN DE VERIFICACIÓN', 'bright');
  log('='.repeat(60), 'bright');
  
  const tests = [
    { name: 'Backend Health', result: results.backendHealth },
    { name: 'Backend -> MongoDB', result: results.backendDatabase },
    { name: 'Frontend -> Backend', result: results.frontendBackend },
    { name: 'Frontend Status', result: results.frontendStatus }
  ];
  
  tests.forEach(test => {
    const status = test.result ? '✅' : '❌';
    const color = test.result ? 'green' : 'red';
    log(`${status} ${test.name}`, color);
  });
  
  log('\n' + '='.repeat(60), 'bright');
  
  if (results.backendHealth && results.backendDatabase && results.frontendBackend) {
    log('🎉 ¡SISTEMA FUNCIONANDO CORRECTAMENTE!', 'green');
    log('   El frontend debería cargar datos reales de MongoDB', 'green');
  } else {
    log('⚠️  PROBLEMAS DETECTADOS', 'yellow');
    log('   Sigue la guía en SOLUCION_MONGODB_VERCEL.md', 'yellow');
  }
  
  log('='.repeat(60), 'bright');
}

async function main() {
  log('🚀 Iniciando verificación de conectividad MongoDB...', 'bright');
  log(`   Frontend: ${CONFIG.frontendUrl}`, 'blue');
  log(`   Backend: ${CONFIG.backendUrl}`, 'blue');
  
  const results = {
    backendHealth: await testBackendHealth(),
    backendDatabase: false,
    frontendBackend: false,
    frontendStatus: false
  };
  
  // Solo probar base de datos si el backend está funcionando
  if (results.backendHealth) {
    results.backendDatabase = await testBackendDatabase();
    results.frontendBackend = await testBackendDatabase();
  }
  
  results.frontendStatus = await testFrontendMockData();
  
  printSummary(results);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    log(`💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testBackendHealth,
  testBackendDatabase,
  testFrontendBackendConnection,
  testFrontendMockData
};
