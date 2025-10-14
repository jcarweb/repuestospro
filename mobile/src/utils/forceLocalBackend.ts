import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfig } from '../config/api';
import { testBackendConnectivity, detectBestBackend } from './backendConnectivity';

/**
 * Fuerza el uso del backend local limpiando toda la configuración almacenada
 */
export const forceLocalBackend = async (): Promise<void> => {
  try {
    console.log('🔄 Forzando uso del backend local...');
    
    // Limpiar toda la configuración almacenada
    await AsyncStorage.removeItem('selected_backend_environment');
    await AsyncStorage.removeItem('backend_config');
    await AsyncStorage.removeItem('network_config');
    await AsyncStorage.removeItem('api_config');
    
    // Detectar el mejor backend disponible
    const bestBackend = await detectBestBackend();
    await AsyncStorage.setItem('selected_backend_environment', bestBackend);
    
    // Resetear la configuración de la API
    apiConfig.resetInitialization();
    
    // Re-inicializar con la configuración detectada
    await apiConfig.initialize();
    
    console.log(`✅ Backend configurado: ${bestBackend}`);
    console.log('🌐 URL actual:', apiConfig.getBaseURL());
    
  } catch (error) {
    console.error('❌ Error forzando backend local:', error);
  }
};

/**
 * Verifica y corrige la configuración del backend si es necesario
 */
export const verifyBackendConfig = async (): Promise<void> => {
  try {
    const currentEnv = await AsyncStorage.getItem('selected_backend_environment');
    const currentConfig = await apiConfig.getBaseURL();
    
    console.log('🔍 Verificando configuración del backend...');
    console.log('📱 Entorno almacenado:', currentEnv);
    console.log('🌐 URL actual:', currentConfig);
    
    // Si no hay configuración, usar render por defecto
    if (!currentEnv) {
      console.log('⚠️ No hay configuración de backend, usando render por defecto...');
      await AsyncStorage.setItem('selected_backend_environment', 'render');
      await apiConfig.reloadConfiguration();
    } else {
      console.log('✅ Backend configurado correctamente:', currentEnv);
    }
    
  } catch (error) {
    console.error('❌ Error verificando configuración del backend:', error);
    // En caso de error, usar render por defecto
    await AsyncStorage.setItem('selected_backend_environment', 'render');
    await apiConfig.reloadConfiguration();
  }
};