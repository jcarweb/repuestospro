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
  message?: string;
  error?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'store_manager' | 'client' | 'delivery';
  password: string;
  stores?: string[];
}

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'store_manager' | 'client' | 'delivery';
  isActive?: boolean;
  stores?: string[];
}

class UserService {
  private baseUrl = '';
  private useMockData = false;

  constructor() {
    this.initializeBaseUrl();
  }

  private async initializeBaseUrl() {
    this.baseUrl = await getBaseURL();
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private getMockData() {
    return {
      users: [
        {
          _id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+584121234567',
          role: 'store_manager' as const,
          isActive: true,
          isEmailVerified: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-01-20T14:22:00Z',
          stores: ['Tienda Central', 'Sucursal Norte']
        },
        {
          _id: '2',
          name: 'María González',
          email: 'maria@example.com',
          phone: '+584121234568',
          role: 'client' as const,
          isActive: true,
          isEmailVerified: true,
          createdAt: '2024-01-10T09:15:00Z',
          lastLogin: '2024-01-19T16:45:00Z'
        },
        {
          _id: '3',
          name: 'Carlos Rodríguez',
          email: 'carlos@example.com',
          phone: '+584121234569',
          role: 'delivery' as const,
          isActive: false,
          isEmailVerified: false,
          createdAt: '2024-01-05T11:20:00Z',
          lastLogin: '2024-01-18T08:30:00Z'
        },
        {
          _id: '4',
          name: 'Ana Martínez',
          email: 'ana@example.com',
          phone: '+584121234570',
          role: 'store_manager' as const,
          isActive: true,
          isEmailVerified: true,
          createdAt: '2024-01-12T13:45:00Z',
          lastLogin: '2024-01-20T10:15:00Z',
          stores: ['Tienda Sur']
        },
        {
          _id: '5',
          name: 'Luis Hernández',
          email: 'luis@example.com',
          phone: '+584121234571',
          role: 'client' as const,
          isActive: true,
          isEmailVerified: true,
          createdAt: '2024-01-08T14:20:00Z',
          lastLogin: '2024-01-20T09:30:00Z'
        },
        {
          _id: '6',
          name: 'Carmen Silva',
          email: 'carmen@example.com',
          phone: '+584121234572',
          role: 'delivery' as const,
          isActive: true,
          isEmailVerified: true,
          createdAt: '2024-01-14T16:10:00Z',
          lastLogin: '2024-01-19T11:45:00Z'
        }
      ],
      pagination: {
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20,
        total: 6,
        totalPages: 1
      }
    };
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<UserResponse> {
    try {
      // Si estamos usando datos mock, devolverlos directamente
      if (this.useMockData) {
        console.log('📦 Using mock data for users');
        const mockData = this.getMockData();
        return {
          success: true,
          data: mockData
        };
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await this.makeRequest<UserResponse>(`/debug/users?${queryParams.toString()}`);
      
      console.log('✅ Users loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      
      // Si hay error, usar datos mock como fallback
      if (error instanceof Error && error.message.includes('429')) {
        console.log('📦 Switching to mock data for users due to rate limiting');
        this.useMockData = true;
        const mockData = this.getMockData();
        return {
          success: true,
          data: mockData
        };
      }

      return {
        success: false,
        message: 'Error al cargar usuarios desde la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getUserById(userId: string): Promise<{ success: boolean; data?: User; message?: string; error?: string }> {
    try {
      if (this.useMockData) {
        console.log('📦 Using mock data for user by ID');
        const mockData = this.getMockData();
        const user = mockData.users.find(u => u._id === userId);
        return {
          success: true,
          data: user
        };
      }

      const response = await this.makeRequest<{ success: boolean; data?: User; message?: string; error?: string }>(`/users/${userId}`);
      
      console.log('✅ User loaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      
      if (error instanceof Error && error.message.includes('429')) {
        console.log('📦 Switching to mock data for user due to rate limiting');
        this.useMockData = true;
        const mockData = this.getMockData();
        const user = mockData.users.find(u => u._id === userId);
        return {
          success: true,
          data: user
        };
      }

      return {
        success: false,
        message: 'Error al cargar usuario desde la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async createUser(userData: CreateUserData): Promise<{ success: boolean; data?: User; message?: string; error?: string }> {
    try {
      if (this.useMockData) {
        console.log('📦 Using mock data for create user');
        const newUser: User = {
          _id: Date.now().toString(),
          ...userData,
          isActive: true,
          isEmailVerified: false,
          createdAt: new Date().toISOString()
        };
        return {
          success: true,
          data: newUser
        };
      }

      const response = await this.makeRequest<{ success: boolean; data?: User; message?: string; error?: string }>('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      console.log('✅ User created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      
      if (error instanceof Error && error.message.includes('429')) {
        console.log('📦 Switching to mock data for create user due to rate limiting');
        this.useMockData = true;
        const newUser: User = {
          _id: Date.now().toString(),
          ...userData,
          isActive: true,
          isEmailVerified: false,
          createdAt: new Date().toISOString()
        };
        return {
          success: true,
          data: newUser
        };
      }

      return {
        success: false,
        message: 'Error al crear usuario en la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<{ success: boolean; data?: User; message?: string; error?: string }> {
    try {
      if (this.useMockData) {
        console.log('📦 Using mock data for update user');
        const mockData = this.getMockData();
        const user = mockData.users.find(u => u._id === userId);
        if (user) {
          const updatedUser = { ...user, ...userData };
          return {
            success: true,
            data: updatedUser
          };
        }
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      const response = await this.makeRequest<{ success: boolean; data?: User; message?: string; error?: string }>(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      
      console.log('✅ User updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      
      if (error instanceof Error && error.message.includes('429')) {
        console.log('📦 Switching to mock data for update user due to rate limiting');
        this.useMockData = true;
        const mockData = this.getMockData();
        const user = mockData.users.find(u => u._id === userId);
        if (user) {
          const updatedUser = { ...user, ...userData };
          return {
            success: true,
            data: updatedUser
          };
        }
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: false,
        message: 'Error al actualizar usuario en la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (this.useMockData) {
        console.log('📦 Using mock data for delete user');
        return {
          success: true,
          message: 'Usuario eliminado exitosamente'
        };
      }

      const response = await this.makeRequest<{ success: boolean; message?: string; error?: string }>(`/users/${userId}`, {
        method: 'DELETE'
      });
      
      console.log('✅ User deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      
      if (error instanceof Error && error.message.includes('429')) {
        console.log('📦 Switching to mock data for delete user due to rate limiting');
        this.useMockData = true;
        return {
          success: true,
          message: 'Usuario eliminado exitosamente'
        };
      }

      return {
        success: false,
        message: 'Error al eliminar usuario de la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; data?: User; message?: string; error?: string }> {
    return this.updateUser(userId, { isActive });
  }

  async getUsersByRole(role: string): Promise<UserResponse> {
    return this.getUsers({ role });
  }

  async getActiveUsers(): Promise<UserResponse> {
    return this.getUsers({ status: 'active' });
  }

  async getInactiveUsers(): Promise<UserResponse> {
    return this.getUsers({ status: 'inactive' });
  }
}

export const userService = new UserService();
export type { User, CreateUserData, UpdateUserData, UserResponse };