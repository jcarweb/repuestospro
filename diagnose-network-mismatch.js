const fetch = require('node-fetch');

async function diagnoseNetworkMismatch() {
  console.log('🔍 DIAGNOSTICANDO DESAJUSTE DE RED');
  console.log('===================================');
  
  const endpoints = [
    // Backend real (según logs)
    'http://192.168.150.104:3001/api/health',
    'http://192.168.150.104:3001/api/auth/login',
    
    // Frontend (según logs)
    'http://192.168.0.110:3000',
    'http://localhost:3000',
    
    // Posibles IPs del backend
    'http://192.168.0.110:3001/api/health',
    'http://localhost:3001/api/health',
  ];
  
  console.log('\n🔍 Probando conectividad...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        timeout: 3000
      });
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`✅ Conectado - Respuesta: ${data.substring(0, 100)}...`);
      } else {
        console.log(`⚠️ Respuesta no exitosa: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
  console.log('==========================');
  console.log('\n🔧 PROBLEMA IDENTIFICADO:');
  console.log('• Backend: 192.168.150.104:3001');
  console.log('• Frontend: 192.168.0.110:3000');
  console.log('• Diferentes subredes: 192.168.150.x vs 192.168.0.x');
  console.log('\n💡 SOLUCIONES:');
  console.log('1. Cambiar backend a 192.168.0.110:3001');
  console.log('2. Cambiar frontend a 192.168.150.104:3000');
  console.log('3. Usar localhost para ambos');
}

diagnoseNetworkMismatch().catch(console.error);
