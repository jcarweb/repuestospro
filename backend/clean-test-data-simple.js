const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanTestData() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro');
  
  try {
    console.log('🧹 Iniciando limpieza de datos de prueba...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db();
    
    // 1. Identificar tiendas de prueba (por nombre)
    const testStoreNames = [
      'AutoParts Express',
      'Mega Repuestos',
      'Super Auto Parts',
      'Elite Repuestos',
      'Premium Auto Parts'
    ];
    
    console.log('🔍 Buscando tiendas de prueba...');
    const storesCollection = db.collection('stores');
    const testStores = await storesCollection.find({
      name: { $in: testStoreNames }
    }).toArray();
    
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
      
      const productsCollection = db.collection('products');
      const deletedProducts = await productsCollection.deleteMany({
        store: { $in: testStoreIds }
      });
      
      console.log(`✅ Eliminados ${deletedProducts.deletedCount} productos de prueba`);
      
      // 3. Eliminar las tiendas de prueba
      console.log('🗑️ Eliminando tiendas de prueba...');
      
      const deletedStores = await storesCollection.deleteMany({
        _id: { $in: testStoreIds }
      });
      
      console.log(`✅ Eliminadas ${deletedStores.deletedCount} tiendas de prueba`);
    }
    
    // 4. Mostrar tiendas restantes
    console.log('\n📊 Tiendas restantes:');
    const remainingStores = await storesCollection.find({}).project({
      name: 1,
      city: 1,
      state: 1,
      isActive: 1
    }).toArray();
    
    if (remainingStores.length === 0) {
      console.log('⚠️ No hay tiendas en la base de datos');
    } else {
      remainingStores.forEach(store => {
        console.log(`   - ${store.name} (${store.city}, ${store.state}) - ${store.isActive ? 'Activa' : 'Inactiva'}`);
      });
    }
    
    // 5. Mostrar estadísticas finales
    const totalStores = await storesCollection.countDocuments();
    const totalProducts = await productsCollection.countDocuments();
    const totalUsers = await db.collection('users').countDocuments();
    
    console.log('\n📈 Estadísticas finales:');
    console.log(`   - Tiendas: ${totalStores}`);
    console.log(`   - Productos: ${totalProducts}`);
    console.log(`   - Usuarios: ${totalUsers}`);
    
    console.log('\n✅ Limpieza completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await client.close();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la limpieza
cleanTestData();
