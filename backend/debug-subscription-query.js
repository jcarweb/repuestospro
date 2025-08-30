require('dotenv').config();
const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir esquemas simplificados
const storeSchema = new mongoose.Schema({
  name: String,
  description: String,
  address: String,
  phone: String,
  email: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  planName: { type: String, required: true },
  planType: { type: String, enum: ['basic', 'pro', 'elite'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired', 'pending', 'inactive'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  features: [String]
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

async function debugSubscriptionQuery() {
  try {
    console.log('🔍 Debugging subscription query...\n');

    const storeId = '68a8e0d44da9f15705c90a27'; // ID de "prueba de tienda"
    
    console.log('🏪 Store ID:', storeId);
    console.log('🏪 Store ID type:', typeof storeId);
    console.log('🏪 Store ID is ObjectId:', mongoose.Types.ObjectId.isValid(storeId));

    // Verificar que la tienda existe
    const store = await Store.findById(storeId);
    console.log('\n🏪 Tienda encontrada:', store ? 'Sí' : 'No');
    if (store) {
      console.log('   - Nombre:', store.name);
      console.log('   - Activa:', store.isActive);
    }

    // Buscar TODAS las suscripciones para esta tienda (sin filtros)
    console.log('\n🔍 Buscando TODAS las suscripciones para esta tienda...');
    const allSubscriptions = await Subscription.find({ storeId: storeId });
    console.log('📊 Total de suscripciones encontradas:', allSubscriptions.length);

    for (const sub of allSubscriptions) {
      console.log(`\n   📋 Suscripción ID: ${sub._id}`);
      console.log(`      - Plan: ${sub.planName}`);
      console.log(`      - Tipo: ${sub.planType}`);
      console.log(`      - Estado: ${sub.status}`);
      console.log(`      - Precio: $${sub.price}`);
      console.log(`      - Creada: ${sub.createdAt}`);
      console.log(`      - Expira: ${sub.expiresAt ? sub.expiresAt.toLocaleDateString() : 'No expira'}`);
    }

    // Ahora probar la consulta exacta del controlador
    console.log('\n🔍 Probando consulta del controlador...');
    const activeSubscription = await Subscription.findOne({ 
      storeId: storeId, 
      status: 'active' 
    }).sort({ createdAt: -1 });

    console.log('📊 Suscripción activa encontrada:', activeSubscription ? 'Sí' : 'No');
    
    if (activeSubscription) {
      console.log('   - Plan:', activeSubscription.planName);
      console.log('   - Tipo:', activeSubscription.planType);
      console.log('   - Estado:', activeSubscription.status);
    } else {
      console.log('❌ No se encontró suscripción activa');
      
      // Verificar si hay suscripciones con otros estados
      const pendingSubs = await Subscription.find({ storeId: storeId, status: 'pending' });
      const expiredSubs = await Subscription.find({ storeId: storeId, status: 'expired' });
      const inactiveSubs = await Subscription.find({ storeId: storeId, status: 'inactive' });
      
      console.log('📊 Suscripciones por estado:');
      console.log('   - Pending:', pendingSubs.length);
      console.log('   - Expired:', expiredSubs.length);
      console.log('   - Inactive:', inactiveSubs.length);
    }

  } catch (error) {
    console.error('Error en debug:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

debugSubscriptionQuery();
