const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'test'; // Reemplazar con un token válido

async function testSimplePromotion() {
  console.log('🧪 Prueba simple de promociones...\n');

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Cargar promociones existentes
    console.log('1️⃣ Cargando promociones...');
    const loadResponse = await fetch(`${BASE_URL}/promotions?page=1&limit=10`, { headers });
    
    console.log('Status:', loadResponse.status);
    console.log('Status Text:', loadResponse.statusText);
    
    if (!loadResponse.ok) {
      const errorText = await loadResponse.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const loadData = await loadResponse.json();
    console.log('Promociones encontradas:', loadData.promotions?.length || 0);
    console.log('Estructura de respuesta:', {
      success: loadData.success,
      hasPromotions: !!loadData.promotions,
      promotionsIsArray: Array.isArray(loadData.promotions),
      totalPages: loadData.totalPages,
      total: loadData.total
    });

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar pruebas
testSimplePromotion();
