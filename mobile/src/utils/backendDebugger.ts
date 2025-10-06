import { getBaseURL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BackendDebugInfo {
  selectedEnvironment: string;
  baseURL: string;
  environments: any[];
  networkInfo: any;
}

/**
 * Obtener información completa de debug del backend
 */
export async function getBackendDebugInfo(): Promise<BackendDebugInfo> {
  try {
    // Obtener entorno seleccionado
    const selectedEnvironment = await AsyncStorage.getItem('selected_backend_environment') || 'local';
    
    // Obtener URL base actual
    const baseURL = await getBaseURL();
    
    // Obtener todas las configuraciones de entorno
    const environments = await AsyncStorage.getItem('backend_environments');
    const parsedEnvironments = environments ? JSON.parse(environments) : [];
    
    // Obtener información de red
    const networkInfo = await AsyncStorage.getItem('network_config');
    const parsedNetworkInfo = networkInfo ? JSON.parse(networkInfo) : null;
    
    return {
      selectedEnvironment,
      baseURL,
      environments: parsedEnvironments,
      networkInfo: parsedNetworkInfo,
    };
  } catch (error) {
    console.error('Error obteniendo debug info:', error);
    return {
      selectedEnvironment: 'unknown',
      baseURL: 'unknown',
      environments: [],
      networkInfo: null,
    };
  }
}

/**
 * Probar conexión directa con fetch
 */
export async function testDirectConnection(url: string): Promise<{
  success: boolean;
  status?: number;
  error?: string;
  responseTime: number;
}> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Probando conexión directa a: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`📡 Respuesta directa: ${response.status} (${responseTime}ms)`);
    
    return {
      success: response.ok,
      status: response.status,
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ Error en conexión directa:`, error);
    
    return {
      success: false,
      error: error.message,
      responseTime,
    };
  }
}

/**
 * Limpiar configuración de backend
 */
export async function resetBackendConfig(): Promise<void> {
  try {
    await AsyncStorage.removeItem('selected_backend_environment');
    await AsyncStorage.removeItem('backend_environments');
    await AsyncStorage.removeItem('network_config');
    console.log('✅ Configuración de backend limpiada');
  } catch (error) {
    console.error('❌ Error limpiando configuración:', error);
  }
}
