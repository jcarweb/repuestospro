/**
 * Script para limpiar la configuración de backend en la app móvil
 * Ejecutar este script después de cambiar backend-config.json
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearBackendConfig() {
  try {
    console.log('🧹 Limpiando configuración de backend...');
    
    // Limpiar la configuración almacenada
    await AsyncStorage.removeItem('selected_backend_environment');
    await AsyncStorage.removeItem('backend_config');
    await AsyncStorage.removeItem('api_config');
    await AsyncStorage.removeItem('network_config');
    
    console.log('✅ Configuración de backend limpiada');
    console.log('📱 Reinicia la app móvil para aplicar los cambios');
    
  } catch (error) {
    console.error('❌ Error limpiando configuración:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  clearBackendConfig();
}

module.exports = { clearBackendConfig };
