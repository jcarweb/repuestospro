const fetch = require('node-fetch');

// Configuraciones de red para probar
const NETWORK_CONFIGS = {
  '192.168.150.104': 'http://192.168.150.104:3001/api',
  '192.168.31.122': 'http://192.168.31.122:3001/api',
  '192.168.1.100': 'http://192.168.1.100:3001/api',
  '10.0.0.100': 'http://10.0.0.100:3001/api',
  '172.20.10.1': 'http://172.20.10.1:3001/api',
  'localhost': 'http://localhost:3001/api',
};

// Función para probar conexión
async function testConnection(url, description) {
  try {
    console.log(`🔍 Probando: ${description}`);
    console.log(`   URL: ${url}`);
    
    // Probar endpoint de health
    try {
      const healthResponse = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log(`   ✅ Health check exitoso:`, data.message);
        return true;
      } else {
        console.log(`   ❌ Health check falló: ${healthResponse.status} ${healthResponse.statusText}`);
      }
    } catch (healthError) {
      console.log(`   ⚠️ Health check error:`, healthError.message);
    }

    // Probar endpoint raíz de la API
    try {
      const apiResponse = await fetch(`${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      
      if (apiResponse.ok || apiResponse.status === 404) {
        console.log(`   ✅ API endpoint accesible: ${apiResponse.status} ${apiResponse.statusText}`);
        return true;
      } else {
        console.log(`   ❌ API endpoint falló: ${apiResponse.status} ${apiResponse.statusText}`);
      }
    } catch (apiError) {
      console.log(`   ⚠️ API endpoint error:`, apiError.message);
    }

    return false;
  } catch (error) {
    console.log(`   ❌ Error general:`, error.message);
    return false;
  }
}

// Función principal de diagnóstico
async function diagnoseNetwork() {
  console.log('🌐 DIAGNÓSTICO DE RED PARA APP MÓVIL');
  console.log('=====================================\n');

  const results = [];

  for (const [name, url] of Object.entries(NETWORK_CONFIGS)) {
    const isWorking = await testConnection(url, name);
    results.push({ name, url, isWorking });
    console.log(''); // Línea en blanco para separar
  }

  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('========================');
  
  const working = results.filter(r => r.isWorking);
  const notWorking = results.filter(r => !r.isWorking);

  if (working.length > 0) {
    console.log('\n✅ CONEXIONES EXITOSAS:');
    working.forEach(r => console.log(`   • ${r.name}: ${r.url}`));
  }

  if (notWorking.length > 0) {
    console.log('\n❌ CONEXIONES FALLIDAS:');
    notWorking.forEach(r => console.log(`   • ${r.name}: ${r.url}`));
  }

  console.log('\n💡 RECOMENDACIONES:');
  if (working.length > 0) {
    console.log('   • Usa una de las conexiones exitosas en la app móvil');
    console.log('   • Verifica que la IP esté configurada correctamente');
  } else {
    console.log('   • Verifica que el backend esté ejecutándose');
    console.log('   • Verifica la configuración de firewall/antivirus');
    console.log('   • Verifica que estés en la misma red WiFi');
  }

  console.log('\n🔧 PARA LA APP MÓVIL:');
  console.log('   • Reinicia la app después de cambiar la configuración');
  console.log('   • Usa el botón "Rescanear Red" en la configuración');
  console.log('   • Verifica los logs de la consola para más detalles');
}

// Ejecutar diagnóstico
diagnoseNetwork().catch(console.error);
