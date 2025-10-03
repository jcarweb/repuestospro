import { getBaseURL } from '../config/api';

export interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: string;
  responseTime: number;
  error?: string;
  backend: string;
}

class ConnectionMonitorService {
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastCheck: '',
    responseTime: 0,
    backend: '',
  };

  private listeners: ((status: ConnectionStatus) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isChecking = false;

  /**
   * Verificar conexión con el backend
   */
  async checkConnection(): Promise<ConnectionStatus> {
    if (this.isChecking) {
      return this.connectionStatus;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const baseURL = await getBaseURL();
      console.log('🔍 Verificando conexión con:', baseURL);

      // Intentar hacer una petición simple al backend
      const response = await fetch(`${baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos de timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.connectionStatus = {
          isConnected: true,
          lastCheck: new Date().toISOString(),
          responseTime,
          backend: baseURL,
        };
        console.log('✅ Conexión exitosa:', responseTime + 'ms');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const baseURL = await getBaseURL();
      
      this.connectionStatus = {
        isConnected: false,
        lastCheck: new Date().toISOString(),
        responseTime,
        error: error.message || 'Error de conexión',
        backend: baseURL,
      };
      
      console.error('❌ Error de conexión:', error.message);
    } finally {
      this.isChecking = false;
      this.notifyListeners();
    }

    return this.connectionStatus;
  }

  /**
   * Iniciar monitoreo automático
   */
  startMonitoring(intervalMs: number = 30000) {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    console.log('🔄 Iniciando monitoreo de conexión cada', intervalMs + 'ms');
    
    // Verificar inmediatamente
    this.checkConnection();
    
    // Configurar verificación periódica
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, intervalMs);
  }

  /**
   * Detener monitoreo automático
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️ Monitoreo de conexión detenido');
    }
  }

  /**
   * Obtener estado actual de la conexión
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Suscribirse a cambios de estado
   */
  addListener(listener: (status: ConnectionStatus) => void) {
    this.listeners.push(listener);
  }

  /**
   * Desuscribirse de cambios de estado
   */
  removeListener(listener: (status: ConnectionStatus) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notificar a todos los listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.connectionStatus);
      } catch (error) {
        console.error('Error notificando listener:', error);
      }
    });
  }

  /**
   * Verificar conexión con endpoint específico
   */
  async checkSpecificEndpoint(endpoint: string): Promise<{
    isConnected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;

      return {
        isConnected: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error: any) {
      return {
        isConnected: false,
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Obtener información detallada de la conexión
   */
  getConnectionInfo(): {
    status: ConnectionStatus;
    isMonitoring: boolean;
    listenersCount: number;
  } {
    return {
      status: this.getConnectionStatus(),
      isMonitoring: this.checkInterval !== null,
      listenersCount: this.listeners.length,
    };
  }

  /**
   * Forzar verificación de conexión
   */
  async forceCheck(): Promise<ConnectionStatus> {
    console.log('🔄 Forzando verificación de conexión...');
    return await this.checkConnection();
  }

  /**
   * Limpiar estado
   */
  reset() {
    this.stopMonitoring();
    this.connectionStatus = {
      isConnected: false,
      lastCheck: '',
      responseTime: 0,
      backend: '',
    };
    this.listeners = [];
    console.log('🔄 Estado de conexión reseteado');
  }
}

export const connectionMonitorService = new ConnectionMonitorService();
