const http = require('http');

// Función para probar un endpoint
function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`✅ ${description}: ${res.statusCode} - ${res.statusMessage}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${description}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

// Función principal para probar todos los servicios
async function testAllServices() {
  console.log('🔍 Probando servicios...\n');

  const tests = [
    { url: 'http://localhost:3000', description: 'Frontend (React)' },
    { url: 'http://localhost:5000/health', description: 'Backend Health Check' },
    { url: 'http://localhost:5000/api/db-status', description: 'Backend DB Status' }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    if (result) passed++;
  }

  console.log(`\n📊 Resultados: ${passed}/${total} servicios funcionando`);
  
  if (passed === total) {
    console.log('🎉 ¡Todos los servicios están funcionando correctamente!');
    console.log('\n🌐 URLs disponibles:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000');
    console.log('   Health Check: http://localhost:5000/health');
  } else {
    console.log('⚠️  Algunos servicios no están funcionando. Verifica los logs.');
  }
}

// Ejecutar las pruebas
testAllServices(); 