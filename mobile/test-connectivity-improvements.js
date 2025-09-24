const fetch = require('node-fetch');

console.log('🧪 Probando mejoras de conectividad...\n');

// URLs de prueba
const testUrls = [
  {
    name: 'Render Production',
    url: 'https://piezasya-back.onrender.com/api/health',
    isProduction: true
  },
  {
    name: 'Local Development',
    url: 'http://192.168.0.106:5000/api/health',
    isProduction: false
  }
];

// Configuración de reintentos
const RETRY_CONFIG = {
  ATTEMPTS: 3,
  BASE_DELAY: 1000,
  MAX_DELAY: 5000,
  TIMEOUT_LOCAL: 15000,
  TIMEOUT_PRODUCTION: 20000
};

// Función para calcular delay con backoff exponencial
function calculateDelay(attempt) {
  return Math.min(
    RETRY_CONFIG.BASE_DELAY * Math.pow(2, attempt - 1),
    RETRY_CONFIG.MAX_DELAY
  );
}

// Función para hacer petición con reintentos
async function requestWithRetry(url, config, attempt = 1) {
  const timeout = config.isProduction ? RETRY_CONFIG.TIMEOUT_PRODUCTION : RETRY_CONFIG.TIMEOUT_LOCAL;
  
  try {
    console.log(`🌐 ${config.name} (intento ${attempt}/${RETRY_CONFIG.ATTEMPTS}): ${url}`);
    console.log(`   ⏱️ Timeout: ${timeout}ms`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      console.log(`   ✅ Éxito: ${response.status} ${response.statusText}`);
      console.log(`   ⚡ Tiempo de respuesta: ${responseTime}ms`);
      return { success: true, responseTime, status: response.status };
    } else {
      console.log(`   ⚠️ Error: ${response.status} ${response.statusText}`);
      if (response.status >= 500 && attempt < RETRY_CONFIG.ATTEMPTS) {
        throw new Error(`Server error: ${response.status}`);
      }
      return { success: false, responseTime, status: response.status };
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    
    if (attempt < RETRY_CONFIG.ATTEMPTS) {
      const delay = calculateDelay(attempt);
      console.log(`   ⏳ Reintentando en ${delay}ms... (intento ${attempt + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return requestWithRetry(url, config, attempt + 1);
    }
    
    return { success: false, error: error.message };
  }
}

// Función principal de prueba
async function runConnectivityTests() {
  console.log('🚀 Iniciando pruebas de conectividad mejorada...\n');
  
  const results = [];
  
  for (const config of testUrls) {
    console.log(`\n📡 Probando: ${config.name}`);
    console.log('=' .repeat(50));
    
    const result = await requestWithRetry(config.url, config);
    results.push({
      name: config.name,
      url: config.url,
      ...result
    });
    
    console.log('');
  }
  
  // Resumen de resultados
  console.log('\n📊 RESUMEN DE RESULTADOS');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    if (result.success) {
      console.log(`  ✅ Estado: Conectado`);
      console.log(`  ⚡ Tiempo: ${result.responseTime}ms`);
      console.log(`  📊 Status: ${result.status}`);
    } else {
      console.log(`  ❌ Estado: Falló`);
      if (result.error) {
        console.log(`  🔍 Error: ${result.error}`);
      } else {
        console.log(`  📊 Status: ${result.status}`);
      }
    }
  });
  
  // Estadísticas
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime).length;
  
  console.log(`\n📈 ESTADÍSTICAS:`);
  console.log(`  🎯 Éxito: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
  if (avgResponseTime) {
    console.log(`  ⚡ Tiempo promedio: ${Math.round(avgResponseTime)}ms`);
  }
  
  // Recomendaciones
  console.log(`\n💡 RECOMENDACIONES:`);
  if (successful === total) {
    console.log(`  ✅ Todas las conexiones funcionan correctamente`);
    console.log(`  🚀 Las mejoras de conectividad están funcionando`);
  } else {
    console.log(`  ⚠️ Algunas conexiones fallaron`);
    console.log(`  🔧 Revisar configuración de red o servidor`);
  }
  
  console.log(`\n🎉 Pruebas completadas!`);
}

// Ejecutar pruebas
runConnectivityTests().catch(console.error);
