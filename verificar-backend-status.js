#!/usr/bin/env node

/**
 * 🔧 Script de Verificación del Estado del Backend
 * 
 * Este script verifica el estado del backend en Render y
 * proporciona información detallada sobre la conectividad.
 * 
 * Uso: node verificar-backend-status.js
 */

const https = require('https');
const http = require('http');

// Configuración
const CONFIG = {
  backendUrl: 'https://piezasya-back.onrender.com',
  timeout: 15000
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
    const requestOptions = {
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(url, requestOptions, (res) => {
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
  log('🔍 Probando endpoint de salud del backend...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/health`);
    
    if (response.statusCode === 200) {
      log('✅ Endpoint /health respondió correctamente', 'green');
      
      try {
        const data = JSON.parse(response.data);
        log(`   📊 Estado: ${data.status || 'OK'}`, 'blue');
        log(`   ⏰ Timestamp: ${data.timestamp || 'N/A'}`, 'blue');
        log(`   🚀 Uptime: ${data.uptime || 'N/A'}`, 'blue');
      } catch (parseError) {
        log('   ⚠️  Respuesta no es JSON válido', 'yellow');
      }
      
      return true;
    } else {
      log(`❌ Endpoint /health respondió con código ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error conectando al endpoint /health: ${error.message}`, 'red');
    return false;
  }
}

async function testDatabaseStatus() {
  log('\n🗄️ Probando estado de la base de datos...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/api/db-status`);
    
    if (response.statusCode === 200) {
      log('✅ Endpoint /api/db-status respondió correctamente', 'green');
      
      try {
        const data = JSON.parse(response.data);
        
        if (data.connected) {
          log('✅ Base de datos conectada', 'green');
          log(`   📊 Estado: ${data.status}`, 'blue');
          log(`   🏪 Colecciones: ${data.collections?.length || 0}`, 'blue');
          
          if (data.collections && data.collections.length > 0) {
            log('   📁 Colecciones disponibles:', 'blue');
            data.collections.forEach(collection => {
              log(`      • ${collection.name} (${collection.count} documentos)`, 'blue');
            });
          }
        } else {
          log('❌ Base de datos no conectada', 'red');
          log(`   📊 Estado: ${data.status}`, 'red');
          log(`   🔍 Error: ${data.error || 'No especificado'}`, 'red');
        }
        
        return data.connected;
      } catch (parseError) {
        log('   ⚠️  Respuesta no es JSON válido', 'yellow');
        return false;
      }
    } else {
      log(`❌ Endpoint /api/db-status respondió con código ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error conectando al endpoint /api/db-status: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIEndpoints() {
  log('\n🌐 Probando endpoints de la API...', 'cyan');
  
  const endpoints = [
    { path: '/api/products', method: 'GET', description: 'Listar productos' },
    { path: '/api/stores', method: 'GET', description: 'Listar tiendas' },
    { path: '/api/users', method: 'GET', description: 'Listar usuarios' }
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${CONFIG.backendUrl}${endpoint.path}`);
      
      if (response.statusCode === 200 || response.statusCode === 401) {
        log(`   ✅ ${endpoint.description}: OK (${response.statusCode})`, 'green');
        successCount++;
      } else {
        log(`   ❌ ${endpoint.description}: Error ${response.statusCode}`, 'red');
      }
    } catch (error) {
      log(`   ❌ ${endpoint.description}: ${error.message}`, 'red');
    }
  }
  
  return successCount === endpoints.length;
}

async function testCORSConfiguration() {
  log('\n🔒 Probando configuración CORS...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/api/products`, {
      headers: {
        'Origin': 'https://piezasya.vercel.app',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    };
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      log('✅ CORS configurado correctamente', 'green');
      log(`   🌐 Origen permitido: ${corsHeaders['Access-Control-Allow-Origin']}`, 'blue');
      log(`   🔧 Métodos permitidos: ${corsHeaders['Access-Control-Allow-Methods'] || 'N/A'}`, 'blue');
      return true;
    } else {
      log('⚠️  CORS no configurado o mal configurado', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Error probando CORS: ${error.message}`, 'red');
    return false;
  }
}

function printSummary(results) {
  log('\n' + '='.repeat(70), 'bright');
  log('📋 RESUMEN DE VERIFICACIÓN DEL BACKEND', 'bright');
  log('='.repeat(70), 'bright');
  
  const tests = [
    { name: 'Backend Health', result: results.health, critical: true },
    { name: 'Database Connection', result: results.database, critical: true },
    { name: 'API Endpoints', result: results.api, critical: false },
    { name: 'CORS Configuration', result: results.cors, critical: false }
  ];
  
  tests.forEach(test => {
    const status = test.result ? '✅' : '❌';
    const color = test.result ? 'green' : 'red';
    const critical = test.critical ? ' (CRÍTICO)' : '';
    log(`${status} ${test.name}${critical}`, color);
  });
  
  log('\n' + '='.repeat(70), 'bright');
  
  const criticalTests = tests.filter(t => t.critical);
  const criticalPassed = criticalTests.every(t => t.result);
  
  if (criticalPassed) {
    log('🎉 ¡BACKEND FUNCIONANDO CORRECTAMENTE!', 'green');
    log('   El frontend debería poder conectarse sin problemas', 'green');
  } else {
    log('⚠️  PROBLEMAS CRÍTICOS DETECTADOS', 'red');
    log('   El frontend no podrá conectarse al backend', 'red');
    log('   Sigue la guía en SOLUCION_MONGODB_VERCEL.md', 'yellow');
  }
  
  log('='.repeat(70), 'bright');
}

async function main() {
  log('🚀 Iniciando verificación del backend...', 'bright');
  log(`   URL: ${CONFIG.backendUrl}`, 'blue');
  log(`   Timeout: ${CONFIG.timeout}ms`, 'blue');
  
  const results = {
    health: await testBackendHealth(),
    database: false,
    api: false,
    cors: false
  };
  
  // Solo probar base de datos si el backend está funcionando
  if (results.health) {
    results.database = await testDatabaseStatus();
    results.api = await testAPIEndpoints();
    results.cors = await testCORSConfiguration();
  }
  
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
  testDatabaseStatus,
  testAPIEndpoints,
  testCORSConfiguration
};
