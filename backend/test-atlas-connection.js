const mongoose = require('mongoose');
require('dotenv').config();

async function testAtlasConnection() {
  try {
    console.log('🔍 Probando conexión a MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
    
    // Método 1: Conexión directa
    console.log('\n📡 Intentando conexión directa...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    
    // Verificar que podemos hacer operaciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Colecciones disponibles:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code === 'ESERVFAIL') {
      console.log('\n💡 Soluciones para ESERVFAIL:');
      console.log('1. Verifica tu conexión a internet');
      console.log('2. Intenta cambiar DNS a 8.8.8.8 o 1.1.1.1');
      console.log('3. El problema puede ser temporal, intenta en unos minutos');
      console.log('4. Verifica que la URI de MongoDB Atlas sea correcta');
    }
  }
}

testAtlasConnection(); 