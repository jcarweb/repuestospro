const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Reward = require('./dist/models/Reward').default || require('./src/models/Reward');
const User = require('./dist/models/User').default || require('./src/models/User');

// Premios de ejemplo
const sampleRewards = [
  {
    name: 'Gorra PiezasYA',
    description: 'Gorra oficial de PiezasYA con logo bordado. Material de alta calidad, ajustable y cómoda para uso diario.',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop',
    pointsRequired: 500,
    cashRequired: 0,
    category: 'accessories',
    stock: 50,
    isActive: true
  },
  {
    name: 'Set de Herramientas Básicas',
    description: 'Set completo de herramientas básicas para mantenimiento de vehículos. Incluye destornilladores, llaves y alicates.',
    image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
    pointsRequired: 1000,
    cashRequired: 0,
    category: 'tools',
    stock: 25,
    isActive: true
  },
  {
    name: 'Cargador USB para Auto',
    description: 'Cargador USB de doble puerto para vehículo. Compatible con todos los dispositivos móviles, carga rápida.',
    image: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=400&h=400&fit=crop',
    pointsRequired: 300,
    cashRequired: 0,
    category: 'electronics',
    stock: 100,
    isActive: true
  },
  {
    name: 'Tarjeta de Regalo $50',
    description: 'Tarjeta de regalo de $50 para usar en cualquier compra en PiezasYA. Sin fecha de expiración.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop',
    pointsRequired: 2000,
    cashRequired: 0,
    category: 'gift_cards',
    stock: 30,
    isActive: true
  },
  {
    name: 'Descuento 15% en Próxima Compra',
    description: 'Cupón de descuento del 15% en tu próxima compra. Válido por 30 días después del canje.',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop',
    pointsRequired: 800,
    cashRequired: 0,
    category: 'discounts',
    stock: 200,
    isActive: true
  },
  {
    name: 'Linterna LED Profesional',
    description: 'Linterna LED de alta potencia con múltiples modos de iluminación. Ideal para trabajos en el motor.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    pointsRequired: 600,
    cashRequired: 0,
    category: 'tools',
    stock: 40,
    isActive: true
  },
  {
    name: 'Organizador de Herramientas',
    description: 'Maletín organizador con múltiples compartimentos para herramientas. Material resistente y duradero.',
    image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
    pointsRequired: 1200,
    cashRequired: 0,
    category: 'accessories',
    stock: 20,
    isActive: true
  },
  {
    name: 'Gorra + $5 en Efectivo',
    description: 'Gorra oficial de PiezasYA más $5 en efectivo. Premio mixto que combina producto y dinero.',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop',
    pointsRequired: 400,
    cashRequired: 5,
    category: 'accessories',
    stock: 35,
    isActive: true
  },
  {
    name: 'Descuento 25% en Envíos',
    description: 'Cupón de descuento del 25% en costos de envío. Válido por 60 días después del canje.',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop',
    pointsRequired: 400,
    cashRequired: 0,
    category: 'discounts',
    stock: 150,
    isActive: true
  },
  {
    name: 'Set de Limpieza para Auto',
    description: 'Kit completo de limpieza para vehículo. Incluye productos para interior, exterior y motor.',
    image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
    pointsRequired: 700,
    cashRequired: 0,
    category: 'accessories',
    stock: 45,
    isActive: true
  }
];

async function seedRewards() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro');
    console.log('✅ Conexión exitosa a MongoDB');

    // Buscar un usuario admin para asignar como creador
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️ No se encontró usuario admin, creando premios sin creador asignado');
    }

    console.log('🧹 Limpiando premios existentes...');
    await Reward.deleteMany({});
    console.log('✅ Premios anteriores eliminados');

    console.log('🌱 Creando premios de ejemplo...');
    
    const createdRewards = [];
    
    for (const rewardData of sampleRewards) {
      const reward = new Reward({
        ...rewardData,
        createdBy: adminUser ? adminUser._id : null,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Válido por 1 año
      });

      const savedReward = await reward.save();
      createdRewards.push(savedReward);
      
      console.log(`✅ Creado premio: ${rewardData.name} (${rewardData.pointsRequired} puntos)`);
    }

    console.log(`\n🎉 ¡Script completado exitosamente!`);
    console.log(`📊 Resumen:`);
    console.log(`   - Premios creados: ${createdRewards.length}`);
    console.log(`   - Categorías: ${[...new Set(createdRewards.map(r => r.category))].length}`);
    console.log(`   - Stock total: ${createdRewards.reduce((sum, r) => sum + r.stock, 0)}`);

    // Mostrar estadísticas por categoría
    const stats = await Reward.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPoints: { $avg: '$pointsRequired' }
        }
      }
    ]);

    console.log(`\n📈 Estadísticas por categoría:`);
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} premios, ${stat.totalStock} stock, ${Math.round(stat.avgPoints)} pts promedio`);
    });

    // Mostrar premios disponibles
    console.log(`\n🎁 Premios disponibles:`);
    createdRewards.forEach(reward => {
      const cashText = reward.cashRequired > 0 ? ` + $${reward.cashRequired}` : '';
      console.log(`   - ${reward.name}: ${reward.pointsRequired} puntos${cashText} (Stock: ${reward.stock})`);
    });

  } catch (error) {
    console.error('❌ Error al crear premios:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
seedRewards();
