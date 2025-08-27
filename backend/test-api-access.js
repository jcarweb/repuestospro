const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquemas simplificados
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }],
  isEmailVerified: Boolean,
  isActive: Boolean
});

const storeSchema = new mongoose.Schema({
  name: String,
  description: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  phone: String,
  email: String,
  isMainStore: Boolean,
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: Number,
  taxAmount: Number,
  commissionAmount: Number,
  warrantyTotal: Number,
  shippingCost: Number,
  discountAmount: Number,
  totalAmount: Number,
  currency: String,
  orderStatus: String,
  paymentStatus: String,
  fulfillmentStatus: String,
  paymentMethod: String,
  shippingMethod: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  warrantyEnabled: Boolean,
  warrantyLevel: String,
  warrantyCoverage: Number,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);
const Store = mongoose.model('Store', storeSchema);
const Order = mongoose.model('Order', orderSchema);

async function testAPIAccess() {
  try {
    console.log('🔍 Verificando acceso a la API del gestor de tienda...');
    
    // 1. Verificar que el gestor existe
    const storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com',
      role: 'store_manager'
    }).populate('stores');
    
    if (!storeManager) {
      console.log('❌ Gestor de tienda no encontrado');
      return;
    }
    
    console.log('✅ Gestor de tienda encontrado:');
    console.log(`   - ID: ${storeManager._id}`);
    console.log(`   - Nombre: ${storeManager.name}`);
    console.log(`   - Email: ${storeManager.email}`);
    console.log(`   - Rol: ${storeManager.role}`);
    console.log(`   - Tiendas: ${storeManager.stores?.length || 0}`);
    
    if (storeManager.stores && storeManager.stores.length > 0) {
      storeManager.stores.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (ID: ${store._id})`);
      });
    }
    
    // 2. Verificar órdenes totales
    const totalOrders = await Order.countDocuments();
    console.log(`\n📊 Total de órdenes en la base de datos: ${totalOrders}`);
    
    // 3. Verificar órdenes por tienda del gestor
    if (storeManager.stores && storeManager.stores.length > 0) {
      console.log('\n🏪 Órdenes por tienda del gestor:');
      
      for (const store of storeManager.stores) {
        const storeOrders = await Order.countDocuments({ storeId: store._id });
        const storeTotal = await Order.aggregate([
          { $match: { storeId: store._id } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        const totalAmount = storeTotal.length > 0 ? storeTotal[0].total : 0;
        
        console.log(`   - ${store.name} (${store._id}): ${storeOrders} órdenes, $${totalAmount.toFixed(2)}`);
      }
    }
    
    // 4. Simular la consulta que haría el controlador
    console.log('\n🎯 Simulando consulta del controlador...');
    
    if (storeManager.stores && storeManager.stores.length > 0) {
      const firstStoreId = storeManager.stores[0]._id;
      
      // Fechas de los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Consulta que haría el controlador
      const ordersForStore = await Order.find({
        storeId: firstStoreId,
        createdAt: { $gte: thirtyDaysAgo }
      });
      
      console.log(`   - Tienda: ${storeManager.stores[0].name}`);
      console.log(`   - StoreId filtrado: ${firstStoreId}`);
      console.log(`   - Fecha desde: ${thirtyDaysAgo.toISOString()}`);
      console.log(`   - Órdenes encontradas: ${ordersForStore.length}`);
      
      if (ordersForStore.length > 0) {
        const totalAmount = ordersForStore.reduce((sum, order) => sum + order.totalAmount, 0);
        console.log(`   - Total ventas: $${totalAmount.toFixed(2)}`);
        console.log(`   - Promedio por orden: $${(totalAmount / ordersForStore.length).toFixed(2)}`);
      }
    }
    
    // 5. Verificar si hay órdenes sin storeId
    const ordersWithoutStore = await Order.countDocuments({ storeId: { $exists: false } });
    const ordersWithNullStore = await Order.countDocuments({ storeId: null });
    
    console.log(`\n🔍 Verificaciones adicionales:`);
    console.log(`   - Órdenes sin storeId: ${ordersWithoutStore}`);
    console.log(`   - Órdenes con storeId null: ${ordersWithNullStore}`);
    
    // 6. Verificar todas las órdenes recientes
    const recentOrders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).populate('storeId');
    
    console.log(`\n📅 Órdenes recientes (últimos 30 días):`);
    console.log(`   - Total: ${recentOrders.length}`);
    
    if (recentOrders.length > 0) {
      const storeCounts = {};
      recentOrders.forEach(order => {
        const storeName = order.storeId ? order.storeId.name : 'Sin tienda';
        storeCounts[storeName] = (storeCounts[storeName] || 0) + 1;
      });
      
      Object.entries(storeCounts).forEach(([storeName, count]) => {
        console.log(`   - ${storeName}: ${count} órdenes`);
      });
    }
    
    console.log('\n✅ Verificación de API completada.');
    
  } catch (error) {
    console.error('❌ Error verificando API:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAPIAccess();
