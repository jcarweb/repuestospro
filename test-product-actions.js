const fetch = require('node-fetch');

async function testProductActions() {
  console.log('🧪 Probando acciones de productos...');
  
  try {
    // Primero, obtener un producto para probar
    console.log('📋 Obteniendo productos...');
    const productsResponse = await fetch('http://localhost:5000/api/products/store-manager/all', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    if (!productsResponse.ok) {
      console.log('❌ Error obteniendo productos:', productsResponse.status);
      return;
    }

    const productsData = await productsResponse.json();
    const products = productsData.data?.products || [];
    
    if (products.length === 0) {
      console.log('❌ No hay productos para probar');
      return;
    }

    const testProduct = products[0];
    console.log('✅ Producto para probar:', testProduct.name, '(ID:', testProduct._id, ')');
    console.log('📊 Estado actual isActive:', testProduct.isActive);

    // Probar activar/desactivar
    console.log('\n🔄 Probando activar/desactivar...');
    const newStatus = !testProduct.isActive;
    
    const toggleResponse = await fetch(`http://localhost:5000/api/products/store-manager/${testProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ isActive: newStatus })
    });

    console.log('📊 Response status:', toggleResponse.status);
    
    if (toggleResponse.ok) {
      const toggleData = await toggleResponse.json();
      console.log('✅ Producto actualizado:', toggleData.message);
      console.log('📊 Nuevo estado isActive:', toggleData.data?.isActive);
    } else {
      const errorData = await toggleResponse.json();
      console.log('❌ Error actualizando producto:', errorData);
    }

    // Probar eliminar (desactivar)
    console.log('\n🗑️ Probando eliminar (desactivar)...');
    
    const deleteResponse = await fetch(`http://localhost:5000/api/products/store-manager/${testProduct._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('📊 Response status:', deleteResponse.status);
    
    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ Producto eliminado:', deleteData.message);
    } else {
      const errorData = await deleteResponse.json();
      console.log('❌ Error eliminando producto:', errorData);
    }

  } catch (error) {
    console.error('❌ Error probando acciones:', error.message);
  }
}

testProductActions();
