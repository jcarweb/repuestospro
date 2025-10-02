import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from '../config/api';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    store: {
      _id: string;
      name: string;
    };
  };
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  data?: CartItem[];
  message?: string;
  error?: string;
}

class CartService {
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

  async getCart(): Promise<CartResponse> {
    try {
      const response = await this.makeRequest<CartResponse>('/cart');
      return response;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        error: 'Error al cargar el carrito'
      };
    }
  }

  async addToCart(productId: string, quantity: number = 1): Promise<CartResponse> {
    try {
      const response = await this.makeRequest<CartResponse>('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      return response;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: 'Error al agregar producto al carrito'
      };
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartResponse> {
    try {
      const response = await this.makeRequest<CartResponse>(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        error: 'Error al actualizar el producto en el carrito'
      };
    }
  }

  async removeFromCart(itemId: string): Promise<CartResponse> {
    try {
      const response = await this.makeRequest<CartResponse>(`/cart/items/${itemId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        error: 'Error al eliminar producto del carrito'
      };
    }
  }

  async clearCart(): Promise<CartResponse> {
    try {
      const response = await this.makeRequest<CartResponse>('/cart/clear', {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        error: 'Error al vaciar el carrito'
      };
    }
  }
}

export const cartService = new CartService();
