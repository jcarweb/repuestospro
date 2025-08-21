const mongoose = require('mongoose');
require('dotenv').config();

// Definir los esquemas directamente en el script
const exchangeRateSchema = new mongoose.Schema({
  currency: { type: String, required: true, default: 'USD' },
  rate: { type: Number, required: true },
  source: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const commissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minAmount: { type: Number },
  maxAmount: { type: Number },
  storeType: { type: String, enum: ['new', 'growing', 'established'], required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String }
});

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['basic', 'pro', 'elite'], required: true },
  price: { type: Number, required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
  description: { type: String },
  maxStores: { type: Number },
  maxProducts: { type: Number },
  prioritySupport: { type: Boolean, default: false },
  featuredListing: { type: Boolean, default: false },
  advancedAnalytics: { type: Boolean, default: false },
  customDomain: { type: Boolean, default: false }
});

const taxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  rate: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  appliesTo: { type: String, enum: ['all', 'products', 'services', 'shipping'], required: true },
  isCompound: { type: Boolean, default: false }
});

// Crear los modelos
const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);
const Commission = mongoose.model('Commission', commissionSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Tax = mongoose.model('Tax', taxSchema);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/piezasya', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('✅ Conectado a MongoDB');
  
  try {
    // Limpiar datos existentes
    await ExchangeRate.deleteMany({});
    await Commission.deleteMany({});
    await Subscription.deleteMany({});
    await Tax.deleteMany({});
    
    console.log('🗑️ Datos existentes eliminados');

    // Crear tasa de cambio de ejemplo
    const exchangeRate = await ExchangeRate.create({
      currency: 'USD',
      rate: 35.50,
      source: 'BCV',
      sourceUrl: 'https://www.bcv.org.ve/',
      lastUpdated: new Date(),
      isActive: true
    });
    console.log('💱 Tasa de cambio creada:', exchangeRate.rate);

    // Crear comisiones de ejemplo
    const commissions = await Commission.create([
      {
        name: 'Comisión Tienda Nueva',
        type: 'percentage',
        value: 5,
        storeType: 'new',
        isActive: true,
        description: 'Comisión introductoria para tiendas nuevas (primeros 6 meses)'
      },
      {
        name: 'Comisión Tienda en Crecimiento',
        type: 'percentage',
        value: 8,
        storeType: 'growing',
        isActive: true,
        description: 'Comisión para tiendas con ventas crecientes'
      },
      {
        name: 'Comisión Tienda Establecida',
        type: 'percentage',
        value: 3,
        storeType: 'established',
        isActive: true,
        description: 'Comisión reducida para tiendas consolidadas con membresía premium'
      }
    ]);
    console.log('💰 Comisiones creadas:', commissions.length);

    // Crear planes de suscripción de ejemplo
    const subscriptions = await Subscription.create([
      {
        name: 'Plan Básico',
        type: 'basic',
        price: 0,
        billingCycle: 'monthly',
        features: ['Publicación básica', 'Búsquedas estándar'],
        isActive: true,
        description: 'Plan gratuito para comenzar',
        maxStores: 1,
        maxProducts: 50,
        prioritySupport: false,
        featuredListing: false,
        advancedAnalytics: false,
        customDomain: false
      },
      {
        name: 'Plan Pro',
        type: 'pro',
        price: 30,
        billingCycle: 'monthly',
        features: ['Productos destacados', 'Analytics avanzado', 'Soporte prioritario'],
        isActive: true,
        description: 'Plan profesional para tiendas en crecimiento',
        maxStores: 3,
        maxProducts: 200,
        prioritySupport: true,
        featuredListing: true,
        advancedAnalytics: true,
        customDomain: false
      },
      {
        name: 'Plan Élite',
        type: 'elite',
        price: 100,
        billingCycle: 'monthly',
        features: ['Publicidad in-app', 'Dominio personalizado', 'Soporte VIP'],
        isActive: true,
        description: 'Plan premium para tiendas establecidas',
        maxStores: 10,
        maxProducts: 1000,
        prioritySupport: true,
        featuredListing: true,
        advancedAnalytics: true,
        customDomain: true
      }
    ]);
    console.log('📦 Planes de suscripción creados:', subscriptions.length);

    // Crear impuestos de ejemplo
    const taxes = await Tax.create([
      {
        name: 'IVA',
        type: 'percentage',
        rate: 16,
        isActive: true,
        description: 'Impuesto al Valor Agregado',
        appliesTo: 'all',
        isCompound: false
      },
      {
        name: 'ISLR',
        type: 'percentage',
        rate: 2,
        isActive: true,
        description: 'Impuesto Sobre la Renta',
        appliesTo: 'products',
        isCompound: false
      },
      {
        name: 'Cargo de Envío',
        type: 'fixed',
        rate: 5,
        isActive: true,
        description: 'Cargo fijo por envío',
        appliesTo: 'shipping',
        isCompound: false
      }
    ]);
    console.log('🧾 Impuestos creados:', taxes.length);

    console.log('✅ Datos de monetización creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error al crear datos:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
});
