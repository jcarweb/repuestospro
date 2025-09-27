import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExchangeRate from '../models/ExchangeRate';
import Commission from '../models/Commission';
import Subscription from '../models/Subscription';
import Tax from '../models/Tax';
dotenv.config();
// Conectar a MongoDB
mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  try {
    // Limpiar datos existentes
    await ExchangeRate.deleteMany({});
    await Commission.deleteMany({});
    await Subscription.deleteMany({});
    await Tax.deleteMany({});
    console.log('🧹 Datos existentes eliminados');
    // Crear tasa de cambio inicial
    const exchangeRate = await ExchangeRate.create({
      currency: 'USD',
      rate: 35.50,
      source: 'BCV',
      sourceUrl: 'https://www.bcv.org.ve/',
      lastUpdated: new Date(),
      isActive: true,
      manualOverride: false
    });
    // Crear comisiones
    const commissions = await Commission.create([
      {
        name: 'Comisión Básica - Tiendas Nuevas',
        description: 'Comisión del 5% para tiendas nuevas durante los primeros 6 meses',
        type: 'percentage',
        baseRate: 5,
        storeType: 'new',
        isActive: true,
        effectiveDate: new Date()
      },
      {
        name: 'Comisión Crecimiento - Tiendas en Desarrollo',
        description: 'Comisión del 8% para tiendas con ventas crecientes',
        type: 'percentage',
        baseRate: 8,
        storeType: 'growing',
        isActive: true,
        effectiveDate: new Date()
      },
      {
        name: 'Comisión Establecida - Tiendas Consolidadas',
        description: 'Comisión del 10% para tiendas establecidas',
        type: 'percentage',
        baseRate: 10,
        storeType: 'established',
        isActive: true,
        effectiveDate: new Date()
      },
      {
        name: 'Comisión Premium - Tiendas Elite',
        description: 'Comisión del 3% para tiendas premium con membresía',
        type: 'percentage',
        baseRate: 3,
        storeType: 'premium',
        isActive: true,
        effectiveDate: new Date()
      },
      {
        name: 'Comisión por Niveles - Tiendas Grandes',
        description: 'Comisión progresiva basada en ventas mensuales',
        type: 'tiered',
        baseRate: 5,
        storeType: 'established',
        tiers: [
          { minSales: 0, maxSales: 10000, rate: 8 },
          { minSales: 10001, maxSales: 50000, rate: 6 },
          { minSales: 50001, maxSales: 100000, rate: 4 },
          { minSales: 100001, rate: 3 }
        ],
        isActive: true,
        effectiveDate: new Date()
      }
    ]);
    // Crear planes de suscripción
    const subscriptions = await Subscription.create([
      {
        name: 'Plan Básico',
        description: 'Plan gratuito con funcionalidades básicas',
        type: 'basic',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'Publicación de productos',
          'Búsqueda estándar',
          'Estadísticas básicas',
          'Soporte por email'
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
        price: 39.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'Todo del plan básico',
          'Productos destacados en búsquedas',
          'Estadísticas avanzadas',
          'Reportes detallados',
          'Soporte prioritario',
          'Análisis de competencia'
        ],
        maxProducts: 200,
        maxStores: 3,
        prioritySupport: true,
        advancedAnalytics: true,
        advertisingAccess: false,
        isActive: true
      },
      {
        name: 'Plan Elite',
        description: 'Plan premium con todas las funcionalidades',
        type: 'elite',
        price: 99.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'Todo del plan Pro',
          'Publicidad dentro de la app',
          'Prioridad máxima en búsquedas',
          'Soporte especializado 24/7',
          'API personalizada',
          'Consultoría de marketing'
        ],
        maxProducts: 1000,
        maxStores: 10,
        prioritySupport: true,
        advancedAnalytics: true,
        advertisingAccess: true,
        isActive: true
      }
    ]);
    // Crear impuestos
    const taxes = await Tax.create([
      {
        name: 'IVA Venezuela',
        description: 'Impuesto al Valor Agregado en Venezuela',
        type: 'IVA',
        rate: 16,
        isPercentage: true,
        appliesTo: 'all',
        country: 'Venezuela',
        isActive: true,
        effectiveDate: new Date()
      },
      {
        name: 'ISLR Venezuela',
        description: 'Impuesto Sobre la Renta en Venezuela',
        type: 'ISLR',
        rate: 3,
        isPercentage: true,
        appliesTo: 'services',
        country: 'Venezuela',
        isActive: true,
        effectiveDate: new Date()
      },
      {
        name: 'Impuesto Municipal',
        description: 'Impuesto municipal para servicios locales',
        type: 'custom',
        rate: 2,
        isPercentage: true,
        appliesTo: 'services',
        country: 'Venezuela',
        state: 'Caracas',
        isActive: true,
        effectiveDate: new Date()
      }
    ]);
    console.log('🎉 Datos de monetización sembrados exitosamente');
    console.log('📊 Resumen:');
    console.log(`   - Tasa de cambio: ${exchangeRate.rate} ${exchangeRate.currency}`);
    console.log(`   - Comisiones: ${commissions.length}`);
    console.log(`   - Planes de suscripción: ${subscriptions.length}`);
    console.log(`   - Impuestos: ${taxes.length}`);
  } catch (error) {
    console.error('❌ Error sembrando datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
});