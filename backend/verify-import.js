const mongoose = require('mongoose');
require('dotenv').config();

// Cargar los modelos
require('./src/models/Category');
require('./src/models/Brand');
require('./src/models/Subcategory');

async function verifyImport() {
  try {
    console.log('🔍 Verificando importación completa...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado a MongoDB Atlas');
    
    const Category = mongoose.model('Category');
    const Brand = mongoose.model('Brand');
    const Subcategory = mongoose.model('Subcategory');
    
    // Verificar categorías
    const categories = await Category.find({}).select('_id name').exec();
    console.log(`\n📊 Categorías: ${categories.length}`);
    
    // Verificar marcas
    const brands = await Brand.find({}).select('_id name').exec();
    console.log(`📊 Marcas: ${brands.length}`);
    
    // Verificar subcategorías
    const subcategories = await Subcategory.find({}).populate('categoryId', 'name').exec();
    console.log(`📊 Subcategorías: ${subcategories.length}`);
    
    // Mostrar algunas estadísticas
    console.log('\n📈 Estadísticas por categoría:');
    const stats = {};
    subcategories.forEach(sub => {
      const categoryName = sub.categoryId?.name || 'Sin categoría';
      stats[categoryName] = (stats[categoryName] || 0) + 1;
    });
    
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} subcategorías`);
    });
    
    // Verificar que todas las subcategorías tienen categoría válida
    const validSubcategories = subcategories.filter(sub => sub.categoryId);
    const invalidSubcategories = subcategories.filter(sub => !sub.categoryId);
    
    console.log(`\n✅ Subcategorías válidas: ${validSubcategories.length}`);
    if (invalidSubcategories.length > 0) {
      console.log(`⚠️ Subcategorías sin categoría: ${invalidSubcategories.length}`);
    }
    
    console.log('\n🎉 Verificación completada exitosamente');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

verifyImport(); 