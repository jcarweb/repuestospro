const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:5000/api';

// Token de prueba - reemplazar con un token válido del localStorage
const TOKEN = 'test'; // Cambiar por un token válido

async function testPromotionSimple() {
  console.log('🧪 Prueba simple de promociones...\n');

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Verificar si el backend está funcionando
    console.log('1️⃣ Verificando backend...');
    const healthResponse = await fetch(`${BASE_URL.replace('/api', '')}/health`);
    console.log('Health check status:', healthResponse.status);
    
    if (!healthResponse.ok) {
      console.log('❌ Backend no está funcionando');
      return;
    }
    console.log('✅ Backend funcionando\n');

    // 2. Cargar promociones existentes
    console.log('2️⃣ Cargando promociones existentes...');
    const loadResponse = await fetch(`${BASE_URL}/promotions?page=1&limit=10`, { headers });
    
    console.log('Status:', loadResponse.status);
    
    if (!loadResponse.ok) {
      const errorText = await loadResponse.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const loadData = await loadResponse.json();
    console.log('Promociones existentes:', loadData.promotions?.length || 0);
    console.log('Total en BD:', loadData.total);
    console.log('');

    // 3. Crear una nueva promoción
    console.log('3️⃣ Creando nueva promoción...');
    const testPromotion = {
      name: 'Promoción Test - ' + Date.now(),
      description: 'Promoción de prueba',
      type: 'percentage',
      discountPercentage: 20,
      products: [],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      scope: 'store',
      isMainStorePromotion: false
    };

    const createResponse = await fetch(`${BASE_URL}/promotions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPromotion)
    });

    console.log('Create status:', createResponse.status);
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Error creating:', errorText);
      return;
    }

    const createData = await createResponse.json();
    console.log('Promoción creada:', createData.success ? 'SÍ' : 'NO');
    console.log('ID de promoción:', createData.data?._id);
    console.log('');

    // 4. Cargar promociones nuevamente
    console.log('4️⃣ Cargando promociones después de crear...');
    const loadAfterResponse = await fetch(`${BASE_URL}/promotions?page=1&limit=10`, { headers });
    const loadAfterData = await loadAfterResponse.json();
    
    console.log('Promociones después:', loadAfterData.promotions?.length || 0);
    console.log('Total después:', loadAfterData.total);

    // 5. Verificar si la nueva promoción está en la lista
    if (loadAfterData.promotions && Array.isArray(loadAfterData.promotions)) {
      const newPromotion = loadAfterData.promotions.find(p => p.name === testPromotion.name);
      console.log('Nueva promoción en lista:', !!newPromotion);
    }

    // Resumen
    console.log('\n📊 RESUMEN:');
    console.log(`Antes: ${loadData.promotions?.length || 0} promociones`);
    console.log(`Después: ${loadAfterData.promotions?.length || 0} promociones`);
    console.log(`Creación exitosa: ${createData.success ? 'SÍ' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar prueba
testPromotionSimple();
