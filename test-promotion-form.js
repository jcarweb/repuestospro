const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'test'; // Reemplazar con un token válido

async function testEndpoints() {
  console.log('🧪 Probando endpoints del formulario de promociones...\n');

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Probar endpoint de productos
    console.log('1️⃣ Probando endpoint de productos...');
    const productsResponse = await fetch(`${BASE_URL}/products/store-manager/all?limit=10`, { headers });
    const productsData = await productsResponse.json();
    
    console.log('Status:', productsResponse.status);
    console.log('Productos encontrados:', productsData.data?.products?.length || 0);
    console.log('Estructura de respuesta:', {
      success: productsData.success,
      hasData: !!productsData.data,
      hasProducts: !!productsData.data?.products,
      productsIsArray: Array.isArray(productsData.data?.products)
    });
    console.log('Primer producto:', productsData.data?.products?.[0]?.name || 'No hay productos');
    console.log('');

    // 2. Probar endpoint de categorías
    console.log('2️⃣ Probando endpoint de categorías...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`, { headers });
    const categoriesData = await categoriesResponse.json();
    
    console.log('Status:', categoriesResponse.status);
    console.log('Categorías encontradas:', categoriesData.data?.length || 0);
    console.log('Estructura de respuesta:', {
      success: categoriesData.success,
      hasData: !!categoriesData.data,
      dataIsArray: Array.isArray(categoriesData.data)
    });
    console.log('Primera categoría:', categoriesData.data?.[0]?.name || 'No hay categorías');
    console.log('');

    // 3. Probar endpoint de sucursales
    console.log('3️⃣ Probando endpoint de sucursales...');
    const branchesResponse = await fetch(`${BASE_URL}/stores/branches`, { headers });
    const branchesData = await branchesResponse.json();
    
    console.log('Status:', branchesResponse.status);
    console.log('Sucursales encontradas:', branchesData.data?.length || 0);
    console.log('Estructura de respuesta:', {
      success: branchesData.success,
      hasData: !!branchesData.data,
      dataIsArray: Array.isArray(branchesData.data)
    });
    console.log('Primera sucursal:', branchesData.data?.[0]?.name || 'No hay sucursales');
    console.log('');

    // Resumen
    console.log('📊 RESUMEN:');
    console.log(`✅ Productos: ${productsData.data?.products?.length || 0} encontrados`);
    console.log(`✅ Categorías: ${categoriesData.data?.length || 0} encontradas`);
    console.log(`✅ Sucursales: ${branchesData.data?.length || 0} encontradas`);

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testEndpoints();
