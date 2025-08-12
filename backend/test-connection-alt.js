const mongoose = require('mongoose');

async function testConnection() {
  const connectionOptions = [
    {
      name: 'SRV estándar',
      uri: 'mongodb+srv://repuestospro:repuestospro123@cluster0.s307fxr.mongodb.net/repuestos-pro?retryWrites=true&w=majority'
    },
    {
      name: 'SRV con timeout extendido',
      uri: 'mongodb+srv://repuestospro:repuestospro123@cluster0.s307fxr.mongodb.net/repuestos-pro?retryWrites=true&w=majority',
      options: {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
      }
    },
    {
      name: 'Sin SRV (directo)',
      uri: 'mongodb://repuestospro:repuestospro123@cluster0-shard-00-00.s307fxr.mongodb.net:27017,cluster0-shard-00-01.s307fxr.mongodb.net:27017,cluster0-shard-00-02.s307fxr.mongodb.net:27017/repuestos-pro?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority'
    }
  ];

  for (const option of connectionOptions) {
    try {
      console.log(`\n🔍 Probando: ${option.name}`);
      console.log(`URI: ${option.uri.substring(0, 50)}...`);
      
      const connectOptions = option.options || {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      };
      
      await mongoose.connect(option.uri, connectOptions);
      
      console.log(`✅ Conexión exitosa con ${option.name}`);
      
      // Verificar que podemos hacer una consulta simple
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📊 Colecciones encontradas: ${collections.length}`);
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      
      await mongoose.disconnect();
      console.log('🔌 Desconectado exitosamente');
      
      // Si llegamos aquí, la conexión funcionó
      console.log(`\n🎉 ¡Conexión exitosa con ${option.name}!`);
      return;
      
    } catch (error) {
      console.error(`❌ Error con ${option.name}:`, error.message);
      
      // Desconectar si hay una conexión activa
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }
  
  console.log('\n❌ No se pudo establecer conexión con ninguna opción');
  console.log('💡 Sugerencias:');
  console.log('   - Verificar la conectividad de internet');
  console.log('   - Verificar que el cluster de MongoDB Atlas esté activo');
  console.log('   - Verificar las credenciales en el .env');
  console.log('   - Intentar más tarde (puede ser un problema temporal)');
}

testConnection(); 