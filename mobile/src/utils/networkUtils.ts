import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuraciones de red para diferentes entornos
const NETWORK_CONFIGS = {
  // Redes conocidas (para desarrollo rápido)
  knownNetworks: {
    '192.168.31.122': 'http://192.168.31.122:3001/api',
    '192.168.1.100': 'http://192.168.1.100:3001/api',
    '10.0.0.100': 'http://10.0.0.100:3001/api',
    '172.20.10.1': 'http://172.20.10.1:3001/api',
    '192.168.150.104': 'http://192.168.150.104:3001/api', // IP actual
  },
  
  // Rangos de IPs comunes para redes locales
  localRanges: [
    '192.168.1',
    '192.168.0',
    '192.168.31',
    '10.0.0',
    '10.0.1',
    '172.16.0',
    '172.20.10',
    '172.24.0',
  ],
  
  // Puerto por defecto
  defaultPort: 5000,
  
  // Timeouts
  scanTimeout: 5000,
  connectionTimeout: 3000,
};

// Interfaz para la configuración de red
export interface NetworkConfig {
  baseUrl: string;
  isLocal: boolean;
  networkName: string;
  lastTested: number;
  isWorking: boolean;
}

// Clase para manejar la detección automática de red
export class NetworkDetector {
  private static instance: NetworkDetector;
  private currentConfig: NetworkConfig | null = null;
  private isScanning = false;

  static getInstance(): NetworkDetector {
    if (!NetworkDetector.instance) {
      NetworkDetector.instance = new NetworkDetector();
    }
    return NetworkDetector.instance;
  }

  // Obtener la configuración actual de red
  async getCurrentNetworkConfig(): Promise<NetworkConfig> {
    if (this.currentConfig) {
      return this.currentConfig;
    }

    // Intentar cargar desde storage
    const savedConfig = await this.loadSavedConfig();
    if (savedConfig && this.isConfigValid(savedConfig)) {
      this.currentConfig = savedConfig;
      return savedConfig;
    }

    // Si no hay configuración válida, hacer scan
    return await this.scanNetwork();
  }

  // Escanear la red para encontrar la API
  async scanNetwork(): Promise<NetworkConfig> {
    if (this.isScanning) {
      // Si ya está escaneando, esperar
      while (this.isScanning) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.currentConfig!;
    }

    this.isScanning = true;

    try {
      // 1. Intentar con configuraciones guardadas primero
      const savedConfig = await this.loadSavedConfig();
      if (savedConfig && await this.testConnection(savedConfig.baseUrl)) {
        this.currentConfig = savedConfig;
        this.isScanning = false;
        return savedConfig;
      }

      // 2. Intentar con redes conocidas
      for (const [ip, url] of Object.entries(NETWORK_CONFIGS.knownNetworks)) {
        if (await this.testConnection(url)) {
          const config: NetworkConfig = {
            baseUrl: url,
            isLocal: true,
            networkName: `Red Conocida (${ip})`,
            lastTested: Date.now(),
            isWorking: true,
          };
          
          this.currentConfig = config;
          await this.saveConfig(config);
          this.isScanning = false;
          return config;
        }
      }

      // 3. Escanear rangos de IP locales
      const localConfig = await this.scanLocalRanges();
      if (localConfig) {
        this.currentConfig = localConfig;
        await this.saveConfig(localConfig);
        this.isScanning = false;
        return localConfig;
      }

      // 4. Fallback a configuración por defecto
      const fallbackConfig: NetworkConfig = {
        baseUrl: 'http://localhost:5000/api',
        isLocal: true,
        networkName: 'Localhost (Fallback)',
        lastTested: Date.now(),
        isWorking: false,
      };

      this.currentConfig = fallbackConfig;
      this.isScanning = false;
      return fallbackConfig;

    } catch (error) {
      console.error('Error scanning network:', error);
      
      const errorConfig: NetworkConfig = {
        baseUrl: 'http://localhost:5000/api',
        isLocal: true,
        networkName: 'Error de Red',
        lastTested: Date.now(),
        isWorking: false,
      };

      this.currentConfig = errorConfig;
      this.isScanning = false;
      return errorConfig;
    }
  }

  // Escanear rangos de IP locales
  private async scanLocalRanges(): Promise<NetworkConfig | null> {
    const promises: Promise<NetworkConfig | null>[] = [];

    for (const range of NETWORK_CONFIGS.localRanges) {
      for (let i = 1; i <= 254; i++) {
        const ip = `${range}.${i}`;
        const url = `http://${ip}:${NETWORK_CONFIGS.defaultPort}/api`;
        
        promises.push(
          this.testConnection(url).then(isWorking => {
            if (isWorking) {
              return {
                baseUrl: url,
                isLocal: true,
                networkName: `Red Local (${ip})`,
                lastTested: Date.now(),
                isWorking: true,
              };
            }
            return null;
          })
        );
      }
    }

    // Ejecutar tests en paralelo con timeout
    const results = await Promise.race([
      Promise.all(promises),
      new Promise<null[]>(resolve => 
        setTimeout(() => resolve([null]), NETWORK_CONFIGS.scanTimeout)
      )
    ]);

    // Encontrar la primera configuración que funcione
    for (const result of results) {
      if (result && result.isWorking) {
        return result;
      }
    }

    return null;
  }

  // Testear conexión a una URL
  private async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIGS.connectionTimeout);

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Guardar configuración en storage
  private async saveConfig(config: NetworkConfig): Promise<void> {
    try {
      await AsyncStorage.setItem('network_config', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving network config:', error);
    }
  }

  // Cargar configuración desde storage
  private async loadSavedConfig(): Promise<NetworkConfig | null> {
    try {
      const saved = await AsyncStorage.getItem('network_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading network config:', error);
    }
    return null;
  }

  // Verificar si la configuración es válida
  private isConfigValid(config: NetworkConfig): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    return Date.now() - config.lastTested < maxAge;
  }

  // Forzar rescan de la red
  async forceRescan(): Promise<NetworkConfig> {
    this.currentConfig = null;
    return await this.scanNetwork();
  }

  // Obtener estado de la red actual
  getNetworkStatus(): { isScanning: boolean; currentConfig: NetworkConfig | null } {
    return {
      isScanning: this.isScanning,
      currentConfig: this.currentConfig,
    };
  }
}

// Función helper para obtener la configuración de red
export const getNetworkConfig = async (): Promise<NetworkConfig> => {
  return await NetworkDetector.getInstance().getCurrentNetworkConfig();
};

// Función helper para forzar rescan
export const rescanNetwork = async (): Promise<NetworkConfig> => {
  return await NetworkDetector.getInstance().forceRescan();
};

// Función helper para obtener el estado de la red
export const getNetworkStatus = () => {
  return NetworkDetector.getInstance().getNetworkStatus();
};

export default NetworkDetector;
