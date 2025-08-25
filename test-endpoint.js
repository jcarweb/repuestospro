const fetch = require('node-fetch');

async function testProductEndpoint() {
  console.log('🧪 Probando endpoint de creación de productos...');
  
  try {
    // Datos de prueba
    const testProduct = {
      name: 'Producto de Prueba',
      description: 'Descripción de prueba',
      price: 100,
      category: 'Motor',
      brand: 'Toyota',
      subcategory: 'Frenos',
      sku: `TEST-${Date.now()}`,
      originalPartCode: 'TEST-001',
      stock: 10,
      isFeatured: false,
      tags: ['test'],
      specifications: { test: 'valor' },
      images: [],
      storeId: '68a8e0d44da9f15705c90a27' // El mismo storeId que usaste
    };

    console.log('📝 Datos de prueba:', testProduct);

    const response = await fetch('http://localhost:5000/api/products/store-manager/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de prueba
      },
      body: JSON.stringify(testProduct)
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response ok:', response.ok);

    const data = await response.json();
    console.log('📄 Response data:', data);

    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente');
    } else {
      console.log('❌ Endpoint devolvió error:', data);
    }

  } catch (error) {
    console.error('❌ Error probando endpoint:', error.message);
  }
}

testProductEndpoint();
