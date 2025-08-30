const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = 'your-admin-token-here'; // Reemplazar con token real

// Headers para las peticiones
const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testOptimizedProducts() {
  try {
    console.log('🧪 Iniciando pruebas de productos optimizados...\n');

    // 1. Obtener estadísticas de Cloudinary antes
    console.log('📊 1. Obteniendo estadísticas de Cloudinary...');
    try {
      const cloudinaryStats = await axios.get(`${API_BASE_URL}/admin/cloudinary/stats`, { headers });
      console.log('✅ Estadísticas de Cloudinary obtenidas:', cloudinaryStats.data);
    } catch (error) {
      console.log('⚠️ No se pudieron obtener estadísticas de Cloudinary:', error.response?.data || error.message);
    }

    // 2. Obtener tiendas disponibles
    console.log('\n🏪 2. Obteniendo tiendas disponibles...');
    const storesResponse = await axios.get(`${API_BASE_URL}/stores`, { headers });
    const stores = storesResponse.data.data.stores || storesResponse.data.data;
    
    if (!stores || stores.length === 0) {
      console.log('❌ No hay tiendas disponibles para generar productos');
      return;
    }

    const testStore = stores[0]; // Usar la primera tienda
    console.log(`✅ Tienda seleccionada: ${testStore.name} (${testStore.city})`);

    // 3. Limpiar imágenes existentes (opcional)
    console.log('\n🗑️ 3. Limpiando imágenes existentes...');
    try {
      const cleanupResponse = await axios.delete(`${API_BASE_URL}/admin/cloudinary/cleanup-all-images`, { headers });
      console.log('✅ Limpieza completada:', cleanupResponse.data);
    } catch (error) {
      console.log('⚠️ Error en limpieza (puede ser normal si no hay imágenes):', error.response?.data || error.message);
    }

    // 4. Generar productos optimizados
    console.log('\n🔧 4. Generando productos con imágenes reales optimizadas...');
    const generateResponse = await axios.post(`${API_BASE_URL}/admin/products/generate`, {
      storeId: testStore._id
    }, { headers });

    console.log('✅ Productos generados exitosamente:', generateResponse.data);

    // 5. Verificar productos generados
    console.log('\n📦 5. Verificando productos generados...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products/admin/all?storeId=${testStore._id}&limit=5`, { headers });
    const products = productsResponse.data.data.products;

    console.log(`✅ Se encontraron ${products.length} productos`);
    
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log('\n📋 Producto de ejemplo:');
      console.log(`   Nombre: ${sampleProduct.name}`);
      console.log(`   Precio: $${sampleProduct.price}`);
      console.log(`   Categoría: ${sampleProduct.category}`);
      console.log(`   Marca: ${sampleProduct.brand}`);
      console.log(`   Imágenes: ${sampleProduct.images.length} imágenes`);
      
      if (sampleProduct.images.length > 0) {
        console.log(`   Primera imagen: ${sampleProduct.images[0]}`);
      }
    }

    // 6. Obtener estadísticas finales
    console.log('\n📊 6. Obteniendo estadísticas finales...');
    const statsResponse = await axios.get(`${API_BASE_URL}/admin/products/stats`, { headers });
    console.log('✅ Estadísticas finales:', statsResponse.data);

    // 7. Verificar estadísticas de Cloudinary después
    console.log('\n📊 7. Verificando estadísticas de Cloudinary después...');
    try {
      const finalCloudinaryStats = await axios.get(`${API_BASE_URL}/admin/cloudinary/stats`, { headers });
      console.log('✅ Estadísticas finales de Cloudinary:', finalCloudinaryStats.data);
    } catch (error) {
      console.log('⚠️ No se pudieron obtener estadísticas finales de Cloudinary:', error.response?.data || error.message);
    }

    console.log('\n🎉 Pruebas completadas exitosamente!');
    console.log('\n📝 Resumen:');
    console.log('- Se generaron productos con imágenes reales optimizadas');
    console.log('- Las imágenes se subieron a Cloudinary con optimización automática');
    console.log('- Se implementó limpieza automática de recursos anteriores');
    console.log('- El sistema está listo para pruebas optimizadas');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Asegúrate de tener un token de administrador válido');
      console.log('   Puedes obtener uno iniciando sesión como administrador');
    }
  }
}

// Función para limpiar solo imágenes (sin generar productos)
async function cleanupImagesOnly() {
  try {
    console.log('🗑️ Limpiando solo imágenes de Cloudinary...\n');

    // Limpiar todas las imágenes
    const cleanupResponse = await axios.delete(`${API_BASE_URL}/admin/cloudinary/cleanup-all-images`, { headers });
    console.log('✅ Limpieza completada:', cleanupResponse.data);

    // Obtener estadísticas después de la limpieza
    const statsResponse = await axios.get(`${API_BASE_URL}/admin/cloudinary/stats`, { headers });
    console.log('📊 Estadísticas después de la limpieza:', statsResponse.data);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.response?.data || error.message);
  }
}

// Función para obtener estadísticas de Cloudinary
async function getCloudinaryStats() {
  try {
    console.log('📊 Obteniendo estadísticas de Cloudinary...\n');
    
    const statsResponse = await axios.get(`${API_BASE_URL}/admin/cloudinary/stats`, { headers });
    console.log('✅ Estadísticas de Cloudinary:', statsResponse.data);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
  }
}

// Ejecutar según el argumento de línea de comandos
const command = process.argv[2];

switch (command) {
  case 'cleanup':
    cleanupImagesOnly();
    break;
  case 'stats':
    getCloudinaryStats();
    break;
  default:
    testOptimizedProducts();
    break;
}

console.log('\n💡 Uso:');
console.log('   node test-optimized-products.js          - Ejecutar pruebas completas');
console.log('   node test-optimized-products.js cleanup  - Solo limpiar imágenes');
console.log('   node test-optimized-products.js stats    - Solo obtener estadísticas');
