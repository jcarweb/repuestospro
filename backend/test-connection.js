const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a MongoDB Atlas...');
    
    // Intentar con diferentes opciones de conexión
    const uri = 'mongodb+srv://repuestospro:repuestospro123@cluster0.s307fxr.mongodb.net/repuestos-pro?retryWrites=true&w=majority';
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    
    // Verificar que podemos hacer una consulta simple
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Colecciones encontradas: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    // Intentar con una URI alternativa
    try {
      console.log('\n🔄 Intentando con URI alternativa...');
      const altUri = 'mongodb+srv://repuestospro:repuestospro123@cluster0.s307fxr.mongodb.net/repuestos-pro?retryWrites=true&w=majority&directConnection=true';
      
      await mongoose.connect(altUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ Conexión exitosa con URI alternativa');
      await mongoose.disconnect();
      
    } catch (altError) {
      console.error('❌ Error con URI alternativa:', altError.message);
    }
  }
}

testConnection(); 