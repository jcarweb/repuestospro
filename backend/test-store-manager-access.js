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
  totalAmount: Number,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);
const Store = mongoose.model('Store', storeSchema);
const Order = mongoose.model('Order', orderSchema);

async function testStoreManagerAccess() {
  try {
    console.log('🔍 Verificando acceso del gestor de tienda a los datos...');
    
    // 1. Buscar el gestor de tienda
    const storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com',
      role: 'store_manager'
    }).populate('stores');
    
    if (!storeManager) {
      console.log('❌ Gestor de tienda no encontrado');
      return;
    }
    
    console.log('✅ Gestor de tienda encontrado:');
    console.log(`   - Nombre: ${storeManager.name}`);
    console.log(`   - Email: ${storeManager.email}`);
    console.log(`   - Tiendas: ${storeManager.stores?.length || 0}`);
    
    if (storeManager.stores && storeManager.stores.length > 0) {
      storeManager.stores.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (${store.city})`);
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
        
        console.log(`   - ${store.name}: ${storeOrders} órdenes, $${totalAmount.toFixed(2)}`);
      }
    }
    
    // 4. Verificar órdenes de los últimos 2 meses
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: twoMonthsAgo }
    });
    
    console.log(`\n📅 Órdenes de los últimos 2 meses: ${recentOrders}`);
    
    // 5. Verificar órdenes recientes por tienda del gestor
    if (storeManager.stores && storeManager.stores.length > 0) {
      console.log('\n📈 Órdenes recientes por tienda del gestor:');
      
      for (const store of storeManager.stores) {
        const recentStoreOrders = await Order.countDocuments({
          storeId: store._id,
          createdAt: { $gte: twoMonthsAgo }
        });
        
        const recentStoreTotal = await Order.aggregate([
          { 
            $match: { 
              storeId: store._id,
              createdAt: { $gte: twoMonthsAgo }
            } 
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        const recentTotalAmount = recentStoreTotal.length > 0 ? recentStoreTotal[0].total : 0;
        
        console.log(`   - ${store.name}: ${recentStoreOrders} órdenes, $${recentTotalAmount.toFixed(2)}`);
      }
    }
    
    // 6. Simular lo que vería el gestor en el dashboard
    console.log('\n🎯 Simulación del dashboard del gestor:');
    
    if (storeManager.stores && storeManager.stores.length > 0) {
      const firstStore = storeManager.stores[0];
      
      // Órdenes de la primera tienda en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const last30DaysOrders = await Order.countDocuments({
        storeId: firstStore._id,
        createdAt: { $gte: thirtyDaysAgo }
      });
      
      const last30DaysTotal = await Order.aggregate([
        { 
          $match: { 
            storeId: firstStore._id,
            createdAt: { $gte: thirtyDaysAgo }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      
      const last30DaysAmount = last30DaysTotal.length > 0 ? last30DaysTotal[0].total : 0;
      
      console.log(`   - Tienda activa: ${firstStore.name}`);
      console.log(`   - Órdenes (30 días): ${last30DaysOrders}`);
      console.log(`   - Ventas (30 días): $${last30DaysAmount.toFixed(2)}`);
      console.log(`   - Promedio por orden: $${last30DaysOrders > 0 ? (last30DaysAmount / last30DaysOrders).toFixed(2) : '0.00'}`);
    }
    
    console.log('\n✅ Verificación completada. El gestor de tienda debería poder ver los datos.');
    
  } catch (error) {
    console.error('❌ Error verificando acceso:', error);
  } finally {
    mongoose.connection.close();
  }
}

testStoreManagerAccess();
