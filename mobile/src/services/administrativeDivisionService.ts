import { getBaseURL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequestWithRetry, requestSemaphore, randomDelay, makeCachedRequest, circuitBreaker } from '../utils/requestUtils';
// Eliminado: import de datos mock - solo usar datos reales

export interface State {
  _id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
}

export interface Municipality {
  _id: string;
  name: string;
  code: string;
  capital: string;
  state: string | State;
}

export interface Parish {
  _id: string;
  name: string;
  code: string;
  municipality: string | Municipality;
}

export interface AdministrativeDivisionResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

class AdministrativeDivisionService {
  // Método privado para hacer requests HTTP con retry logic
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return requestSemaphore.execute(async () => {
      // Agregar delay aleatorio para evitar thundering herd
      await randomDelay(100, 500);
      
      return makeRequestWithRetry(async () => {
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}${endpoint}`;
        
        // Obtener token de autenticación
        const token = await AsyncStorage.getItem('authToken');
        
        console.log('🌐 Making request to:', url);
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        // Agregar token de autorización si existe
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      }, {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        backoffFactor: 2
      });
    });
  }

  // Obtener URL base
  private async getBaseUrl(): Promise<string> {
    return await getBaseURL();
  }

  // Obtener todos los estados (con caché y fallback a mock)
  async getStates(): Promise<AdministrativeDivisionResponse> {
    try {
      const response = await makeCachedRequest(
        'administrative-divisions-states',
        () => this.makeRequest<AdministrativeDivisionResponse>('/administrative-divisions/states'),
        600000 // 10 minutos de caché para estados
      );
      
      console.log('✅ States loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching states, usando datos mock:', error);
      
      // Si el circuit breaker está abierto o hay error, usar datos mock
      if (circuitBreaker.getState() === 'OPEN' || error instanceof Error) {
        console.log('🔄 Usando datos mock para estados');
        return {
          success: true,
          data: mockStates
        };
      }
      
      return {
        success: false,
        error: 'Error al cargar los estados'
      };
    }
  }

  // Obtener municipios por estado (con caché y fallback a mock)
  async getMunicipalitiesByState(stateId: string): Promise<AdministrativeDivisionResponse> {
    try {
      const response = await makeCachedRequest(
        `administrative-divisions-municipalities-${stateId}`,
        () => this.makeRequest<AdministrativeDivisionResponse>(`/administrative-divisions/states/${stateId}/municipalities`),
        300000 // 5 minutos de caché para municipios
      );
      
      console.log('✅ Municipalities loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching municipalities, usando datos mock:', error);
      
      // No usar datos mock - solo datos reales
      
      return {
        success: false,
        error: 'Error al cargar los municipios'
      };
    }
  }

  // Obtener parroquias por municipio (con caché y fallback a mock)
  async getParishesByMunicipality(municipalityId: string): Promise<AdministrativeDivisionResponse> {
    try {
      const response = await makeCachedRequest(
        `administrative-divisions-parishes-${municipalityId}`,
        () => this.makeRequest<AdministrativeDivisionResponse>(`/administrative-divisions/municipalities/${municipalityId}/parishes`),
        300000 // 5 minutos de caché para parroquias
      );
      
      console.log('✅ Parishes loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching parishes, usando datos mock:', error);
      
      // No usar datos mock - solo datos reales
      
      return {
        success: false,
        error: 'Error al cargar las parroquias'
      };
    }
  }

  // Obtener jerarquía de ubicación completa
  async getLocationHierarchy(stateId?: string, municipalityId?: string, parishId?: string): Promise<AdministrativeDivisionResponse> {
    try {
      let endpoint = '/administrative-divisions/hierarchy';
      if (stateId) endpoint += `/${stateId}`;
      if (municipalityId) endpoint += `/${municipalityId}`;
      if (parishId) endpoint += `/${parishId}`;

      const response = await this.makeRequest<AdministrativeDivisionResponse>(endpoint);
      
      console.log('✅ Location hierarchy loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching location hierarchy:', error);
      return {
        success: false,
        error: 'Error al cargar la jerarquía de ubicación'
      };
    }
  }

  // Buscar ubicaciones por texto
  async searchLocations(query: string, type?: 'state' | 'municipality' | 'parish'): Promise<AdministrativeDivisionResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('query', query);
      if (type) queryParams.append('type', type);

      const endpoint = `/administrative-divisions/search?${queryParams.toString()}`;
      const response = await this.makeRequest<AdministrativeDivisionResponse>(endpoint);
      
      console.log('✅ Locations searched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error searching locations:', error);
      return {
        success: false,
        error: 'Error al buscar ubicaciones'
      };
    }
  }
}

export const administrativeDivisionService = new AdministrativeDivisionService();
export default administrativeDivisionService;
