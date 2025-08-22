require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a MongoDB Atlas...');
    
    // Usar la URI de MongoDB desde las variables de entorno
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 URI de conexión:', mongoUri ? 'Configurada' : 'No configurada');
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI no está configurada en el archivo .env');
      return;
    }
    
    // Conectar a MongoDB Atlas
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Verificar si la colección states existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Colecciones disponibles:', collections.map(c => c.name));
    
    // Verificar si hay datos en states
    const State = mongoose.model('State', new mongoose.Schema({}));
    const stateCount = await State.countDocuments();
    console.log(`📊 Estados en la base de datos: ${stateCount}`);
    
    if (stateCount > 0) {
      const states = await State.find().limit(3);
      console.log('🏛️ Primeros 3 estados:', states);
    } else {
      console.log('⚠️ No hay estados en la base de datos');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testConnection();
