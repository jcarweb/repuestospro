import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from '../config/api';

export interface SellerStats {
  totalQueries: number;
  successfulSales: number;
  averageResponseTime: number;
  customerRating: number;
  unreadMessages: number;
  pendingQuotes: number;
  todayQueries: number;
  monthlySales: number;
}

export interface SellerResponse {
  success: boolean;
  data?: SellerStats;
  message?: string;
  error?: string;
}

class SellerService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    const baseURL = await getBaseURL();
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getSellerStats(): Promise<SellerResponse> {
    try {
      const response = await this.makeRequest<SellerResponse>('/seller/stats');
      return response;
    } catch (error) {
      console.error('Error fetching seller stats:', error);
      return {
        success: false,
        error: 'Error al cargar estadísticas del vendedor'
      };
    }
  }

  async getSellerQueries(params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/seller/queries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest<any>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching seller queries:', error);
      return {
        success: false,
        error: 'Error al cargar consultas del vendedor'
      };
    }
  }

  async getSellerQuotes(params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/seller/quotes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest<any>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching seller quotes:', error);
      return {
        success: false,
        error: 'Error al cargar cotizaciones del vendedor'
      };
    }
  }

  async getSellerMessages(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/seller/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest<any>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching seller messages:', error);
      return {
        success: false,
        error: 'Error al cargar mensajes del vendedor'
      };
    }
  }
}

export const sellerService = new SellerService();
