import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from '../config/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'store_manager' | 'client' | 'delivery';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  stores?: string[];
}

interface UserResponse {
  success: boolean;
  data?: {
    users: User[];
    pagination: {
      currentPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

interface SingleUserResponse {
  success: boolean;
  data?: User;
  error?: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'store_manager' | 'client' | 'delivery';
  stores?: string[];
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'store_manager' | 'client' | 'delivery';
  isActive?: boolean;
  stores?: string[];
}

class UserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '';
    this.initializeBaseUrl();
  }

  private async initializeBaseUrl() {
    try {
      this.baseUrl = await getBaseURL();
      console.log('🔧 UserService initialized with base URL:', this.baseUrl);
    } catch (error) {
      console.error('❌ Error initializing UserService base URL:', error);
    }
  }

  private async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async fetchUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/admin/users?${queryParams.toString()}`;
      const response = await this.makeRequest<UserResponse>(endpoint);
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async createUser(userData: CreateUserRequest): Promise<SingleUserResponse> {
    try {
      const response = await this.makeRequest<SingleUserResponse>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<SingleUserResponse> {
    try {
      const response = await this.makeRequest<SingleUserResponse>(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; error?: string }>(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getUserById(userId: string): Promise<SingleUserResponse> {
    try {
      const response = await this.makeRequest<SingleUserResponse>(`/admin/users/${userId}`);
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching user by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async toggleUserStatus(userId: string): Promise<SingleUserResponse> {
    try {
      const response = await this.makeRequest<SingleUserResponse>(`/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const userService = new UserService();

// Funciones de conveniencia para compatibilidad
export const fetchUsers = (params?: any) => userService.fetchUsers(params);
export const createUser = (userData: CreateUserRequest) => userService.createUser(userData);
export const updateUser = (userId: string, userData: UpdateUserRequest) => userService.updateUser(userId, userData);
export const deleteUser = (userId: string) => userService.deleteUser(userId);

export type { User, UserResponse, SingleUserResponse, CreateUserRequest, UpdateUserRequest };
export default userService;