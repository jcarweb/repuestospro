import { getNetworkConfig, rescanNetwork, NetworkConfig } from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_ENVIRONMENTS, BackendEnvironment, getEnvironmentById } from './environments';

// Configuración base de la API
const BASE_API_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

// Clase para manejar la configuración dinámica de la API
export class DynamicAPIConfig {
  private static instance: DynamicAPIConfig;
  private currentConfig: NetworkConfig | null = null;
  private currentEnvironment: BackendEnvironment | null = null;
  private isInitialized = false;

  static getInstance(): DynamicAPIConfig {
    if (!DynamicAPIConfig.instance) {
      DynamicAPIConfig.instance = new DynamicAPIConfig();
    }
    return DynamicAPIConfig.instance;
  }

  // Inicializar la configuración
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Obtener el entorno seleccionado desde AsyncStorage
      const selectedEnvironmentId = await AsyncStorage.getItem('selected_backend_environment') || 'local';
      const environment = getEnvironmentById(selectedEnvironmentId) || BACKEND_ENVIRONMENTS[0];
      
      this.currentEnvironment = environment;
      this.currentConfig = {
        baseUrl: environment.baseUrl,
        isLocal: environment.isLocal,
        networkName: environment.name,
        lastTested: Date.now(),
        isWorking: true,
      };
      this.isInitialized = true;
      console.log('API Config initialized (DYNAMIC):', this.currentConfig);
    } catch (error) {
      console.error('Error initializing API config:', error);
      // Fallback a configuración por defecto
      const defaultEnv = BACKEND_ENVIRONMENTS[0];
      this.currentEnvironment = defaultEnv;
      this.currentConfig = {
        baseUrl: defaultEnv.baseUrl,
        isLocal: defaultEnv.isLocal,
        networkName: defaultEnv.name,
        lastTested: Date.now(),
        isWorking: false,
      };
      this.isInitialized = true;
    }
  }

  // Obtener la URL base actual
  async getBaseURL(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.currentConfig?.baseUrl || 'http://192.168.0.106:5000/api';
  }

  // Obtener la configuración completa
  async getConfig(): Promise<NetworkConfig> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.currentConfig!;
  }

  // Forzar rescan de la red
  async rescan(): Promise<NetworkConfig> {
    // Usar la IP real de la red local
    this.currentConfig = {
      baseUrl: 'http://192.168.0.106:5000/api',
      isLocal: true,
      networkName: 'Backend Principal (Forzado)',
      lastTested: Date.now(),
      isWorking: true,
    };
    this.isInitialized = true;
    console.log('Rescan FORCED to network IP:', this.currentConfig);
    return this.currentConfig;
  }

  // Verificar si la API está funcionando
  async isAPIWorking(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.currentConfig?.isWorking || false;
  }

  // Obtener información de la red
  getNetworkInfo() {
    return {
      networkName: this.currentConfig?.networkName || 'Desconocida',
      isLocal: this.currentConfig?.isLocal || false,
      lastTested: this.currentConfig?.lastTested || 0,
      isWorking: this.currentConfig?.isWorking || false,
    };
  }

  // Cambiar entorno dinámicamente
  async switchEnvironment(environmentId: string): Promise<BackendEnvironment> {
    const environment = getEnvironmentById(environmentId);
    if (!environment) {
      throw new Error(`Entorno no encontrado: ${environmentId}`);
    }

    // Guardar la selección en AsyncStorage
    await AsyncStorage.setItem('selected_backend_environment', environmentId);
    
    // Actualizar la configuración actual
    this.currentEnvironment = environment;
    this.currentConfig = {
      baseUrl: environment.baseUrl,
      isLocal: environment.isLocal,
      networkName: environment.name,
      lastTested: Date.now(),
      isWorking: true,
    };

    console.log('✅ Entorno cambiado a:', environment.name, environment.baseUrl);
    return environment;
  }

  // Obtener entorno actual
  getCurrentEnvironment(): BackendEnvironment | null {
    return this.currentEnvironment;
  }

  // Obtener todos los entornos disponibles
  getAvailableEnvironments(): BackendEnvironment[] {
    return BACKEND_ENVIRONMENTS;
  }

  // Verificar conectividad del entorno actual
  async testCurrentEnvironment(): Promise<boolean> {
    if (!this.currentConfig) return false;
    
    try {
      const response = await fetch(`${this.currentConfig.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      
      const isWorking = response.ok;
      this.currentConfig.isWorking = isWorking;
      this.currentConfig.lastTested = Date.now();
      
      console.log(`🔍 Test de conectividad ${this.currentConfig.networkName}:`, isWorking ? '✅ OK' : '❌ FALLO');
      return isWorking;
    } catch (error) {
      console.log(`🔍 Test de conectividad ${this.currentConfig.networkName}: ❌ FALLO`, error);
      this.currentConfig.isWorking = false;
      this.currentConfig.lastTested = Date.now();
      return false;
    }
  }

  // Forzar recarga de la configuración desde AsyncStorage
  async reloadConfiguration(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
    console.log('🔄 Configuración de API recargada:', this.currentConfig);
  }

  // Obtener la configuración actual sin inicializar
  getCurrentConfig(): NetworkConfig | null {
    return this.currentConfig;
  }
}

// Instancia global
export const apiConfig = DynamicAPIConfig.getInstance();

// Configuración de la API (mantener compatibilidad)
export const API_CONFIG = {
  get BASE_URL() {
    // Esta función se ejecutará cada vez que se acceda
    return apiConfig.getBaseURL();
  },
  TIMEOUT: BASE_API_CONFIG.TIMEOUT,
  RETRY_ATTEMPTS: BASE_API_CONFIG.RETRY_ATTEMPTS,
};

// Función helper para obtener la URL base
export const getBaseURL = async (): Promise<string> => {
  return await apiConfig.getBaseURL();
};

// Función helper para obtener la configuración completa
export const getAPIConfig = async (): Promise<NetworkConfig> => {
  return await apiConfig.getConfig();
};

// Función helper para forzar rescan
export const rescanAPINetwork = async (): Promise<NetworkConfig> => {
  return await apiConfig.rescan();
};

// Función helper para verificar estado
export const checkAPIStatus = async (): Promise<boolean> => {
  return await apiConfig.isAPIWorking();
};

export default API_CONFIG;
