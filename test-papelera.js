const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/products';
const TOKEN = 'your-token-here'; // Reemplazar con un token válido

async function testPapelera() {
  console.log('🧪 Probando sistema de papelera...\n');

  try {
    // 1. Obtener productos activos (deberían excluir los eliminados)
    console.log('1️⃣ Obteniendo productos activos...');
    const activeResponse = await fetch(`${BASE_URL}/store-manager/all`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (activeResponse.ok) {
      const activeData = await activeResponse.json();
      console.log(`✅ Productos activos encontrados: ${activeData.data.products.length}`);
      
      // Verificar que no hay productos con deleted: true
      const deletedInActive = activeData.data.products.filter(p => p.deleted);
      if (deletedInActive.length > 0) {
        console.log(`❌ ERROR: ${deletedInActive.length} productos eliminados aparecen en la lista activa`);
        deletedInActive.forEach(p => console.log(`   - ${p.name} (SKU: ${p.sku})`));
      } else {
        console.log('✅ No hay productos eliminados en la lista activa');
      }
    } else {
      console.log('❌ Error obteniendo productos activos');
    }

    console.log('\n2️⃣ Obteniendo productos en papelera...');
    const trashResponse = await fetch(`${BASE_URL}/store-manager/trash`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (trashResponse.ok) {
      const trashData = await trashResponse.json();
      console.log(`✅ Productos en papelera: ${trashData.data.products.length}`);
      
      if (trashData.data.products.length > 0) {
        console.log('📋 Productos en papelera:');
        trashData.data.products.forEach(p => {
          console.log(`   - ${p.name} (SKU: ${p.sku}) - Eliminado: ${p.deletedAt}`);
        });
      }
    } else {
      console.log('❌ Error obteniendo productos en papelera');
    }

    console.log('\n3️⃣ Obteniendo estadísticas...');
    const statsResponse = await fetch(`${BASE_URL}/store-manager/stats`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Estadísticas obtenidas:');
      console.log(`   - Total productos: ${statsData.data.totalProducts}`);
      console.log(`   - Productos activos: ${statsData.data.activeProducts}`);
      console.log(`   - Productos destacados: ${statsData.data.featuredProducts}`);
      console.log(`   - Stock bajo: ${statsData.data.lowStockProducts}`);
      console.log(`   - Sin stock: ${statsData.data.outOfStockProducts}`);
    } else {
      console.log('❌ Error obteniendo estadísticas');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testPapelera();
