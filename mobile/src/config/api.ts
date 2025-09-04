import { getNetworkConfig, rescanNetwork, NetworkConfig } from '../utils/networkUtils';
import { getFixedNetworkConfig } from './fixed-network';

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
      // Usar configuración fija para evitar escaneo automático
      this.currentConfig = getFixedNetworkConfig();
      this.isInitialized = true;
      console.log('API Config initialized with fixed network:', this.currentConfig);
    } catch (error) {
      console.error('Error initializing API config:', error);
      // Fallback a configuración por defecto
      this.currentConfig = {
        baseUrl: 'http://192.168.0.110:3001/api', // IP real del backend
        isLocal: true,
        networkName: 'Backend Principal',
        lastTested: Date.now(),
        isWorking: true, // Cambiar a true ya que el backend está funcionando
      };
      this.isInitialized = true;
    }
  }

  // Obtener la URL base actual
  async getBaseURL(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.currentConfig?.baseUrl || 'http://192.168.150.104:3001/api';
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
    this.currentConfig = await rescanNetwork();
    this.isInitialized = true;
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
