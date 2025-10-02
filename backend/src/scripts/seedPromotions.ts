import mongoose from 'mongoose';
import Promotion from '../models/Promotion';
import Store from '../models/Store';
import Product from '../models/Product';
import User from '../models/User';
import { config } from '../config/env';
const promotionTypes = [
  {
    name: 'Descuento de Verano',
    description: 'Descuentos especiales en repuestos para el verano',
    type: 'percentage' as const,
    discountPercentage: 15,
    ribbonText: 'VERANO',
    ribbonPosition: 'top-left' as const
  },
  {
    name: 'Oferta Flash',
    description: 'Ofertas por tiempo limitado en productos seleccionados',
    type: 'fixed' as const,
    discountAmount: 5000,
    ribbonText: 'FLASH',
    ribbonPosition: 'top-right' as const
  },
  {
    name: 'Compra 2 Lleva 3',
    description: 'Compra 2 productos y lleva 3',
    type: 'buy_x_get_y' as const,
    buyQuantity: 2,
    getQuantity: 3,
    ribbonText: '2x3',
    ribbonPosition: 'bottom-left' as const
  },
  {
    name: 'Promoción Personalizada',
    description: 'Oferta especial con condiciones únicas',
    type: 'custom' as const,
    customText: 'ESPECIAL',
    ribbonText: 'ESPECIAL',
    ribbonPosition: 'bottom-right' as const
  }
];
async function seedPromotions() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    // Limpiar promociones existentes
    await Promotion.deleteMany({});
    console.log('🗑️ Promociones existentes eliminadas');
    // Obtener tiendas
    const stores = await Store.find({ isActive: true });
    if (stores.length === 0) {
      return;
    }
    // Obtener productos
    const products = await Product.find({ isActive: true }).limit(20);
    if (products.length === 0) {
      return;
    }
    // Obtener usuario admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return;
    }
    let totalCreated = 0;
    // Crear promociones para cada tienda
    for (const store of stores) {
      console.log(`🏪 Creando promociones para tienda: ${store.name}`);
      // Crear 2-3 promociones por tienda
      const promotionsPerStore = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < promotionsPerStore; i++) {
        const promotionType = promotionTypes[Math.floor(Math.random() * promotionTypes.length)];
        // Fechas aleatorias (promoción vigente)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Últimos 30 días
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 30); // Próximos 30-90 días
        // Seleccionar productos aleatorios de la tienda
        const storeId = (store._id as any).toString();
        const storeProducts = products.filter(p => p.store.toString() === storeId);
        const selectedProducts = storeProducts.slice(0, Math.floor(Math.random() * 3) + 1);
        if (selectedProducts.length === 0) continue;
        const promotionData = {
          ...promotionType,
          products: selectedProducts.map(p => p._id),
          store: storeId, // Usar la variable ya convertida
          startDate,
          startTime: '00:00',
          endDate,
          endTime: '23:59',
          isActive: Math.random() > 0.2, // 80% activas
          createdBy: (adminUser._id as any).toString(), // Type assertion para evitar error
          showOriginalPrice: true,
          showDiscountAmount: true,
          maxUses: Math.floor(Math.random() * 100) + 50,
          currentUses: Math.floor(Math.random() * 20)
        };
        const promotion = new Promotion(promotionData);
        await promotion.save();
        totalCreated++;
      }
    }
    console.log(`\n🎉 Promociones sembradas exitosamente`);
    console.log(`📊 Total de promociones creadas: ${totalCreated}`);
    console.log(`🏪 Tiendas con promociones: ${stores.length}`);
    // Estadísticas finales
    const stats = await Promotion.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('\n📈 Estadísticas por tipo:');
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count}`);
    });
    const activeCount = await Promotion.countDocuments({ isActive: true });
    const inactiveCount = await Promotion.countDocuments({ isActive: false });
    console.log(`\n📊 Estado de promociones:`);
    console.log(`   - Activas: ${activeCount}`);
    console.log(`   - Inactivas: ${inactiveCount}`);
  } catch (error) {
    console.error('❌ Error sembrando promociones:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}
if (require.main === module) {
  seedPromotions();
}
export default seedPromotions;