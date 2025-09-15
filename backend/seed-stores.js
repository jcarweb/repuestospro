const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquema simplificado de Store
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, default: '0000' },
  country: { type: String, default: 'Venezuela' },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  logo: { type: String },
  banner: { type: String },
  isActive: { type: Boolean, default: true },
  isMainStore: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  subscriptionStatus: { type: String, default: 'active' }
}, {
  timestamps: true
});

const Store = mongoose.model('Store', storeSchema);

// Datos de tiendas de prueba
const testStores = [
  {
    name: 'AutoParts Express',
    description: 'Tienda especializada en repuestos automotrices de alta calidad',
    address: 'Av. Principal, Centro Comercial Galerías',
    city: 'Caracas',
    state: 'Distrito Capital',
    zipCode: '1010',
    phone: '+58-212-555-0101',
    email: 'info@autopartsexpress.com',
    website: 'https://autopartsexpress.com',
    coordinates: { latitude: 10.4806, longitude: -66.9036 },
    isMainStore: true
  },
  {
    name: 'Repuestos del Sur',
    description: 'Repuestos originales y alternativos para todas las marcas',
    address: 'Calle 5, Zona Industrial',
    city: 'Valencia',
    state: 'Carabobo',
    zipCode: '2001',
    phone: '+58-241-555-0202',
    email: 'ventas@repuestosdelsur.com',
    coordinates: { latitude: 10.1621, longitude: -68.0077 },
    isMainStore: false
  },
  {
    name: 'Motor Parts Center',
    description: 'Especialistas en repuestos de motor y transmisión',
    address: 'Av. Libertador, Local 15',
    city: 'Maracaibo',
    state: 'Zulia',
    zipCode: '4001',
    phone: '+58-261-555-0303',
    email: 'contacto@motorpartscenter.com',
    coordinates: { latitude: 10.6427, longitude: -71.6125 },
    isMainStore: false
  },
  {
    name: 'Frenos y Embragues Pro',
    description: 'Especialistas en sistemas de frenos y embragues',
    address: 'Carrera 19, Sector Industrial',
    city: 'Barquisimeto',
    state: 'Lara',
    zipCode: '3001',
    phone: '+58-251-555-0404',
    email: 'info@frenosyembraguespro.com',
    coordinates: { latitude: 10.0647, longitude: -69.3320 },
    isMainStore: false
  },
  {
    name: 'Suspensión Total',
    description: 'Repuestos de suspensión, amortiguadores y dirección',
    address: 'Av. Bolívar, Centro Comercial',
    city: 'Mérida',
    state: 'Mérida',
    zipCode: '5101',
    phone: '+58-274-555-0505',
    email: 'ventas@suspensiontotal.com',
    coordinates: { latitude: 8.5924, longitude: -71.1569 },
    isMainStore: false
  }
];

// Función para crear tiendas de prueba
const createTestStores = async () => {
  try {
    console.log('🌱 Creando tiendas de prueba...');
    
    // Verificar si ya existen tiendas
    console.log('🔍 Verificando tiendas existentes...');
    const existingStores = await Store.countDocuments();
    console.log(`📊 Tiendas existentes en la base de datos: ${existingStores}`);
    
    if (existingStores > 0) {
      console.log(`⚠️  Ya existen ${existingStores} tiendas en la base de datos`);
      const stores = await Store.find({}).select('name city state isActive');
      console.log('📋 Tiendas existentes:');
      stores.forEach(store => {
        console.log(`   - ${store.name} (${store.city}, ${store.state}) - ${store.isActive ? 'Activa' : 'Inactiva'}`);
      });
      return;
    }
    
    console.log('📝 Creando nuevas tiendas...');
    // Crear las tiendas
    const createdStores = await Store.insertMany(testStores);
    
    console.log(`✅ Creadas ${createdStores.length} tiendas de prueba:`);
    createdStores.forEach(store => {
      console.log(`   - ${store.name} (${store.city}, ${store.state})`);
    });
    
  } catch (error) {
    console.error('❌ Error creando tiendas de prueba:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  await createTestStores();
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTestStores, Store };