import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthResponse, LoginRequest, RegisterRequest, ApiResponse, User } from '../types';
import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

class CryptoAuthService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      // Intentar cargar desde SecureStore primero
      this.token = await SecureStore.getItemAsync('authToken');
      
      // Si no está en SecureStore, intentar desde AsyncStorage (migración)
      if (!this.token) {
        this.token = await AsyncStorage.getItem('authToken');
        if (this.token) {
          // Migrar a SecureStore
          await SecureStore.setItemAsync('authToken', this.token);
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await SecureStore.setItemAsync('authToken', token);
      this.token = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken() {
    try {
      await SecureStore.deleteItemAsync('authToken');
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
      console.log('🌐 Making crypto auth request to:', url);
      
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
      console.error('Crypto Auth API Error:', error);
      
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

  /**
   * Decodifica un token JWT-like sin verificar la firma (solo para obtener el payload)
   */
  private decodeTokenPayload(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const encodedPayload = parts[1];
      const decodedPayload = this.base64UrlDecode(encodedPayload);
      return JSON.parse(decodedPayload) as TokenPayload;
    } catch (error) {
      console.error('Error decoding token payload:', error);
      return null;
    }
  }

  /**
   * Decodifica desde base64url
   */
  private base64UrlDecode(str: string): string {
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  }

  /**
   * Obtiene el rol del usuario desde el token
   */
  async getUserRole(): Promise<string | null> {
    try {
      if (!this.token) {
        return null;
      }

      const payload = this.decodeTokenPayload(this.token);
      return payload?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario es admin
   */
  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin';
  }

  // Auth endpoints usando crypto auth
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/crypto-auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/crypto-auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/crypto-auth/verify');
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/crypto-auth/profile');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/crypto-auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await this.removeToken();
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.token) {
        return false;
      }

      // Verificar si el token no ha expirado
      const payload = this.decodeTokenPayload(this.token);
      if (!payload || !payload.exp) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Store Photo endpoints
  async uploadStorePhoto(photoData: {
    name: string;
    phone?: string;
    lat: number;
    lng: number;
    imageUri: string;
  }): Promise<ApiResponse<any>> {
    const formData = new FormData();
    
    formData.append('name', photoData.name);
    if (photoData.phone) {
      formData.append('phone', photoData.phone);
    }
    formData.append('lat', photoData.lat.toString());
    formData.append('lng', photoData.lng.toString());
    
    // Agregar la imagen
    formData.append('image', {
      uri: photoData.imageUri,
      type: 'image/jpeg',
      name: 'store-photo.jpg',
    } as any);

    const response = await fetch(`${API_BASE_URL}/store-photos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error subiendo foto');
    }

    return data;
  }

  async getStorePhotos(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/store-photos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async getStorePhoto(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/store-photos/${id}`);
  }

  async runEnrichment(photoId?: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/store-photos/admin/enrichment/run', {
      method: 'POST',
      body: JSON.stringify({ photoId }),
    });
  }

  async getEnrichmentStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/store-photos/admin/enrichment/stats');
  }

  async controlWorker(action: 'start' | 'stop'): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/store-photos/admin/worker/control', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async deleteStorePhoto(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/store-photos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const cryptoAuthService = new CryptoAuthService();
export default cryptoAuthService;
