import { API_BASE_URL } from '../config/api';

// Datos mock para usuarios
const mockUsers = [
  {
    _id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'store_owner',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'María García',
    email: 'maria@example.com',
    role: 'store_owner',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Carlos López',
    email: 'carlos@example.com',
    role: 'store_manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Ana Rodríguez',
    email: 'ana@example.com',
    role: 'store_manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data?: User[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

class UserService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.role) queryParams.append('role', params.role);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.search) queryParams.append('search', params.search);

      const endpoint = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        totalPages: response.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cargar usuarios'
      };
    }
  }

  async getStoreOwners(): Promise<UserResponse> {
    try {
      // Usar el endpoint específico para obtener usuarios con rol store_owner
      const response = await this.makeRequest('/api/admin/users?role=store_owner');
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching store owners, usando datos mock:', error);
      // Usar datos mock como fallback
      const mockOwners = mockUsers.filter(user => user.role === 'store_owner');
      return {
        success: true,
        data: mockOwners
      };
    }
  }

  async getStoreManagers(): Promise<UserResponse> {
    try {
      // Usar el endpoint específico para obtener usuarios con rol store_manager
      const response = await this.makeRequest('/api/admin/users?role=store_manager');
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching store managers, usando datos mock:', error);
      // Usar datos mock como fallback
      const mockManagers = mockUsers.filter(user => user.role === 'store_manager');
      return {
        success: true,
        data: mockManagers
      };
    }
  }

  async getAvailableUsers(): Promise<UserResponse> {
    try {
      // Obtener usuarios con roles store_owner y store_manager por separado
      const [ownersResponse, managersResponse] = await Promise.all([
        this.makeRequest('/api/admin/users?role=store_owner'),
        this.makeRequest('/api/admin/users?role=store_manager')
      ]);
      
      const allUsers = [
        ...(ownersResponse.data || []),
        ...(managersResponse.data || [])
      ];
      
      return {
        success: true,
        data: allUsers
      };
    } catch (error) {
      console.error('Error fetching available users, usando datos mock:', error);
      // Usar datos mock como fallback
      const mockAvailableUsers = mockUsers.filter(user => user.role === 'store_owner' || user.role === 'store_manager');
      return {
        success: true,
        data: mockAvailableUsers
      };
    }
  }
}

export const userService = new UserService();
