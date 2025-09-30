import { getBaseURL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUsers, createUser, updateUser, deleteUser } from './userService';
import type { User } from './userService';
import { makeRequestWithRetry, requestSemaphore, randomDelay, makeCachedRequest, circuitBreaker } from '../utils/requestUtils';
import { mockStores, mockStoreStats } from '../utils/mockData';

export interface Store {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  isActive: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  managers: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  settings: {
    currency: string;
    taxRate: number;
    deliveryRadius: number;
    minimumOrder: number;
    autoAcceptOrders: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreResponse {
  success: boolean;
  data?: {
    stores: Store[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface StoreStats {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  storesByState: Array<{
    _id: string;
    count: number;
  }>;
}

export interface StoreStatsResponse {
  success: boolean;
  data?: StoreStats;
  error?: string;
}

export interface CreateStoreData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  owner: string; // ID del usuario propietario
  managers?: string[]; // IDs de los usuarios managers
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  settings: {
    currency: string;
    taxRate: number;
    deliveryRadius: number;
    minimumOrder: number;
    autoAcceptOrders: boolean;
  };
}

class StoreService {
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

  // Obtener todas las tiendas con filtros y paginación (con caché)
  async getStores(params: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
  } = {}): Promise<StoreResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const queryString = queryParams.toString();
      const endpoint = `/stores${queryString ? `?${queryString}` : ''}`;
      const cacheKey = `stores-${queryString || 'all'}`;
      
      const response = await makeCachedRequest(
        cacheKey,
        () => this.makeRequest<StoreResponse>(endpoint),
        120000 // 2 minutos de caché para tiendas
      );
      
      console.log('✅ Stores loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching stores:', error);
      return {
        success: false,
        error: 'Error al cargar las tiendas'
      };
    }
  }

  // Obtener tienda por ID
  async getStoreById(id: string): Promise<{ success: boolean; data?: Store; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: Store; error?: string }>(`/stores/${id}`);
      
      console.log('✅ Store loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching store:', error);
      return {
        success: false,
        error: 'Error al cargar la tienda'
      };
    }
  }

  // Crear nueva tienda
  async createStore(storeData: CreateStoreData): Promise<{ success: boolean; data?: Store; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: Store; error?: string }>('/stores', {
        method: 'POST',
        body: JSON.stringify(storeData),
      });
      
      console.log('✅ Store created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating store:', error);
      return {
        success: false,
        error: 'Error al crear la tienda'
      };
    }
  }

  // Actualizar tienda
  async updateStore(id: string, storeData: Partial<CreateStoreData>): Promise<{ success: boolean; data?: Store; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: Store; error?: string }>(`/stores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(storeData),
      });
      
      console.log('✅ Store updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error updating store:', error);
      return {
        success: false,
        error: 'Error al actualizar la tienda'
      };
    }
  }

  // Eliminar tienda
  async deleteStore(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; error?: string }>(`/stores/${id}`, {
        method: 'DELETE',
      });
      
      console.log('✅ Store deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error deleting store:', error);
      return {
        success: false,
        error: 'Error al eliminar la tienda'
      };
    }
  }

  // Toggle status de tienda
  async toggleStoreStatus(id: string): Promise<{ success: boolean; data?: Store; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: Store; error?: string }>(`/stores/${id}/toggle-status`, {
        method: 'PATCH',
      });
      
      console.log('✅ Store status toggled successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error toggling store status:', error);
      return {
        success: false,
        error: 'Error al cambiar el estado de la tienda'
      };
    }
  }

  // Desactivar tienda
  async deactivateStore(id: string): Promise<{ success: boolean; data?: Store; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: Store; error?: string }>(`/stores/${id}/deactivate`, {
        method: 'PUT',
      });
      
      console.log('✅ Store deactivated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error deactivating store:', error);
      return {
        success: false,
        error: 'Error al desactivar la tienda'
      };
    }
  }

  // Agregar manager a tienda
  async addManager(storeId: string, managerEmail: string): Promise<{ success: boolean; data?: Store; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: Store; error?: string }>(`/stores/${storeId}/managers`, {
        method: 'POST',
        body: JSON.stringify({ email: managerEmail }),
      });
      
      console.log('✅ Manager added successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error adding manager:', error);
      return {
        success: false,
        error: 'Error al agregar el manager'
      };
    }
  }

  // Remover manager de tienda
  async removeManager(storeId: string, managerId: string): Promise<{ success: boolean; data?: Store; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: Store; error?: string }>(`/stores/${storeId}/managers`, {
        method: 'DELETE',
        body: JSON.stringify({ managerId }),
      });
      
      console.log('✅ Manager removed successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error removing manager:', error);
      return {
        success: false,
        error: 'Error al remover el manager'
      };
    }
  }

  // Obtener estadísticas de tiendas (solo admin)
  async getStoreStats(): Promise<StoreStatsResponse> {
    try {
      const response = await this.makeRequest<StoreStatsResponse>('/admin/stores/stats');
      
      console.log('✅ Store stats loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching store stats, usando datos mock:', error);
      
      // Si el circuit breaker está abierto o hay error, usar datos mock
      if (circuitBreaker.getState() === 'OPEN' || error instanceof Error) {
        console.log('🔄 Usando datos mock para estadísticas de tiendas');
        return {
          success: true,
          data: mockStoreStats
        };
      }
      
      return {
        success: false,
        error: 'Error al cargar las estadísticas'
      };
    }
  }

  // Buscar tiendas por división administrativa
  async searchByAdministrativeDivision(params: {
    state?: string;
    municipality?: string;
    parish?: string;
  }): Promise<StoreResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.state) queryParams.append('state', params.state);
      if (params.municipality) queryParams.append('municipality', params.municipality);
      if (params.parish) queryParams.append('parish', params.parish);

      const queryString = queryParams.toString();
      const endpoint = `/stores/search/by-division${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeRequest<StoreResponse>(endpoint);
      
      console.log('✅ Stores searched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error searching stores by division:', error);
      return {
        success: false,
        error: 'Error al buscar tiendas'
      };
    }
  }

  // Obtener usuarios que pueden ser propietarios de tiendas
  async getAvailableOwners(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      // Obtener usuarios con rol store_manager que pueden ser propietarios
      const response = await userService.getAllUsers({
        role: 'store_manager',
        isActive: true,
        limit: 1000 // Obtener todos los usuarios disponibles
      });
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.users
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al cargar usuarios disponibles'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching available owners:', error);
      return {
        success: false,
        error: 'Error al cargar usuarios disponibles'
      };
    }
  }

  // Obtener usuarios que pueden ser managers de tiendas
  async getAvailableManagers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      // Obtener usuarios con rol store_manager que pueden ser managers
      const response = await userService.getAllUsers({
        role: 'store_manager',
        isActive: true,
        limit: 1000 // Obtener todos los usuarios disponibles
      });
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.users
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al cargar usuarios disponibles'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching available managers:', error);
      return {
        success: false,
        error: 'Error al cargar usuarios disponibles'
      };
    }
  }
}

export const storeService = new StoreService();
export default storeService;
