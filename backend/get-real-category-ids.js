const mongoose = require('mongoose');
require('dotenv').config();

// Cargar los modelos
require('./src/models/Category');

async function getRealCategoryIds() {
  try {
    console.log('🔍 Obteniendo IDs reales de categorías...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado a MongoDB Atlas');
    
    const Category = mongoose.model('Category');
    const categories = await Category.find({}).select('_id name').exec();
    
    console.log('\n📊 Categorías con IDs reales:');
    console.log('const categoryIdMap = {');
    
    categories.forEach((cat) => {
      console.log(`  '${cat.name}': '${cat._id}',`);
    });
    
    console.log('};');
    
    console.log(`\n📈 Total de categorías: ${categories.length}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getRealCategoryIds(); 