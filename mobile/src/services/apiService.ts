import { getBaseURL, checkAPIStatus, rescanAPINetwork, NetworkConfig } from '../config/api';

// Interfaz para las opciones de la petición
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryAttempts?: number;
}

// Interfaz para la respuesta de la API
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  networkInfo?: NetworkConfig;
}

// Clase para manejar las peticiones a la API
export class APIService {
  private static instance: APIService;
  private isInitialized = false;

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // Inicializar el servicio
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Verificar que la API esté funcionando
      const isWorking = await checkAPIStatus();
      if (!isWorking) {
        console.warn('API not working, attempting to rescan network...');
        await rescanAPINetwork();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing API service:', error);
      this.isInitialized = true;
    }
  }

  // Realizar una petición a la API
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retryAttempts = 3,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        const baseURL = await getBaseURL();
        const url = `${baseURL}${endpoint}`;

        console.log(`🌐 API Request [${attempt + 1}/${retryAttempts}]:`, {
          method,
          url,
          endpoint,
          body: body ? JSON.stringify(body).substring(0, 200) + '...' : undefined,
          headers,
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
        };

        if (body && method !== 'GET') {
          requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);
        
        // Verificar que response y headers existan antes de acceder
        if (response && response.headers) {
          try {
            console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
          } catch (headerError) {
            console.log(`📡 Response headers: Error reading headers -`, headerError);
          }
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        // Verificar si la respuesta tiene el formato esperado
        if (responseData.success === false) {
          throw new Error(responseData.error || 'API Error');
        }

        return {
          success: true,
          data: responseData.data || responseData,
          statusCode: response.status,
        };

      } catch (error) {
        lastError = error as Error;
        console.error(`API Request failed [${attempt + 1}/${retryAttempts}]:`, error);

        // Si es un error de red, intentar rescaneo
        if (error instanceof Error && 
            (error.name === 'AbortError' || error.message.includes('fetch'))) {
          console.log('Network error detected, attempting to rescan...');
          try {
            await rescanAPINetwork();
          } catch (rescanError) {
            console.error('Rescan failed:', rescanError);
          }
        }

        // Esperar antes del siguiente intento
        if (attempt < retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // Si todos los intentos fallaron
    return {
      success: false,
      error: lastError?.message || 'All retry attempts failed',
      statusCode: 0,
    };
  }

  // Métodos helper para diferentes tipos de peticiones
  async get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  // Verificar el estado de la API
  async checkStatus(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Forzar rescan de la red
  async rescanNetwork(): Promise<NetworkConfig> {
    return await rescanAPINetwork();
  }
}

// Instancia global del servicio
export const apiService = APIService.getInstance();

// Funciones helper para uso directo
export const apiGet = <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => 
  apiService.get<T>(endpoint, options);

export const apiPost = <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
  apiService.post<T>(endpoint, body, options);

export const apiPut = <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
  apiService.put<T>(endpoint, body, options);

export const apiDelete = <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => 
  apiService.delete<T>(endpoint, options);

export const apiPatch = <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
  apiService.patch<T>(endpoint, body, options);

export default APIService;
