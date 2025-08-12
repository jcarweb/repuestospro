const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuración para MongoDB local
const MONGODB_URI = 'mongodb://127.0.0.1:27017/repuestos-pro';

async function setupLocalDatabase() {
  try {
    console.log('🔧 Configurando base de datos local...');
    
    // Conectar a MongoDB local
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Conectado a MongoDB local exitosamente');
    
    // Verificar que las colecciones existen
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Colecciones disponibles:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Verificar usuarios
    const User = mongoose.model('User');
    const userCount = await User.countDocuments();
    console.log(`\n👥 Usuarios registrados: ${userCount}`);
    
    // Verificar actividades
    const Activity = mongoose.model('Activity');
    const activityCount = await Activity.countDocuments();
    console.log(`📈 Actividades registradas: ${activityCount}`);
    
    // Verificar categorías
    const Category = mongoose.model('Category');
    const categoryCount = await Category.countDocuments();
    console.log(`📂 Categorías: ${categoryCount}`);
    
    // Verificar marcas
    const Brand = mongoose.model('Brand');
    const brandCount = await Brand.countDocuments();
    console.log(`🏷️ Marcas: ${brandCount}`);
    
    // Verificar subcategorías
    const Subcategory = mongoose.model('Subcategory');
    const subcategoryCount = await Subcategory.countDocuments();
    console.log(`📁 Subcategorías: ${subcategoryCount}`);
    
    console.log('\n🎉 Base de datos local configurada correctamente');
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos local:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solución:');
      console.log('1. Asegúrate de que MongoDB esté instalado y ejecutándose');
      console.log('2. En Windows, ejecuta: net start MongoDB');
      console.log('3. En macOS/Linux, ejecuta: sudo systemctl start mongod');
      console.log('4. O instala MongoDB Community Edition desde: https://www.mongodb.com/try/download/community');
    }
  }
}

// Cargar los modelos
require('./src/models/User');
require('./src/models/Activity');
require('./src/models/Category');
require('./src/models/Brand');
require('./src/models/Subcategory');

setupLocalDatabase(); 