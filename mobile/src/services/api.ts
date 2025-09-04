import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, RegisterRequest, ApiResponse, User } from '../types';
import API_CONFIG from '../config/api';
import { OFFLINE_MODE, mockApiResponse, simulateNetworkDelay, mockUser } from '../config/offline-mode';

const API_BASE_URL = API_CONFIG.BASE_URL;

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
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log('🌐 Making request to:', url);
      
      // Agregar timeout a la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Si es un error de timeout o conexión, devolver un error más específico
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: El servidor no respondió en el tiempo esperado');
        }
        if (error.message.includes('Network request failed')) {
          throw new Error('Error de conexión: No se pudo conectar al servidor');
        }
      }
      
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (OFFLINE_MODE) {
      console.log('🔌 Modo offline: Simulando login');
      await simulateNetworkDelay(1500);
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token-12345',
          user: mockUser
        },
        message: 'Login exitoso (modo offline)'
      };
      await this.saveToken(mockResponse.data.token);
      return mockResponse;
    }

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
    if (OFFLINE_MODE) {
      console.log('🔌 Modo offline: Simulando registro');
      await simulateNetworkDelay(2000);
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token-12345',
          user: { ...mockUser, ...userData }
        },
        message: 'Registro exitoso (modo offline)'
      };
      await this.saveToken(mockResponse.data.token);
      return mockResponse;
    }

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
    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/products/${id}`);
  }

  // Categories endpoints
  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/categories');
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

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      // Solo verificar si existe un token, sin hacer petición al backend
      return this.token !== null && this.token !== '';
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
