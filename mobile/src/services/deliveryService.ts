import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from '../config/api';

export interface DeliveryStats {
  assignedOrders: number;
  completedToday: number;
  averageRating: number;
  totalEarnings: number;
  currentStatus: 'available' | 'unavailable' | 'busy' | 'on_route' | 'returning_to_store';
  autoStatusMode: boolean;
  workHours: string;
  deliveryZone: {
    center: [number, number];
    radius: number;
  };
}

export interface DeliveryOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  assignedAt: string;
  estimatedDelivery: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  signature?: string;
}

export interface DeliveryResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

class DeliveryService {
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

  async getDeliveryStats(): Promise<DeliveryResponse> {
    try {
      const response = await this.makeRequest<DeliveryResponse>('/admin/delivery/stats');
      return response;
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      return {
        success: false,
        error: 'Error al cargar estadísticas del delivery'
      };
    }
  }

  async getAssignedOrders(): Promise<DeliveryResponse> {
    try {
      const response = await this.makeRequest<DeliveryResponse>('/admin/delivery/orders');
      return response;
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
      return {
        success: false,
        error: 'Error al cargar órdenes asignadas'
      };
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<DeliveryResponse> {
    try {
      const response = await this.makeRequest<DeliveryResponse>(`/admin/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: 'Error al actualizar estado de la orden'
      };
    }
  }

  async getDeliveryReports(params: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  } = {}): Promise<DeliveryResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/admin/delivery/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest<DeliveryResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching delivery reports:', error);
      return {
        success: false,
        error: 'Error al cargar reportes del delivery'
      };
    }
  }

  async getDeliveryEarnings(params: {
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<DeliveryResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/admin/delivery/earnings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest<DeliveryResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching delivery earnings:', error);
      return {
        success: false,
        error: 'Error al cargar ganancias del delivery'
      };
    }
  }

  async updateDeliverySettings(settings: any): Promise<DeliveryResponse> {
    try {
      const response = await this.makeRequest<DeliveryResponse>('/admin/delivery/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      return response;
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      return {
        success: false,
        error: 'Error al actualizar configuración del delivery'
      };
    }
  }

  async getDeliveryRatings(): Promise<DeliveryResponse> {
    try {
      const response = await this.makeRequest<DeliveryResponse>('/admin/delivery/ratings');
      return response;
    } catch (error) {
      console.error('Error fetching delivery ratings:', error);
      return {
        success: false,
        error: 'Error al cargar calificaciones del delivery'
      };
    }
  }

  async saveDeliverySignature(orderId: string, signature: string, customerName: string, deliveryNotes?: string): Promise<DeliveryResponse> {
    try {
      const response = await this.makeRequest<DeliveryResponse>(`/admin/delivery/orders/${orderId}/signature`, {
        method: 'POST',
        body: JSON.stringify({
          signature,
          customerName,
          deliveryNotes
        })
      });
      return response;
    } catch (error) {
      console.error('Error saving delivery signature:', error);
      return {
        success: false,
        error: 'Error al guardar firma del cliente'
      };
    }
  }
}

export const deliveryService = new DeliveryService();
