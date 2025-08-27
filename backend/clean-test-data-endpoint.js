const axios = require('axios');
require('dotenv').config();

async function cleanTestData() {
  try {
    console.log('🧹 Iniciando limpieza de datos de prueba...');
    
    // Primero, obtener todas las tiendas
    const response = await axios.get('http://localhost:5000/api/admin/store-subscriptions', {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'your-admin-token-here'}`
      }
    });
    
    if (response.data.success) {
      const stores = response.data.storeSubscriptions || [];
      console.log(`📊 Encontradas ${stores.length} tiendas en total`);
      
      // Identificar tiendas de prueba
      const testStoreNames = [
        'AutoParts Express',
        'Mega Repuestos',
        'Super Auto Parts',
        'Elite Repuestos',
        'Premium Auto Parts'
      ];
      
      const testStores = stores.filter(store => 
        testStoreNames.includes(store.store.name)
      );
      
      console.log(`📋 Encontradas ${testStores.length} tiendas de prueba:`);
      testStores.forEach(store => {
        console.log(`   - ${store.store.name} (${store.store.city})`);
      });
      
      if (testStores.length === 0) {
        console.log('✅ No se encontraron tiendas de prueba para eliminar');
      } else {
        console.log('⚠️ Para eliminar las tiendas de prueba, ejecuta manualmente en MongoDB:');
        console.log('db.stores.deleteMany({name: {$in: ["AutoParts Express", "Mega Repuestos", "Super Auto Parts", "Elite Repuestos", "Premium Auto Parts"]}})');
        console.log('db.products.deleteMany({store: {$in: [/* IDs de las tiendas eliminadas */]}})');
      }
      
      // Mostrar tiendas restantes
      const remainingStores = stores.filter(store => 
        !testStoreNames.includes(store.store.name)
      );
      
      console.log('\n📊 Tiendas reales restantes:');
      remainingStores.forEach(store => {
        console.log(`   - ${store.store.name} (${store.store.city}, ${store.store.state}) - ${store.subscriptionStatus}`);
      });
      
    } else {
      console.error('❌ Error obteniendo tiendas:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Respuesta del servidor:', error.response.data);
    }
  }
}

cleanTestData();
