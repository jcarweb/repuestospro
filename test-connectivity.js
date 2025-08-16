const fetch = require('node-fetch');

async function testConnectivity() {
  console.log('🔍 Probando conectividad con el backend...\n');
  
  const ports = [5000, 5001];
  const endpoints = [
    '/api/promotions/stores/available',
    '/api/promotions/products/available',
    '/api/promotions/categories/available'
  ];
  
  for (const port of ports) {
    console.log(`📡 Probando puerto ${port}:`);
    
    for (const endpoint of endpoints) {
      try {
        const url = `http://localhost:${port}${endpoint}`;
        console.log(`  🔗 ${url}`);
        
        const response = await fetch(url, { timeout: 5000 });
        
        if (response.ok) {
          console.log(`  ✅ Conectado (Status: ${response.status})`);
        } else {
          console.log(`  ⚠️  Respuesta no exitosa (Status: ${response.status})`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  console.log('🏁 Prueba de conectividad completada');
}

testConnectivity();
