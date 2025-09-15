const fs = require('fs');
const path = require('path');

console.log('🔧 CONFIGURACIÓN RÁPIDA DE RED PARA APP MÓVIL');
console.log('==============================================\n');

// Configuración correcta del backend
const CORRECT_CONFIG = {
  baseUrl: 'http://192.168.150.104:3001/api',
  isLocal: true,
  networkName: 'Backend Principal',
  lastTested: Date.now(),
  isWorking: true,
};

// Función para limpiar configuración guardada
function clearStoredConfig() {
  console.log('🧹 Limpiando configuración guardada...');
  
  try {
    // Buscar archivos de configuración
    const configFiles = [
      'network_config.json',
      'api_config.json',
      'app_config.json'
    ];
    
    configFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Eliminado: ${file}`);
      }
    });
    
    console.log('   ✅ Configuración guardada limpiada');
  } catch (error) {
    console.log(`   ⚠️ Error limpiando configuración: ${error.message}`);
  }
}

// Función para verificar archivos de configuración
function checkConfigFiles() {
  console.log('\n📁 Verificando archivos de configuración...');
  
  const configFiles = [
    'src/config/api.ts',
    'src/utils/networkUtils.ts'
  ];
  
  configFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('192.168.150.104:3001')) {
        console.log(`   ✅ ${file}: Configuración correcta`);
      } else if (content.includes('localhost:5000')) {
        console.log(`   ❌ ${file}: Configuración incorrecta (localhost:5000)`);
      } else {
        console.log(`   ⚠️ ${file}: Configuración no verificada`);
      }
    } else {
      console.log(`   ❌ ${file}: Archivo no encontrado`);
    }
  });
}

// Función para mostrar instrucciones
function showInstructions() {
  console.log('\n📋 INSTRUCCIONES PARA LA APP MÓVIL:');
  console.log('=====================================');
  console.log('1. 🔄 REINICIA la app móvil completamente');
  console.log('2. 📱 Ve a Configuración → Red');
  console.log('3. 🔍 Usa el botón "Rescanear Red"');
  console.log('4. ✅ Selecciona: Backend Principal');
  console.log('5. 💾 Guarda la configuración');
  console.log('6. 🔄 Reinicia la app nuevamente');
  
  console.log('\n🌐 CONFIGURACIÓN CORRECTA:');
  console.log('   IP: 192.168.150.104');
  console.log('   Puerto: 3001');
  console.log('   URL: http://192.168.150.104:3001/api');
  
  console.log('\n⚠️ IMPORTANTE:');
  console.log('   • Asegúrate de estar en la misma red WiFi');
  console.log('   • El backend debe estar ejecutándose');
  console.log('   • Verifica que no haya firewall bloqueando');
}

// Función para probar conectividad
async function testConnectivity() {
  console.log('\n🌐 PROBANDO CONECTIVIDAD...');
  
  try {
    const fetch = require('node-fetch');
    
    // Probar endpoint de health
    console.log('🔍 Probando health check...');
    const healthResponse = await fetch('http://192.168.150.104:3001/api/health');
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('   ✅ Health check exitoso:', data.message);
      console.log('   ✅ Backend funcionando correctamente');
    } else {
      console.log('   ❌ Health check falló:', healthResponse.status);
    }
    
  } catch (error) {
    console.log('   ❌ Error de conectividad:', error.message);
    console.log('   💡 Verifica que el backend esté ejecutándose');
  }
}

// Función principal
async function main() {
  try {
    clearStoredConfig();
    checkConfigFiles();
    await testConnectivity();
    showInstructions();
    
    console.log('\n🎯 RESUMEN:');
    console.log('===========');
    console.log('✅ Configuración de red corregida');
    console.log('✅ Archivos de configuración verificados');
    console.log('✅ Conectividad probada');
    console.log('📱 Sigue las instrucciones para la app móvil');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  }
}

// Ejecutar configuración
main();
