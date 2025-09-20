#!/usr/bin/env node

/**
 * 🔧 Script de Configuración Automática MongoDB + Vercel
 * 
 * Este script guía al usuario paso a paso para configurar
 * MongoDB Atlas y Render para que funcione con Vercel.
 * 
 * Uso: node configurar-mongodb-vercel.js
 */

const readline = require('readline');
const https = require('https');

// Configuración
const CONFIG = {
  frontendUrl: 'https://piezasya.vercel.app',
  backendUrl: 'https://piezasya-back.onrender.com',
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

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function askQuestion(question) {
  const rl = createInterface();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function checkCurrentStatus() {
  log('\n🔍 Verificando estado actual del sistema...', 'cyan');
  
  try {
    // Verificar backend
    const backendResponse = await makeRequest(`${CONFIG.backendUrl}/health`);
    const backendOk = backendResponse.statusCode === 200;
    
    // Verificar base de datos
    let databaseOk = false;
    if (backendOk) {
      try {
        const dbResponse = await makeRequest(`${CONFIG.backendUrl}/api/db-status`);
        if (dbResponse.statusCode === 200) {
          const data = JSON.parse(dbResponse.data);
          databaseOk = data.connected;
        }
      } catch (error) {
        // Ignorar errores de base de datos
      }
    }
    
    // Verificar frontend
    const frontendResponse = await makeRequest(CONFIG.frontendUrl);
    const frontendOk = frontendResponse.statusCode === 200;
    
    log('\n📊 Estado actual:', 'blue');
    log(`   Backend: ${backendOk ? '✅ Funcionando' : '❌ No responde'}`, backendOk ? 'green' : 'red');
    log(`   MongoDB: ${databaseOk ? '✅ Conectado' : '❌ No conectado'}`, databaseOk ? 'green' : 'red');
    log(`   Frontend: ${frontendOk ? '✅ Funcionando' : '❌ No responde'}`, frontendOk ? 'green' : 'red');
    
    return { backendOk, databaseOk, frontendOk };
  } catch (error) {
    log(`❌ Error verificando estado: ${error.message}`, 'red');
    return { backendOk: false, databaseOk: false, frontendOk: false };
  }
}

async function guideMongoDBSetup() {
  log('\n🗄️ CONFIGURACIÓN DE MONGODB ATLAS', 'bright');
  log('='.repeat(50), 'bright');
  
  log('\n1. Accede a MongoDB Atlas:', 'cyan');
  log('   https://cloud.mongodb.com', 'blue');
  
  log('\n2. Verifica Network Access:', 'cyan');
  log('   • Ve a "Network Access" en el menú lateral', 'yellow');
  log('   • Asegúrate de tener una regla: 0.0.0.0/0', 'yellow');
  log('   • Si no existe, haz clic en "Add IP Address"', 'yellow');
  
  log('\n3. Verifica Database Access:', 'cyan');
  log('   • Ve a "Database Access" en el menú lateral', 'yellow');
  log('   • Asegúrate de tener un usuario con permisos de lectura/escritura', 'yellow');
  log('   • Si no tienes usuario, crea uno:', 'yellow');
  log('     - Username: repuestos-admin', 'blue');
  log('     - Password: [genera una contraseña segura]', 'blue');
  log('     - Database User Privileges: "Read and write to any database"', 'blue');
  
  log('\n4. Obtén el Connection String:', 'cyan');
  log('   • Ve a "Database" en el menú lateral', 'yellow');
  log('   • Haz clic en "Connect"', 'yellow');
  log('   • Selecciona "Connect your application"', 'yellow');
  log('   • Driver: Node.js, Version: 5.0 or later', 'yellow');
  log('   • Copia el connection string', 'yellow');
  
  const connectionString = await askQuestion('\n📝 Pega tu connection string aquí: ');
  
  if (!connectionString || !connectionString.includes('mongodb+srv://')) {
    log('❌ Connection string inválido', 'red');
    return null;
  }
  
  log('✅ Connection string válido', 'green');
  return connectionString;
}

async function guideRenderSetup(connectionString) {
  log('\n🚀 CONFIGURACIÓN DE RENDER', 'bright');
  log('='.repeat(50), 'bright');
  
  log('\n1. Accede a Render Dashboard:', 'cyan');
  log('   https://dashboard.render.com', 'blue');
  
  log('\n2. Selecciona tu servicio del backend:', 'cyan');
  log('   • Busca "piezasya-back" o similar', 'yellow');
  log('   • Haz clic en el nombre del servicio', 'yellow');
  
  log('\n3. Ve a la sección Environment:', 'cyan');
  log('   • En el menú lateral, haz clic en "Environment"', 'yellow');
  log('   • Haz clic en "Add Environment Variable"', 'yellow');
  
  log('\n4. Agrega estas variables de entorno:', 'cyan');
  
  const envVars = {
    'MONGODB_URI': connectionString,
    'PORT': '10000',
    'NODE_ENV': 'production',
    'JWT_SECRET': 'tu-super-secreto-jwt-muy-seguro-cambiar-en-produccion',
    'JWT_EXPIRES_IN': '7d',
    'CORS_ORIGIN': 'https://piezasya.vercel.app',
    'FRONTEND_URL': 'https://piezasya.vercel.app',
    'RATE_LIMIT_WINDOW_MS': '900000',
    'RATE_LIMIT_MAX_REQUESTS': '100'
  };
  
  log('\n📋 Variables a agregar:', 'blue');
  Object.entries(envVars).forEach(([key, value]) => {
    log(`   ${key}=${value}`, 'blue');
  });
  
  log('\n5. Reinicia el servicio:', 'cyan');
  log('   • Después de agregar las variables, haz clic en "Manual Deploy"', 'yellow');
  log('   • Selecciona "Deploy latest commit"', 'yellow');
  log('   • Espera a que el despliegue termine', 'yellow');
  
  const continueSetup = await askQuestion('\n¿Has completado la configuración en Render? (y/n): ');
  
  if (continueSetup.toLowerCase() !== 'y') {
    log('⚠️  Configuración incompleta. Continúa cuando esté listo.', 'yellow');
    return false;
  }
  
  return true;
}

async function verifyConfiguration() {
  log('\n🔍 Verificando configuración...', 'cyan');
  
  try {
    // Verificar backend
    const backendResponse = await makeRequest(`${CONFIG.backendUrl}/health`);
    if (backendResponse.statusCode !== 200) {
      log('❌ Backend no responde', 'red');
      return false;
    }
    
    // Verificar base de datos
    const dbResponse = await makeRequest(`${CONFIG.backendUrl}/api/db-status`);
    if (dbResponse.statusCode !== 200) {
      log('❌ No se puede verificar la base de datos', 'red');
      return false;
    }
    
    const data = JSON.parse(dbResponse.data);
    if (!data.connected) {
      log('❌ Base de datos no conectada', 'red');
      return false;
    }
    
    log('✅ Configuración verificada correctamente', 'green');
    return true;
  } catch (error) {
    log(`❌ Error verificando configuración: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 CONFIGURACIÓN AUTOMÁTICA MONGODB + VERCEL', 'bright');
  log('='.repeat(60), 'bright');
  
  // Verificar estado actual
  const status = await checkCurrentStatus();
  
  if (status.databaseOk) {
    log('\n🎉 ¡El sistema ya está funcionando correctamente!', 'green');
    log('   MongoDB está conectado y funcionando', 'green');
    return;
  }
  
  if (!status.backendOk) {
    log('\n❌ El backend no está funcionando', 'red');
    log('   Verifica que el servicio esté desplegado en Render', 'yellow');
    return;
  }
  
  // Guiar configuración de MongoDB
  const connectionString = await guideMongoDBSetup();
  if (!connectionString) {
    log('\n❌ Configuración cancelada', 'red');
    return;
  }
  
  // Guiar configuración de Render
  const renderConfigured = await guideRenderSetup(connectionString);
  if (!renderConfigured) {
    log('\n⚠️  Configuración incompleta', 'yellow');
    return;
  }
  
  // Verificar configuración
  log('\n⏳ Esperando que el servicio se reinicie...', 'yellow');
  log('   Esto puede tomar 1-2 minutos...', 'yellow');
  
  // Esperar un poco para que el servicio se reinicie
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  const verified = await verifyConfiguration();
  
  if (verified) {
    log('\n🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!', 'green');
    log('   El sistema debería funcionar correctamente ahora', 'green');
    log('   Ve a https://piezasya.vercel.app para verificar', 'blue');
  } else {
    log('\n⚠️  La configuración no se completó correctamente', 'yellow');
    log('   Revisa los logs de Render para más información', 'yellow');
    log('   Ejecuta "node diagnostico-completo.js" para más detalles', 'blue');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    log(`💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkCurrentStatus,
  guideMongoDBSetup,
  guideRenderSetup,
  verifyConfiguration
};
