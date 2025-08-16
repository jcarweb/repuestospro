const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Probando API de subcategorías...\n');
    
    // Probar endpoint público
    console.log('📡 Probando GET /api/subcategories...');
    const response = await fetch('http://localhost:5000/api/subcategories');
    
    if (!response.ok) {
      console.log('❌ Error en la respuesta:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Data length:', data.data ? data.data.length : 'No data');
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('\n📋 Primeras 3 subcategorías:');
      data.data.slice(0, 3).forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.name} (${sub.categoryId?.name || 'Sin categoría'}) - ${sub.vehicleType}`);
      });
    } else {
      console.log('⚠️ No se encontraron subcategorías o hubo un error');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
