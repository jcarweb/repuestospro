#!/usr/bin/env node

/**
 * 🔧 Diagnóstico Completo del Sistema
 * 
 * Este script realiza un diagnóstico completo del sistema:
 * 1. Verifica el estado del backend en Render
 * 2. Verifica la conectividad con MongoDB Atlas
 * 3. Verifica la configuración del frontend en Vercel
 * 4. Proporciona recomendaciones de solución
 * 
 * Uso: node diagnostico-completo.js
 */

const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuración
const CONFIG = {
  frontendUrl: 'https://piezasya.vercel.app',
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
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...options.headers
      }
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

async function checkBackendHealth() {
  log('\n🔍 1. Verificando salud del backend...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/health`);
    
    if (response.statusCode === 200) {
      log('✅ Backend está funcionando', 'green');
      return { status: 'ok', details: response.data };
    } else {
      log(`❌ Backend respondió con código ${response.statusCode}`, 'red');
      return { status: 'error', code: response.statusCode };
    }
  } catch (error) {
    log(`❌ Error conectando al backend: ${error.message}`, 'red');
    return { status: 'error', message: error.message };
  }
}

async function checkDatabaseConnection() {
  log('\n🗄️ 2. Verificando conexión a MongoDB...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/api/db-status`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      
      if (data.connected) {
        log('✅ MongoDB conectado correctamente', 'green');
        log(`   📊 Estado: ${data.status}`, 'blue');
        log(`   🏪 Colecciones: ${data.collections?.length || 0}`, 'blue');
        return { status: 'ok', connected: true, collections: data.collections?.length || 0 };
      } else {
        log('❌ MongoDB no conectado', 'red');
        log(`   📊 Estado: ${data.status}`, 'red');
        return { status: 'error', connected: false, reason: data.status };
      }
    } else {
      log(`❌ Error verificando base de datos: ${response.statusCode}`, 'red');
      return { status: 'error', code: response.statusCode };
    }
  } catch (error) {
    log(`❌ Error en verificación de base de datos: ${error.message}`, 'red');
    return { status: 'error', message: error.message };
  }
}

async function checkFrontendStatus() {
  log('\n🌐 3. Verificando estado del frontend...', 'cyan');
  
  try {
    const response = await makeRequest(CONFIG.frontendUrl);
    
    if (response.statusCode === 200) {
      log('✅ Frontend está funcionando', 'green');
      
      // Verificar si hay indicios de datos mock
      const hasMockData = response.data.includes('datos mock') || 
                         response.data.includes('mock') ||
                         response.data.includes('ProfileService: Error de conectividad');
      
      if (hasMockData) {
        log('⚠️  Se detectaron indicios de datos mock', 'yellow');
        return { status: 'ok', mockData: true };
      } else {
        log('✅ No se detectaron datos mock', 'green');
        return { status: 'ok', mockData: false };
      }
    } else {
      log(`❌ Frontend respondió con código ${response.statusCode}`, 'red');
      return { status: 'error', code: response.statusCode };
    }
  } catch (error) {
    log(`❌ Error verificando frontend: ${error.message}`, 'red');
    return { status: 'error', message: error.message };
  }
}

async function checkAPIConnectivity() {
  log('\n🔗 4. Verificando conectividad API...', 'cyan');
  
  try {
    // Simular una petición que haría el frontend
    const response = await makeRequest(`${CONFIG.backendUrl}/api/profile`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 401 || response.statusCode === 200) {
      log('✅ API responde correctamente', 'green');
      return { status: 'ok', code: response.statusCode };
    } else {
      log(`❌ API respondió con código inesperado ${response.statusCode}`, 'red');
      return { status: 'error', code: response.statusCode };
    }
  } catch (error) {
    log(`❌ Error en conectividad API: ${error.message}`, 'red');
    return { status: 'error', message: error.message };
  }
}

async function checkCORSConfiguration() {
  log('\n🔒 5. Verificando configuración CORS...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/api/products`, {
      headers: {
        'Origin': CONFIG.frontendUrl,
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
      return { status: 'ok', headers: corsHeaders };
    } else {
      log('⚠️  CORS no configurado o mal configurado', 'yellow');
      return { status: 'warning', headers: corsHeaders };
    }
  } catch (error) {
    log(`❌ Error verificando CORS: ${error.message}`, 'red');
    return { status: 'error', message: error.message };
  }
}

