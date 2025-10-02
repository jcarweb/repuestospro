import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, RegisterRequest, ApiResponse, User } from '../types';
import API_CONFIG, { getBaseURL } from '../config/api';
import { offlineService } from './offlineService';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('authToken', token);
      this.token = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken() {
    try {
      await AsyncStorage.removeItem('authToken');
      this.token = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = await getBaseURL();
    const url = `${baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    return await this.requestWithRetry(url, config, endpoint);
  }

  // Método mejorado con reintentos y backoff exponencial
  private async requestWithRetry<T>(
    url: string,
    config: RequestInit,
    operation: string,
    attempt: number = 1
  ): Promise<T> {
    try {
      console.log(`🌐 ${operation} (intento ${attempt}/${API_CONFIG.RETRY_ATTEMPTS}): ${url}`);
      
      // Timeout dinámico basado en el entorno
      const isProduction = url.includes('onrender.com');
      const timeout = isProduction ? 20000 : API_CONFIG.TIMEOUT; // 20s para Render, 15s para local
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        // Si es un error del servidor (5xx), reintentar
        if (response.status >= 500 && attempt < API_CONFIG.RETRY_ATTEMPTS) {
          throw new Error(`Server error: ${response.status}`);
        }
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (intento ${attempt}):`, error);
      
      // Lógica de reintentos
      if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
        const shouldRetry = this.shouldRetry(error);
        
        if (shouldRetry) {
          const delay = Math.min(
            API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1),
            API_CONFIG.MAX_RETRY_DELAY
          );
          
          console.log(`⏳ Reintentando ${operation} en ${delay}ms... (intento ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.requestWithRetry(url, config, operation, attempt + 1);
        }
      }
      
      // Si es un error de timeout o conexión, devolver un error más específico
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: El servidor no respondió en el tiempo esperado. Intenta nuevamente.');
        }
        if (error.message.includes('Network request failed')) {
          throw new Error('Error de conexión: No se pudo conectar al servidor. Verifica tu conexión a internet.');
        }
        if (error.message.includes('Server error')) {
          throw new Error('El servidor está experimentando problemas. Intenta nuevamente en unos momentos.');
        }
      }
      
      throw error;
    }
  }

  // Determinar si un error debe ser reintentado
  private shouldRetry(error: any): boolean {
    if (error instanceof Error) {
      // Reintentar en casos de timeout, errores de red, o errores del servidor
      return (
        error.name === 'AbortError' ||
        error.message.includes('Network request failed') ||
        error.message.includes('Server error') ||
        error.message.includes('fetch')
      );
    }
    return false;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async loginWithGoogle(googleToken: string, userInfo: any): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login/google', {
      method: 'POST',
      body: JSON.stringify({ googleToken, userInfo }),
    });

    if (response.success && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async loginWithPin(credentials: { email: string; pin: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login/pin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async verifyTwoFactor(credentials: { email: string; code: string; tempToken?: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login/2fa/complete', {
      method: 'POST',
      body: JSON.stringify({ 
        email: credentials.email, 
        code: credentials.code,
        tempToken: credentials.tempToken || 'temp-token' // Temporal hasta que implementemos el flujo completo
      }),
    });

    if (response.success && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await this.removeToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Verificar si hay token antes de hacer la petición
      if (!this.token) {
        console.log('No hay token, usuario no autenticado');
        return null;
      }
      
      const response = await this.request<ApiResponse<User>>('/auth/me');
      return response.data || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Products endpoints
  async getProducts(params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const cacheKey = `products_${queryParams.toString()}`;
    
    try {
      const response = await this.request<any>(endpoint);
      
      // Transformar la respuesta del backend al formato esperado
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.products || response.data,
          message: response.message
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.message || 'Error al cargar productos'
        };
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: [],
        message: 'Error de conexión al cargar productos'
      };
    }
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    const cacheKey = `product_${id}`;
    
    // Usar cache para producto individual (10 minutos de TTL)
    return offlineService.getData(
      cacheKey,
      () => this.request<ApiResponse<any>>(`/products/${id}`),
      10 * 60 * 1000
    );
  }

  // Categories endpoints
  async getCategories(): Promise<ApiResponse<any[]>> {
    const cacheKey = 'categories';
    
    // Usar cache para categorías (30 minutos de TTL - cambian poco)
    return offlineService.getData(
      cacheKey,
      () => this.request<ApiResponse<any[]>>('/categories'),
      30 * 60 * 1000
    );
  }

  async getSubcategories(categoryId: string): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/categories/${categoryId}/subcategories`);
  }

  // Stores endpoints
  async getStores(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/stores');
  }

  async getStore(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/stores/${id}`);
  }

  // Cart endpoints
  async getCart(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/cart');
  }

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/orders');
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/orders/${id}`);
  }

  // User profile endpoints
  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/profile');
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      // Solo verificar si existe un token, sin hacer petición al backend
      return this.token !== null && this.token !== '';
    } catch (error) {
      return false;
    }
  }

  // ==================== DELIVERY ENDPOINTS ====================

  /**
   * Obtener estadísticas del delivery
   */
  async getDeliveryStats(): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/stats/personal`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery stats:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes del delivery
   */
  async getDeliveryOrders(params?: { status?: string; limit?: number; page?: number }): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const queryParams = new URLSearchParams();
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await fetch(`${baseURL}/api/delivery/orders?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery orders:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una orden
   */
  async updateOrderStatus(orderId: string, status: string, notes?: string, location?: any): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status, notes, location }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Obtener ubicaciones de entrega
   */
  async getDeliveryLocations(status?: string): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const queryParams = new URLSearchParams();
      
      if (status) queryParams.append('status', status);

      const response = await fetch(`${baseURL}/api/delivery/locations?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery locations:', error);
      throw error;
    }
  }

  /**
   * Obtener reportes del delivery
   */
  async getDeliveryReports(params?: { period?: string; dateFrom?: string; dateTo?: string }): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const queryParams = new URLSearchParams();
      
      if (params?.period) queryParams.append('period', params.period);
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await fetch(`${baseURL}/api/delivery/reports?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery reports:', error);
      throw error;
    }
  }

  /**
   * Obtener calificaciones del delivery
   */
  async getDeliveryRatings(params?: { rating?: number; limit?: number; page?: number }): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const queryParams = new URLSearchParams();
      
      if (params?.rating) queryParams.append('rating', params.rating.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await fetch(`${baseURL}/api/delivery/ratings?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery ratings:', error);
      throw error;
    }
  }

  /**
   * Obtener horario de trabajo del delivery
   */
  async getDeliverySchedule(): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/schedule`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery schedule:', error);
      throw error;
    }
  }

  /**
   * Actualizar horario de trabajo del delivery
   */
  async updateDeliverySchedule(scheduleData: any): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/schedule`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating delivery schedule:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración del delivery
   */
  async getDeliverySettings(): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/settings`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery settings:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración del delivery
   */
  async updateDeliverySettings(settingsData: any): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/settings`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(settingsData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de ubicación del delivery
   */
  async getDeliveryLocation(): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/location`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery location:', error);
      throw error;
    }
  }

  /**
   * Actualizar ubicación del delivery
   */
  async updateDeliveryLocation(locationData: any): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/delivery/location`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(locationData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating delivery location:', error);
      throw error;
    }
  }

  /**
   * Obtener ganancias del delivery
   */
  async getDeliveryEarnings(params?: { period?: string; dateFrom?: string; dateTo?: string }): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const queryParams = new URLSearchParams();
      
      if (params?.period) queryParams.append('period', params.period);
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await fetch(`${baseURL}/api/delivery/earnings?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery earnings:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de disponibilidad del delivery
   */
  async updateDeliveryStatus(statusData: any): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/admin/delivery/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(statusData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }

  // ==================== STORE MANAGER ENDPOINTS ====================

  /**
   * Obtener configuración de la tienda
   */
  async getStoreConfiguration(storeId: string): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/stores/${storeId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting store configuration:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de la tienda
   */
  async updateStoreConfiguration(storeId: string, configData: any): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/stores/${storeId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(configData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating store configuration:', error);
      throw error;
    }
  }

  /**
   * Obtener preferencia de tasa de cambio de la tienda
   */
  async getStoreExchangeRatePreference(storeId: string): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/monetization/store/${storeId}/exchange-rate/preference`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting store exchange rate preference:', error);
      throw error;
    }
  }

  /**
   * Actualizar preferencia de tasa de cambio de la tienda
   */
  async updateStoreExchangeRatePreference(storeId: string, preferredExchangeRate: 'USD' | 'EUR'): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/monetization/store/${storeId}/exchange-rate/preference`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ preferredExchangeRate }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating store exchange rate preference:', error);
      throw error;
    }
  }

  /**
   * Obtener tasa de cambio actual según preferencia de la tienda
   */
  async getStoreExchangeRate(storeId: string): Promise<ApiResponse<any>> {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/api/monetization/store/${storeId}/exchange-rate/current`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting store exchange rate:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
