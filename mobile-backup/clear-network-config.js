const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearNetworkConfig() {
  console.log('🧹 Limpiando configuración de red almacenada...');
  
  try {
    // Limpiar todas las configuraciones de red almacenadas
    await AsyncStorage.removeItem('networkConfig');
    await AsyncStorage.removeItem('lastWorkingNetwork');
    await AsyncStorage.removeItem('networkScanResults');
    await AsyncStorage.removeItem('forcedNetworkConfig');
    
    // Establecer configuración por defecto a localhost
    const defaultConfig = {
      baseUrl: 'http://localhost:3001/api',
      isLocal: true,
      networkName: 'Localhost (Forzado)',
      lastTested: Date.now(),
      isWorking: true,
    };
    
    await AsyncStorage.setItem('networkConfig', JSON.stringify(defaultConfig));
    await AsyncStorage.setItem('forcedNetworkConfig', JSON.stringify(defaultConfig));
    
    console.log('✅ Configuración limpiada y establecida a localhost');
    console.log('📱 Reinicia la app móvil para aplicar los cambios');
    
  } catch (error) {
    console.error('❌ Error limpiando configuración:', error);
  }
}

clearNetworkConfig();
