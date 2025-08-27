const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importar modelos
const Store = require('./dist/models/Store');
const Product = require('./dist/models/Product');
const User = require('./dist/models/User');

async function cleanTestData() {
  try {
    console.log('🧹 Iniciando limpieza de datos de prueba...');
    
    // 1. Identificar tiendas de prueba (por nombre)
    const testStoreNames = [
      'AutoParts Express',
      'Mega Repuestos',
      'Super Auto Parts',
      'Elite Repuestos',
      'Premium Auto Parts'
    ];
    
    console.log('🔍 Buscando tiendas de prueba...');
    const testStores = await Store.find({
      name: { $in: testStoreNames }
    });
    
    console.log(`📋 Encontradas ${testStores.length} tiendas de prueba:`);
    testStores.forEach(store => {
      console.log(`   - ${store.name} (${store.city})`);
    });
    
    if (testStores.length === 0) {
      console.log('✅ No se encontraron tiendas de prueba para eliminar');
    } else {
      // 2. Eliminar productos de estas tiendas
      const testStoreIds = testStores.map(store => store._id);
      console.log('🗑️ Eliminando productos de tiendas de prueba...');
      
      const deletedProducts = await Product.deleteMany({
        store: { $in: testStoreIds }
      });
      
      console.log(`✅ Eliminados ${deletedProducts.deletedCount} productos de prueba`);
      
      // 3. Eliminar las tiendas de prueba
      console.log('🗑️ Eliminando tiendas de prueba...');
      
      const deletedStores = await Store.deleteMany({
        _id: { $in: testStoreIds }
      });
      
      console.log(`✅ Eliminadas ${deletedStores.deletedCount} tiendas de prueba`);
    }
    
    // 4. Mostrar tiendas restantes
    console.log('\n📊 Tiendas restantes:');
    const remainingStores = await Store.find().select('name city state isActive');
    
    if (remainingStores.length === 0) {
      console.log('⚠️ No hay tiendas en la base de datos');
    } else {
      remainingStores.forEach(store => {
        console.log(`   - ${store.name} (${store.city}, ${store.state}) - ${store.isActive ? 'Activa' : 'Inactiva'}`);
      });
    }
    
    // 5. Mostrar estadísticas finales
    const totalStores = await Store.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    
    console.log('\n📈 Estadísticas finales:');
    console.log(`   - Tiendas: ${totalStores}`);
    console.log(`   - Productos: ${totalProducts}`);
    console.log(`   - Usuarios: ${totalUsers}`);
    
    console.log('\n✅ Limpieza completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la limpieza
cleanTestData();
