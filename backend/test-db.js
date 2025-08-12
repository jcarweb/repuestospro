const mongoose = require('mongoose');

// Configuración de MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://repuestospro:repuestospro2024@cluster0.mongodb.net/repuestospro?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conexión exitosa a MongoDB Atlas');
    
    // Verificar la conexión
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    console.log('🏓 Ping a la base de datos:', result);
    
    // Listar las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Colecciones disponibles:', collections.map(c => c.name));
    
    // Crear una colección de prueba
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ 
      message: 'Test de conexión', 
      timestamp: new Date() 
    });
    console.log('✅ Escritura de prueba exitosa');
    
    // Leer el documento de prueba
    const testDoc = await testCollection.findOne({ message: 'Test de conexión' });
    console.log('✅ Lectura de prueba exitosa:', testDoc);
    
    // Limpiar el documento de prueba
    await testCollection.deleteOne({ message: 'Test de conexión' });
    console.log('✅ Limpieza de prueba exitosa');
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error);
    process.exit(1);
  }
}

testConnection();