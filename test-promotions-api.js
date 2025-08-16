const fetch = require('node-fetch');

async function testPromotionsAPI() {
  try {
    console.log('🔍 Probando API de promociones...\n');
    
    // Probar endpoint de tiendas
    console.log('📡 Probando GET /api/promotions/stores/available...');
    const responseStores = await fetch('http://localhost:5000/api/promotions/stores/available');
    
    if (responseStores.ok) {
      const dataStores = await responseStores.json();
      console.log('✅ Tiendas - Status:', responseStores.status);
      console.log('✅ Tiendas - Success:', dataStores.success);
      console.log('✅ Tiendas - Data length:', dataStores.data ? dataStores.data.length : 'No data');
      
      if (dataStores.success && dataStores.data && dataStores.data.length > 0) {
        console.log('\n📋 Tiendas disponibles:');
        dataStores.data.slice(0, 3).forEach((store, index) => {
          console.log(`   ${index + 1}. ${store.name} - ${store.city}, ${store.state}`);
        });
      }
    } else {
      console.log('❌ Error en tiendas:', responseStores.status, responseStores.statusText);
    }
    
    // Probar endpoint de productos
    console.log('\n📡 Probando GET /api/promotions/products/available...');
    const responseProducts = await fetch('http://localhost:5000/api/promotions/products/available');
    
    if (responseProducts.ok) {
      const dataProducts = await responseProducts.json();
      console.log('✅ Productos - Status:', responseProducts.status);
      console.log('✅ Productos - Success:', dataProducts.success);
      console.log('✅ Productos - Data length:', dataProducts.data ? dataProducts.data.length : 'No data');
      
      if (dataProducts.success && dataProducts.data && dataProducts.data.length > 0) {
        console.log('\n📋 Productos disponibles:');
        dataProducts.data.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ${product.store?.name || 'Sin tienda'} - $${product.price}`);
        });
      }
    } else {
      console.log('❌ Error en productos:', responseProducts.status, responseProducts.statusText);
    }
    
    // Probar endpoint de promociones
    console.log('\n📡 Probando GET /api/promotions...');
    const responsePromotions = await fetch('http://localhost:5000/api/promotions');
    
    if (responsePromotions.ok) {
      const dataPromotions = await responsePromotions.json();
      console.log('✅ Promociones - Status:', responsePromotions.status);
      console.log('✅ Promociones - Success:', dataPromotions.success);
      console.log('✅ Promociones - Data length:', dataPromotions.data ? dataPromotions.data.length : 'No data');
    } else {
      console.log('❌ Error en promociones:', responsePromotions.status, responsePromotions.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPromotionsAPI();
