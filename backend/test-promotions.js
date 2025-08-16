const mongoose = require('mongoose');
require('dotenv').config();

async function testPromotions() {
  try {
    console.log('🔍 Probando promociones en la base de datos...\n');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Verificar si existe el modelo Promotion
    const Promotion = mongoose.model('Promotion');
    console.log('✅ Modelo Promotion encontrado');
    
    // Contar promociones
    const count = await Promotion.countDocuments();
    console.log(`📊 Total de promociones en BD: ${count}`);
    
    if (count === 0) {
      console.log('⚠️ No hay promociones en la base de datos');
      console.log('💡 Ejecuta: node seed-promotions.js');
    } else {
      // Mostrar algunas promociones de ejemplo
      const promotions = await Promotion.find()
        .populate('store', 'name city state')
        .populate('products', 'name price')
        .populate('createdBy', 'name email')
        .limit(5)
        .select('name type store products isActive startDate endDate');
      
      console.log('\n📋 Ejemplos de promociones:');
      promotions.forEach(promo => {
        console.log(`   - ${promo.name} (${promo.type})`);
        console.log(`     Tienda: ${promo.store?.name || 'Sin tienda'} - ${promo.store?.city}, ${promo.store?.state}`);
        console.log(`     Productos: ${promo.products?.length || 0} - Estado: ${promo.isActive ? 'Activa' : 'Inactiva'}`);
        console.log(`     Fechas: ${promo.startDate?.toLocaleDateString()} - ${promo.endDate?.toLocaleDateString()}`);
        console.log('');
      });
      
      // Estadísticas por tipo
      const stats = await Promotion.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('📈 Estadísticas por tipo:');
      stats.forEach(stat => {
        console.log(`   - ${stat._id}: ${stat.count}`);
      });
      
      // Estadísticas por tienda
      const storeStats = await Promotion.aggregate([
        {
          $lookup: {
            from: 'stores',
            localField: 'store',
            foreignField: '_id',
            as: 'storeInfo'
          }
        },
        {
          $group: {
            _id: '$store',
            storeName: { $first: '$storeInfo.name' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('\n🏪 Promociones por tienda:');
      storeStats.forEach(stat => {
        console.log(`   - ${stat.storeName?.[0] || 'Tienda desconocida'}: ${stat.count}`);
      });
      
      // Promociones activas vs inactivas
      const activeCount = await Promotion.countDocuments({ isActive: true });
      const inactiveCount = await Promotion.countDocuments({ isActive: false });
      
      console.log('\n📊 Estado de promociones:');
      console.log(`   - Activas: ${activeCount}`);
      console.log(`   - Inactivas: ${inactiveCount}`);
    }
    
    // Verificar tiendas
    const Store = mongoose.model('Store');
    const storeCount = await Store.countDocuments({ isActive: true });
    console.log(`\n🏪 Total de tiendas activas: ${storeCount}`);
    
    // Verificar productos
    const Product = mongoose.model('Product');
    const productCount = await Product.countDocuments({ isActive: true });
    console.log(`📦 Total de productos activos: ${productCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

testPromotions();
