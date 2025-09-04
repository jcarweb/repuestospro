const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearNetworkCache() {
  try {
    console.log('🧹 Limpiando caché de red de la app móvil...');
    
    // Limpiar configuraciones de red guardadas
    await AsyncStorage.removeItem('networkConfig');
    await AsyncStorage.removeItem('currentNetworkConfig');
    await AsyncStorage.removeItem('lastNetworkScan');
    await AsyncStorage.removeItem('networkScanResults');
    
    console.log('✅ Caché de red limpiado exitosamente');
    console.log('📱 Reinicia la app móvil para aplicar los cambios');
    
  } catch (error) {
    console.error('❌ Error limpiando caché:', error);
  }
}

clearNetworkCache();
