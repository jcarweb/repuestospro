import { getNetworkConfig, rescanNetwork, NetworkConfig } from '../utils/networkUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_ENVIRONMENTS, BackendEnvironment, getEnvironmentById } from './environments';

// Configuración base de la API optimizada para móvil
const BASE_API_CONFIG = {
  TIMEOUT: 8000, // 8 segundos - reducido para mejor UX en móvil
  RETRY_ATTEMPTS: 2, // 2 reintentos - reducido para login más rápido
  RETRY_DELAY: 500, // 500ms base - más rápido
  MAX_RETRY_DELAY: 2000, // Máximo 2 segundos entre reintentos
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
      const selectedEnvironmentId = await AsyncStorage.getItem('selected_backend_environment') || 'render';
      const environment = getEnvironmentById(selectedEnvironmentId) || getEnvironmentById('render') || BACKEND_ENVIRONMENTS[0];
      
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
      // Fallback a configuración por defecto (render)
      const defaultEnv = getEnvironmentById('render') || BACKEND_ENVIRONMENTS[0];
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
    // Si no hay config, usar Render por defecto
    return this.currentConfig?.baseUrl || 'https://piezasya-back.onrender.com/api';
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
    // Rescan no debe forzar a IP local; mantener entorno actual
    if (!this.currentEnvironment) {
      await this.initialize();
    }
    this.currentConfig = {
      baseUrl: this.currentEnvironment!.baseUrl,
      isLocal: this.currentEnvironment!.isLocal,
      networkName: this.currentEnvironment!.name,
      lastTested: Date.now(),
      isWorking: true,
    };
    this.isInitialized = true;
    console.log('Rescan reloaded current environment:', this.currentConfig);
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

  // Verificar conectividad del entorno actual con reintentos
  async testCurrentEnvironment(): Promise<boolean> {
    if (!this.currentConfig) return false;
    
    // Para servicios como Render que se "duermen", intentar despertar primero
    if (this.currentEnvironment?.isProduction) {
      try {
        console.log('🔄 Intentando despertar servidor de Render...');
        await this.requestWithRetry(
          `${this.currentConfig.baseUrl}/`,
          { method: 'GET' },
          'wake up server'
        );
        // Esperar un poco para que el servidor se active completamente (reducido)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log('⚠️ No se pudo despertar el servidor, continuando con health check...');
      }
    }
    
    return await this.requestWithRetry(
      `${this.currentConfig.baseUrl}/health`,
      { method: 'GET' },
      'health check'
    ).then(() => {
      this.currentConfig!.isWorking = true;
      this.currentConfig!.lastTested = Date.now();
      console.log(`🔍 Test de conectividad ${this.currentConfig!.networkName}: ✅ OK`);
      return true;
    }).catch((error) => {
      console.log(`🔍 Test de conectividad ${this.currentConfig!.networkName}: ❌ FALLO`, error);
      this.currentConfig!.isWorking = false;
      this.currentConfig!.lastTested = Date.now();
      return false;
    });
  }

  // Método para hacer peticiones con reintentos y backoff exponencial
  private async requestWithRetry(
    url: string, 
    options: RequestInit = {}, 
    operation: string = 'request',
    attempt: number = 1
  ): Promise<Response> {
    const isProduction = this.currentEnvironment?.isProduction || false;
    const timeout = isProduction ? 10000 : BASE_API_CONFIG.TIMEOUT; // 10s para producción (Render), 8s para desarrollo
    
    try {
      console.log(`🌐 ${operation} (intento ${attempt}/${BASE_API_CONFIG.RETRY_ATTEMPTS}): ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (attempt < BASE_API_CONFIG.RETRY_ATTEMPTS) {
        const delay = Math.min(
          BASE_API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1),
          BASE_API_CONFIG.MAX_RETRY_DELAY
        );
        
        console.log(`⏳ Reintentando ${operation} en ${delay}ms... (intento ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.requestWithRetry(url, options, operation, attempt + 1);
      }
      
      // Mejorar el manejo de errores para servicios como Render
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Timeout: El servidor tardó más de ${timeout/1000} segundos en responder. Esto es común en servicios gratuitos como Render que se "duermen" cuando no hay tráfico.`);
        } else if (error.message.includes('fetch')) {
          throw new Error('Error de conexión: No se pudo conectar al servidor. Verifica tu conexión a internet.');
        } else {
          throw error;
        }
      } else {
        throw new Error('Error desconocido de conexión');
      }
    }
  }

  // Forzar recarga de la configuración desde AsyncStorage
  async reloadConfiguration(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
    console.log('🔄 Configuración de API recargada:', this.currentConfig);
  }

  // Resetear la inicialización (alias para reloadConfiguration)
  resetInitialization(): void {
    this.isInitialized = false;
    console.log('🔄 Inicialización de API reseteada');
  }

  // Obtener la configuración actual sin inicializar
  getCurrentConfig(): NetworkConfig | null {
    return this.currentConfig;
  }

  // Método para verificar si el servidor está "despierto" antes de hacer peticiones importantes
  async ensureServerIsAwake(): Promise<boolean> {
    if (!this.currentConfig || !this.currentEnvironment?.isProduction) {
      return true; // No es necesario para entornos locales
    }

    try {
      console.log('🔄 Verificando si el servidor está despierto...');
      const response = await this.requestWithRetry(
        `${this.currentConfig.baseUrl}/`,
        { method: 'GET' },
        'server wake up check'
      );
      
      if (response.ok) {
        console.log('✅ Servidor está despierto y funcionando');
        return true;
      }
      return false;
    } catch (error) {
      console.log('⚠️ Servidor puede estar dormido, intentando despertar...');
      // Esperar un poco más y reintentar (reducido)
      await new Promise(resolve => setTimeout(resolve, 1500));
      return false;
    }
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
  RETRY_DELAY: BASE_API_CONFIG.RETRY_DELAY,
  MAX_RETRY_DELAY: BASE_API_CONFIG.MAX_RETRY_DELAY,
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

// Función helper para asegurar que el servidor esté despierto
export const ensureServerAwake = async (): Promise<boolean> => {
  return await apiConfig.ensureServerIsAwake();
};

export default API_CONFIG;
