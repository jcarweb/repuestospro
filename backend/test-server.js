const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a MongoDB...');
    
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro';
    console.log('URI:', uri);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB exitosamente');
    
    // Probar una operación simple
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Colecciones disponibles:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
  }
}

testConnection();