function generateRecommendations(results) {
  log('\n💡 RECOMENDACIONES DE SOLUCIÓN:', 'yellow');
  
  if (results.backend.status === 'error') {
    log('\n🔧 Problema: Backend no responde', 'red');
    log('   • Verifica que el servicio esté desplegado en Render', 'yellow');
    log('   • Revisa los logs de Render para errores', 'yellow');
    log('   • Asegúrate de que el puerto esté configurado correctamente', 'yellow');
  }
  
  if (results.database.status === 'error' || !results.database.connected) {
    log('\n🔧 Problema: MongoDB no conectado', 'red');
    log('   • Verifica la variable MONGODB_URI en Render', 'yellow');
    log('   • Asegúrate de que la IP de Render esté permitida en MongoDB Atlas', 'yellow');
    log('   • Verifica que el usuario tenga permisos correctos', 'yellow');
    log('   • Revisa que el connection string sea válido', 'yellow');
  }
  
  if (results.frontend.mockData) {
    log('\n🔧 Problema: Frontend usando datos mock', 'red');
    log('   • El backend no puede conectarse a MongoDB', 'yellow');
    log('   • Sigue las recomendaciones anteriores para MongoDB', 'yellow');
    log('   • Verifica que el frontend esté apuntando al backend correcto', 'yellow');
  }
  
  if (results.api.status === 'error') {
    log('\n🔧 Problema: API no responde', 'red');
    log('   • Verifica que las rutas estén configuradas correctamente', 'yellow');
    log('   • Revisa los logs del backend para errores', 'yellow');
  }
  
  if (results.cors.status === 'warning' || results.cors.status === 'error') {
    log('\n🔧 Problema: CORS mal configurado', 'red');
    log('   • Verifica la configuración CORS en el backend', 'yellow');
    log('   • Asegúrate de que el frontend esté en la lista de orígenes permitidos', 'yellow');
  }
}

function printSummary(results) {
  log('\n' + '='.repeat(80), 'bright');
  log('📋 DIAGNÓSTICO COMPLETO DEL SISTEMA', 'bright');
  log('='.repeat(80), 'bright');
  
  const tests = [
    { name: 'Backend Health', result: results.backend.status === 'ok', critical: true },
    { name: 'MongoDB Connection', result: results.database.connected, critical: true },
    { name: 'Frontend Status', result: results.frontend.status === 'ok', critical: true },
    { name: 'API Connectivity', result: results.api.status === 'ok', critical: true },
    { name: 'CORS Configuration', result: results.cors.status === 'ok', critical: false }
  ];
  
  tests.forEach(test => {
    const status = test.result ? '✅' : '❌';
    const color = test.result ? 'green' : 'red';
    const critical = test.critical ? ' (CRÍTICO)' : '';
    log(`${status} ${test.name}${critical}`, color);
  });
  
  log('\n' + '='.repeat(80), 'bright');
  
  const criticalTests = tests.filter(t => t.critical);
  const criticalPassed = criticalTests.every(t => t.result);
  
  if (criticalPassed && !results.frontend.mockData) {
    log('🎉 ¡SISTEMA FUNCIONANDO PERFECTAMENTE!', 'green');
    log('   El frontend debería cargar datos reales de MongoDB', 'green');
  } else if (criticalPassed && results.frontend.mockData) {
    log('⚠️  SISTEMA FUNCIONANDO CON DATOS MOCK', 'yellow');
    log('   El frontend está usando datos mock en lugar de MongoDB', 'yellow');
  } else {
    log('❌ PROBLEMAS CRÍTICOS DETECTADOS', 'red');
    log('   El sistema no puede funcionar correctamente', 'red');
  }
  
  log('='.repeat(80), 'bright');
}

async function main() {
  log('🚀 Iniciando diagnóstico completo del sistema...', 'bright');
  log(`   Frontend: ${CONFIG.frontendUrl}`, 'blue');
  log(`   Backend: ${CONFIG.backendUrl}`, 'blue');
  
  const results = {
    backend: await checkBackendHealth(),
    database: await checkDatabaseConnection(),
    frontend: await checkFrontendStatus(),
    api: await checkAPIConnectivity(),
    cors: await checkCORSConfiguration()
  };
  
  printSummary(results);
  generateRecommendations(results);
  
  log('\n📚 Para más información, consulta:', 'cyan');
  log('   • SOLUCION_MONGODB_VERCEL.md', 'blue');
  log('   • MONGODB_SETUP.md', 'blue');
  log('   • DEPLOYMENT_GUIDE.md', 'blue');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    log(`💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkBackendHealth,
  checkDatabaseConnection,
  checkFrontendStatus,
  checkAPIConnectivity,
  checkCORSConfiguration
};
