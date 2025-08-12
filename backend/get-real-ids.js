const mongoose = require('mongoose');
require('dotenv').config();

// Cargar los modelos
require('./src/models/Category');

async function getRealIds() {
  try {
    // Usar la configuración del .env
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro';
    await mongoose.connect(uri);
    console.log('✅ Conectado a la base de datos');
    
    const Category = mongoose.model('Category');
    const categories = await Category.find({}).select('_id name').exec();
    
    console.log('\n📊 Categorías con IDs reales:');
    console.log('const categoryIdMap = {');
    
    categories.forEach((cat) => {
      console.log(`  '${cat.name}': '${cat._id}',`);
    });
    
    console.log('};');
    
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getRealIds(); 