import { BACKEND_ENVIRONMENTS } from '../config/environments';

/**
 * Prueba la conectividad con un backend específico
 */
export const testBackendConnectivity = async (baseUrl: string): Promise<boolean> => {
  try {
    console.log(`🔍 Probando conectividad con: ${baseUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch(`${baseUrl}/api/test`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`✅ Backend disponible: ${baseUrl}`);
      return true;
    } else {
      console.log(`❌ Backend no disponible: ${baseUrl} (status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error conectando a ${baseUrl}:`, error.message);
    return false;
  }
};

/**
 * Detecta automáticamente el mejor backend disponible
 */
export const detectBestBackend = async (): Promise<string> => {
  console.log('🔍 Detectando mejor backend disponible...');
  
  // Probar todos los backends en paralelo
  const connectivityTests = await Promise.allSettled(
    BACKEND_ENVIRONMENTS.map(async (env) => {
      const isAvailable = await testBackendConnectivity(env.baseUrl);
      return { env, isAvailable };
    })
  );
  
  // Encontrar el primer backend disponible
  for (const result of connectivityTests) {
    if (result.status === 'fulfilled' && result.value.isAvailable) {
      const availableEnv = result.value.env;
      console.log(`✅ Backend seleccionado: ${availableEnv.name} (${availableEnv.baseUrl})`);
      return availableEnv.id;
    }
  }
  
  // Si ningún backend está disponible, usar local por defecto
  console.log('⚠️ Ningún backend disponible, usando local por defecto');
  return 'local';
};

/**
 * Verifica y corrige la configuración del backend automáticamente
 */
export const autoFixBackendConfig = async (): Promise<void> => {
  try {
    console.log('🔧 Auto-corrigiendo configuración del backend...');
    
    const bestBackend = await detectBestBackend();
    
    // Importar AsyncStorage dinámicamente
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    
    // Guardar la configuración del mejor backend
    await AsyncStorage.default.setItem('selected_backend_environment', bestBackend);
    
    // Resetear la configuración de la API
    const { apiConfig } = await import('../config/api');
    apiConfig.resetInitialization();
    await apiConfig.initialize();
    
    console.log(`✅ Configuración auto-corregida: ${bestBackend}`);
    
  } catch (error) {
    console.error('❌ Error auto-corrigiendo configuración:', error);
  }
};
