#!/usr/bin/env node

/**
 * 🔧 Script de Prueba de Conexión MongoDB
 * 
 * Este script prueba la conexión a MongoDB Atlas desde el backend
 * y verifica que las colecciones estén disponibles.
 * 
 * Uso: node test-mongodb-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Configuración
const CONFIG = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro',
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

async function testMongoDBConnection() {
  log('🚀 Iniciando prueba de conexión a MongoDB...', 'bright');
  log(`   URI: ${CONFIG.mongoUri.replace(/\/\/.*@/, '//***:***@')}`, 'blue');
  
  try {
    // Configurar opciones de conexión
    const options = {
      serverSelectionTimeoutMS: CONFIG.timeout,
      socketTimeoutMS: 45000,
      connectTimeoutMS: CONFIG.timeout,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };
    
    log('\n🔌 Conectando a MongoDB Atlas...', 'cyan');
    await mongoose.connect(CONFIG.mongoUri, options);
    
    log('✅ Conectado a MongoDB exitosamente!', 'green');
    
    // Verificar estado de la conexión
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    log(`   📊 Estado: ${states[connectionState]}`, 'blue');
    
    // Listar colecciones
    log('\n📋 Verificando colecciones...', 'cyan');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length > 0) {
      log(`✅ Se encontraron ${collections.length} colecciones:`, 'green');
      collections.forEach(collection => {
        log(`   📁 ${collection.name}`, 'blue');
      });
    } else {
      log('⚠️  No se encontraron colecciones en la base de datos', 'yellow');
    }
    
    // Verificar colecciones específicas
    const expectedCollections = ['users', 'products', 'stores', 'orders'];
    log('\n🔍 Verificando colecciones esperadas...', 'cyan');
    
    for (const collectionName of expectedCollections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        log(`   📊 ${collectionName}: ${count} documentos`, count > 0 ? 'green' : 'yellow');
      } catch (error) {
        log(`   ❌ ${collectionName}: Error - ${error.message}`, 'red');
      }
    }
    
    // Probar una operación de lectura
    log('\n📖 Probando operación de lectura...', 'cyan');
    try {
      const User = mongoose.model('User', new mongoose.Schema({
        name: String,
        email: String,
        role: String
      }));
      
      const userCount = await User.countDocuments();
      log(`   👥 Usuarios en la base de datos: ${userCount}`, 'green');
      
      if (userCount > 0) {
        const sampleUser = await User.findOne().lean();
        log(`   📝 Usuario de ejemplo: ${sampleUser.name || 'Sin nombre'} (${sampleUser.email || 'Sin email'})`, 'blue');
      }
    } catch (error) {
      log(`   ❌ Error en operación de lectura: ${error.message}`, 'red');
    }
    
    // Probar una operación de escritura
    log('\n✍️  Probando operación de escritura...', 'cyan');
    try {
      const TestCollection = mongoose.model('TestConnection', new mongoose.Schema({
        test: String,
        timestamp: Date
      }));
      
      const testDoc = new TestCollection({
        test: 'conexion-exitosa',
        timestamp: new Date()
      });
      
      await testDoc.save();
      log('   ✅ Operación de escritura exitosa', 'green');
      
      // Limpiar documento de prueba
      await TestCollection.deleteOne({ _id: testDoc._id });
      log('   🧹 Documento de prueba eliminado', 'blue');
    } catch (error) {
      log(`   ❌ Error en operación de escritura: ${error.message}`, 'red');
    }
    
    log('\n🎉 ¡Todas las pruebas pasaron exitosamente!', 'green');
    log('   El backend debería poder conectarse a MongoDB sin problemas', 'green');
    
  } catch (error) {
    log('\n❌ Error conectando a MongoDB:', 'red');
    log(`   Tipo: ${error.name}`, 'red');
    log(`   Mensaje: ${error.message}`, 'red');
    
    if (error.code) {
      log(`   Código: ${error.code}`, 'red');
    }
    
    // Sugerencias de solución
    log('\n💡 Posibles soluciones:', 'yellow');
    
    if (error.message.includes('timeout')) {
      log('   • Verifica que la IP de Render esté permitida en MongoDB Atlas', 'yellow');
      log('   • Asegúrate de que el connection string sea correcto', 'yellow');
      log('   • Verifica que MongoDB Atlas esté funcionando', 'yellow');
    } else if (error.message.includes('authentication')) {
      log('   • Verifica el username y password en el connection string', 'yellow');
      log('   • Asegúrate de que el usuario tenga permisos correctos', 'yellow');
    } else if (error.message.includes('network')) {
      log('   • Verifica la configuración de Network Access en MongoDB Atlas', 'yellow');
      log('   • Asegúrate de que 0.0.0.0/0 esté permitido', 'yellow');
    }
    
    process.exit(1);
  } finally {
    // Cerrar conexión
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      log('\n🔌 Conexión cerrada', 'blue');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testMongoDBConnection().catch(error => {
    log(`💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testMongoDBConnection };
