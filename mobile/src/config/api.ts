import { getNetworkConfig, rescanNetwork, NetworkConfig } from '../utils/networkUtils';

// Configuración base de la API
const BASE_API_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

// Clase para manejar la configuración dinámica de la API
export class DynamicAPIConfig {
  private static instance: DynamicAPIConfig;
  private currentConfig: NetworkConfig | null = null;
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
      // FORZAR localhost para conexión móvil
      this.currentConfig = {
        baseUrl: 'http://localhost:5000/api',
        isLocal: true,
        networkName: 'Localhost',
        lastTested: Date.now(),
        isWorking: true,
      };
      this.isInitialized = true;
      console.log('API Config initialized (FORCED LOCALHOST):', this.currentConfig);
    } catch (error) {
      console.error('Error initializing API config:', error);
      // Fallback a configuración por defecto
      this.currentConfig = {
        baseUrl: 'http://localhost:5000/api',
        isLocal: true,
        networkName: 'Backend Local',
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
    return this.currentConfig?.baseUrl || 'http://localhost:5000/api';
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
    // FORZAR localhost en lugar de hacer rescan
    this.currentConfig = {
      baseUrl: 'http://localhost:5000/api',
      isLocal: true,
      networkName: 'Localhost',
      lastTested: Date.now(),
      isWorking: true,
    };
    this.isInitialized = true;
    console.log('Rescan FORCED to localhost:', this.currentConfig);
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
