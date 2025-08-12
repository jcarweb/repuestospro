const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Probando conexión usando configuración del .env...');
    console.log('URI:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI no está configurada en el .env');
      return;
    }
    
    // Intentar conexión con timeout extendido
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
    });
    
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    
    // Verificar que podemos hacer una consulta simple
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Colecciones encontradas: ${collections.length}`);
    
    for (const collection of collections) {
      console.log(`   - ${collection.name}`);
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`     Documentos: ${count}`);
    }
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code === 'ESERVFAIL') {
      console.log('\n💡 El error ESERVFAIL indica un problema de resolución DNS');
      console.log('   - Verificar conectividad de internet');
      console.log('   - Verificar que el cluster de MongoDB Atlas esté activo');
      console.log('   - Intentar más tarde (puede ser temporal)');
    }
  }
}

testConnection(); 