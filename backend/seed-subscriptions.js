const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription.ts');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const subscriptionPlans = [
  {
    name: 'Plan Básico',
    description: 'Plan gratuito con funcionalidades básicas',
    type: 'basic',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Hasta 50 productos',
      'Búsquedas básicas',
      'Soporte por email',
      'Perfil básico de tienda'
    ],
    maxProducts: 50,
    maxStores: 1,
    prioritySupport: false,
    advancedAnalytics: false,
    advertisingAccess: false,
    isActive: true
  },
  {
    name: 'Plan Pro',
    description: 'Plan profesional con funcionalidades avanzadas',
    type: 'pro',
    price: 29.99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Hasta 500 productos',
      'Promociones ilimitadas',
      'Analytics avanzado',
      'Soporte prioritario',
      'Publicidad básica',
      'Múltiples sucursales'
    ],
    maxProducts: 500,
    maxStores: 3,
    prioritySupport: true,
    advancedAnalytics: true,
    advertisingAccess: true,
    isActive: true
  },
  {
    name: 'Plan Élite',
    description: 'Plan premium con todas las funcionalidades',
    type: 'elite',
    price: 99.99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Productos ilimitados',
      'Promociones ilimitadas',
      'Analytics premium',
      'Soporte 24/7',
      'Publicidad avanzada',
      'Dominio personalizado',
      'API personalizada',
      'Múltiples sucursales ilimitadas'
    ],
    maxProducts: -1, // Ilimitado
    maxStores: -1, // Ilimitado
    prioritySupport: true,
    advancedAnalytics: true,
    advertisingAccess: true,
    isActive: true
  }
];

async function seedSubscriptions() {
  try {
    console.log('🌱 Inicializando planes de suscripción...');

    // Limpiar planes existentes
    await Subscription.deleteMany({});
    console.log('✅ Planes existentes eliminados');

    // Crear nuevos planes
    const createdSubscriptions = await Subscription.insertMany(subscriptionPlans);
    console.log(`✅ ${createdSubscriptions.length} planes de suscripción creados`);

    // Mostrar los planes creados
    createdSubscriptions.forEach(sub => {
      console.log(`📋 ${sub.name} - $${sub.price}/${sub.billingCycle}`);
      console.log(`   Tipo: ${sub.type}`);
      console.log(`   Productos máx: ${sub.maxProducts === -1 ? 'Ilimitado' : sub.maxProducts}`);
      console.log(`   Tiendas máx: ${sub.maxStores === -1 ? 'Ilimitado' : sub.maxStores}`);
      console.log(`   Características: ${sub.features.length}`);
      console.log('');
    });

    console.log('🎉 Inicialización de suscripciones completada');
  } catch (error) {
    console.error('❌ Error al inicializar suscripciones:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
seedSubscriptions();
