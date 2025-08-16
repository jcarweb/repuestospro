const mongoose = require('mongoose');
require('dotenv').config();

async function testSubcategories() {
  try {
    console.log('🔍 Probando conexión y datos de subcategorías...\n');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Verificar si existe el modelo Subcategory
    const Subcategory = mongoose.model('Subcategory');
    console.log('✅ Modelo Subcategory encontrado');
    
    // Contar subcategorías
    const count = await Subcategory.countDocuments();
    console.log(`📊 Total de subcategorías en BD: ${count}`);
    
    if (count === 0) {
      console.log('⚠️ No hay subcategorías en la base de datos');
      console.log('💡 Ejecuta: node seed-subcategories.js');
    } else {
      // Mostrar algunas subcategorías de ejemplo
      const subcategories = await Subcategory.find()
        .populate('categoryId', 'name')
        .limit(5)
        .select('name categoryId vehicleType isActive');
      
      console.log('\n📋 Ejemplos de subcategorías:');
      subcategories.forEach(sub => {
        console.log(`   - ${sub.name} (${sub.categoryId?.name || 'Sin categoría'}) - ${sub.vehicleType} - ${sub.isActive ? 'Activa' : 'Inactiva'}`);
      });
      
      // Estadísticas por tipo de vehículo
      const stats = await Subcategory.aggregate([
        {
          $group: {
            _id: '$vehicleType',
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('\n📈 Estadísticas por tipo de vehículo:');
      stats.forEach(stat => {
        console.log(`   - ${stat._id}: ${stat.count}`);
      });
    }
    
    // Verificar categorías
    const Category = mongoose.model('Category');
    const categoryCount = await Category.countDocuments();
    console.log(`\n📁 Total de categorías: ${categoryCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

testSubcategories();
