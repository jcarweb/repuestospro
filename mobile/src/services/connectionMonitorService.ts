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
  private lastSuccessfulCheck: number = 0;
  private cacheTimeout: number = 60000; // 1 minuto de cache

  /**
   * Verificar conexión con el backend
   */
  async checkConnection(): Promise<ConnectionStatus> {
    if (this.isChecking) {
      return this.connectionStatus;
    }

    // Verificar cache - si la última verificación exitosa fue hace menos de 1 minuto, usar cache
    const now = Date.now();
    if (this.connectionStatus.isConnected && 
        this.lastSuccessfulCheck > 0 && 
        (now - this.lastSuccessfulCheck) < this.cacheTimeout) {
      console.log('📋 Usando cache de conexión (última verificación hace', Math.round((now - this.lastSuccessfulCheck) / 1000), 'segundos)');
      return this.connectionStatus;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const baseURL = await getBaseURL();
      console.log('🔍 Verificando conexión con:', baseURL);

      // Intentar con múltiples endpoints como fallback
      const endpoints = [
        { url: '/health', name: 'Health Check' },
        { url: '/products', name: 'Products' },
        { url: '', name: 'API Root' }
      ];

      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Intentando ${endpoint.name}: ${baseURL}${endpoint.url}`);
          
          const response = await fetch(`${baseURL}${endpoint.url}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const responseTime = Date.now() - startTime;
          console.log(`📡 Respuesta ${endpoint.name}:`, response.status, response.statusText);

          if (response.ok) {
            try {
              const data = await response.json();
              console.log('📦 Datos recibidos:', data);
              
              // Para /health, verificar success: true
              if (endpoint.url === '/health') {
                if (data.success === true) {
                  this.connectionStatus = {
                    isConnected: true,
                    lastCheck: new Date().toISOString(),
                    responseTime,
                    backend: baseURL,
                  };
                  this.lastSuccessfulCheck = now;
                  console.log(`✅ Conexión exitosa con ${endpoint.name}:`, responseTime + 'ms');
                  this.isChecking = false;
                  this.notifyListeners();
                  return this.connectionStatus;
                }
              } else {
                // Para otros endpoints, considerar exitoso si HTTP es 200
                this.connectionStatus = {
                  isConnected: true,
                  lastCheck: new Date().toISOString(),
                  responseTime,
                  backend: baseURL,
                };
                this.lastSuccessfulCheck = now;
                console.log(`✅ Conexión exitosa con ${endpoint.name}:`, responseTime + 'ms');
                this.isChecking = false;
                this.notifyListeners();
                return this.connectionStatus;
              }
            } catch (jsonError) {
              // Si no es JSON válido pero HTTP es 200, considerar exitoso
              this.connectionStatus = {
                isConnected: true,
                lastCheck: new Date().toISOString(),
                responseTime,
                backend: baseURL,
              };
              this.lastSuccessfulCheck = now;
              console.log(`✅ Conexión exitosa con ${endpoint.name} (no JSON):`, responseTime + 'ms');
              this.isChecking = false;
              this.notifyListeners();
              return this.connectionStatus;
            }
          } else {
            console.log(`❌ ${endpoint.name} falló: HTTP ${response.status}`);
          }
        } catch (endpointError: any) {
          console.log(`❌ Error con ${endpoint.name}:`, endpointError.message);
          lastError = endpointError;
          continue; // Intentar siguiente endpoint
        }
      }

      // Si llegamos aquí, todos los endpoints fallaron
      throw lastError || new Error('Todos los endpoints fallaron');

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
  startMonitoring(intervalMs: number = 120000) { // Cambiado de 30s a 2 minutos
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
      });

      const responseTime = Date.now() - startTime;
      if (response.ok) {
        // Para endpoints específicos, verificar el contenido JSON
        try {
          const data = await response.json();
          return {
            isConnected: data.success === true || data.success === undefined, // Permitir endpoints sin success
            responseTime,
            error: undefined,
          };
        } catch (jsonError) {
          // Si no es JSON, considerar exitoso si HTTP es 200
          return {
            isConnected: true,
            responseTime,
            error: undefined,
          };
        }
      } else {
        return {
          isConnected: false,
          responseTime,
          error: `HTTP ${response.status}`,
        };
      }
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
   * Verificación simple y directa
   */
  async simpleCheck(): Promise<{ connected: boolean; message: string }> {
    try {
      const baseURL = await getBaseURL();
      console.log('🔍 Verificación simple con:', baseURL);
      
      // Intentar solo con /products que sabemos que existe
      const response = await fetch(`${baseURL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ Verificación simple exitosa');
        return { connected: true, message: 'Conexión exitosa' };
      } else {
        console.log('❌ Verificación simple falló:', response.status);
        return { connected: false, message: `HTTP ${response.status}` };
      }
    } catch (error: any) {
      console.log('❌ Error en verificación simple:', error.message);
      return { connected: false, message: error.message };
    }
  }

  /**
   * Diagnóstico completo de conexión
   */
  async fullDiagnostic(): Promise<{
    baseURL: string;
    tests: Array<{
      endpoint: string;
      status: 'success' | 'error';
      httpStatus?: number;
      error?: string;
      responseTime: number;
    }>;
  }> {
    const baseURL = await getBaseURL();
    console.log('🔍 Diagnóstico completo con:', baseURL);
    
    const tests = [];
    const endpoints = [
      '/health',
      '/products', 
      '',
      '/auth',
      '/stores'
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        console.log(`🔄 Probando ${endpoint}...`);
        
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseTime = Date.now() - startTime;
        
        tests.push({
          endpoint,
          status: response.ok ? 'success' as const : 'error' as const,
          httpStatus: response.status,
          responseTime,
          error: response.ok ? undefined : `HTTP ${response.status}`
        });

        console.log(`📡 ${endpoint}: ${response.status} (${responseTime}ms)`);
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`📦 ${endpoint} data:`, data);
          } catch (jsonError) {
            console.log(`📦 ${endpoint} no JSON válido`);
          }
        }
        
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        tests.push({
          endpoint,
          status: 'error' as const,
          responseTime,
          error: error.message
        });
        console.log(`❌ ${endpoint} error:`, error.message);
      }
    }

    return { baseURL, tests };
  }

  /**
   * Obtener estado actual de conexión
   */
  getCurrentStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.connectionStatus.isConnected;
  }

  /**
   * Limpiar cache y forzar nueva verificación
   */
  clearCache(): void {
    this.lastSuccessfulCheck = 0;
    console.log('🔄 Cache de conexión limpiado');
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
