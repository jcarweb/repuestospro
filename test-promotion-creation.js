const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'test'; // Reemplazar con un token válido

async function testPromotionCreation() {
  console.log('🧪 Probando creación y carga de promociones...\n');

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Primero, cargar promociones existentes
    console.log('1️⃣ Cargando promociones existentes...');
    const loadResponse = await fetch(`${BASE_URL}/promotions?page=1&limit=10`, { headers });
    const loadData = await loadResponse.json();
    
    console.log('Status:', loadResponse.status);
    console.log('Promociones existentes:', loadData.promotions?.length || 0);
    console.log('Estructura de respuesta:', {
      success: loadData.success,
      hasPromotions: !!loadData.promotions,
      promotionsIsArray: Array.isArray(loadData.promotions),
      totalPages: loadData.totalPages,
      total: loadData.total
    });
    console.log('');

    // 2. Crear una nueva promoción de prueba
    console.log('2️⃣ Creando nueva promoción...');
    const testPromotion = {
      name: 'Promoción de Prueba',
      description: 'Esta es una promoción de prueba para verificar la funcionalidad',
      type: 'percentage',
      discountPercentage: 15,
      products: [], // Se necesitarían IDs de productos reales
      startDate: '2024-01-01',
      startTime: '00:00',
      endDate: '2024-12-31',
      endTime: '23:59',
      isActive: true,
      ribbonText: 'PRUEBA',
      ribbonPosition: 'top-left',
      showOriginalPrice: true,
      showDiscountAmount: true,
      maxUses: 100,
      scope: 'store'
    };

    const createResponse = await fetch(`${BASE_URL}/promotions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPromotion)
    });

    const createData = await createResponse.json();
    console.log('Status:', createResponse.status);
    console.log('Respuesta de creación:', {
      success: createData.success,
      message: createData.message,
      hasData: !!createData.data,
      promotionId: createData.data?._id
    });
    console.log('');

    // 3. Cargar promociones nuevamente para verificar que se agregó
    console.log('3️⃣ Cargando promociones después de crear...');
    const loadAfterResponse = await fetch(`${BASE_URL}/promotions?page=1&limit=10`, { headers });
    const loadAfterData = await loadAfterResponse.json();
    
    console.log('Status:', loadAfterResponse.status);
    console.log('Promociones después de crear:', loadAfterData.promotions?.length || 0);
    console.log('Estructura de respuesta:', {
      success: loadAfterData.success,
      hasPromotions: !!loadAfterData.promotions,
      promotionsIsArray: Array.isArray(loadAfterData.promotions),
      totalPages: loadAfterData.totalPages,
      total: loadAfterData.total
    });

    // 4. Verificar si la nueva promoción está en la lista
    if (loadAfterData.promotions && Array.isArray(loadAfterData.promotions)) {
      const newPromotion = loadAfterData.promotions.find(p => p.name === 'Promoción de Prueba');
      console.log('Nueva promoción encontrada:', !!newPromotion);
      if (newPromotion) {
        console.log('Detalles de la nueva promoción:', {
          id: newPromotion._id,
          name: newPromotion.name,
          type: newPromotion.type,
          isActive: newPromotion.isActive
        });
      }
    }

    // Resumen
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Promociones antes: ${loadData.promotions?.length || 0}`);
    console.log(`✅ Promociones después: ${loadAfterData.promotions?.length || 0}`);
    console.log(`✅ Creación exitosa: ${createData.success ? 'SÍ' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testPromotionCreation();
