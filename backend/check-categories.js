const mongoose = require('mongoose');
const path = require('path');

// Cargar los modelos
require('./src/models/Category');
require('./src/models/Brand');
require('./src/models/Subcategory');

async function checkCategories() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/repuestos-pro');
    console.log('✅ Conectado a la base de datos');
    
    const Category = mongoose.model('Category');
    const categories = await Category.find({}).select('_id name').exec();
    
    console.log('\n📊 Categorías en la base de datos:');
    console.log(`Total: ${categories.length} categorías\n`);
    
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (ID: ${cat._id})`);
    });
    
    // Verificar subcategorías
    const Subcategory = mongoose.model('Subcategory');
    const subcategories = await Subcategory.find({}).countDocuments();
    console.log(`\n📊 Subcategorías en la base de datos: ${subcategories}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCategories(); 