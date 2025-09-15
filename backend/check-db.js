const mongoose = require('mongoose');
const path = require('path');

// Cargar variables de entorno desde el directorio backend
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Conectar a MongoDB
const connectDB = async () => {
  try {
    console.log('🔍 Variables de entorno:');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Definida' : 'No definida');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'No definida');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro';
    console.log('🔗 Conectando a MongoDB...');
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener información de la base de datos
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Base de datos: ${dbName}`);
    
    // Listar todas las colecciones
    const collections = await db.listCollections().toArray();
    console.log(`📋 Colecciones disponibles (${collections.length}):`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Verificar colecciones específicas
    const collectionsToCheck = ['products', 'stores', 'productinventories', 'users'];
    
    for (const collectionName of collectionsToCheck) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`📦 ${collectionName}: ${count} documentos`);
        
        if (count > 0 && collectionName === 'products') {
          // Mostrar algunos productos de ejemplo
          const sample = await db.collection(collectionName).find({}).limit(2).toArray();
          console.log(`   Ejemplos:`);
          sample.forEach((doc, index) => {
            console.log(`     ${index + 1}. ${doc.name || 'Sin nombre'} - ID: ${doc._id}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error accediendo a ${collectionName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { connectDB };
