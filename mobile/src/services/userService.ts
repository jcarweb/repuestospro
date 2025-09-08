import { apiService, APIResponse } from './apiService';

// Interfaz para el usuario
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'client' | 'delivery' | 'store_manager';
  isEmailVerified: boolean;
  isActive: boolean;
  fingerprintEnabled: boolean;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  theme: 'light' | 'dark';
  language: 'es' | 'en' | 'pt';
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  pushEnabled: boolean;
  points: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  location?: {
    type: string;
    coordinates: number[];
  };
  locationEnabled: boolean;
  lastLocationUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para la respuesta de la lista de usuarios
export interface UsersResponse {
  success: boolean;
  data: User[];
  total: number;
}

// Interfaz para la respuesta de cambio de estado
export interface UserStatusResponse {
  success: boolean;
  data: User;
  message: string;
}

// Interfaz para la respuesta de eliminación
export interface UserDeleteResponse {
  success: boolean;
  message: string;
}

// Clase para manejar las operaciones de usuarios
export class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Obtener todos los usuarios
  async getUsers(): Promise<APIResponse<UsersResponse>> {
    try {
      console.log('👥 Obteniendo lista de usuarios...');
      const response = await apiService.get<UsersResponse>('/users');
      
      if (response.success && response.data) {
        console.log(`✅ Se obtuvieron ${response.data.total} usuarios`);
      } else {
        console.error('❌ Error obteniendo usuarios:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en getUsers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        statusCode: 0,
      };
    }
  }

  // Cambiar estado de usuario (activar/desactivar)
  async updateUserStatus(userId: string, isActive: boolean): Promise<APIResponse<UserStatusResponse>> {
    try {
      console.log(`🔄 Cambiando estado del usuario ${userId} a ${isActive ? 'activo' : 'inactivo'}...`);
      
      const response = await apiService.put<UserStatusResponse>(`/users/${userId}/status`, {
        isActive: isActive
      });
      
      if (response.success && response.data) {
        console.log(`✅ Estado del usuario actualizado: ${response.data.message}`);
      } else {
        console.error('❌ Error actualizando estado del usuario:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en updateUserStatus:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        statusCode: 0,
      };
    }
  }

  // Eliminar usuario
  async deleteUser(userId: string): Promise<APIResponse<UserDeleteResponse>> {
    try {
      console.log(`🗑️ Eliminando usuario ${userId}...`);
      
      const response = await apiService.delete<UserDeleteResponse>(`/users/${userId}`);
      
      if (response.success && response.data) {
        console.log(`✅ Usuario eliminado: ${response.data.message}`);
      } else {
        console.error('❌ Error eliminando usuario:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en deleteUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        statusCode: 0,
      };
    }
  }

  // Obtener usuario por ID
  async getUserById(userId: string): Promise<APIResponse<User>> {
    try {
      console.log(`👤 Obteniendo usuario ${userId}...`);
      
      const response = await apiService.get<User>(`/users/${userId}`);
      
      if (response.success && response.data) {
        console.log(`✅ Usuario obtenido: ${response.data.name}`);
      } else {
        console.error('❌ Error obteniendo usuario:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en getUserById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        statusCode: 0,
      };
    }
  }

  // Crear nuevo usuario
  async createUser(userData: Partial<User>): Promise<APIResponse<User>> {
    try {
      console.log(`➕ Creando nuevo usuario: ${userData.name}...`);
      
      const response = await apiService.post<User>('/users', userData);
      
      if (response.success && response.data) {
        console.log(`✅ Usuario creado: ${response.data.name}`);
      } else {
        console.error('❌ Error creando usuario:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en createUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        statusCode: 0,
      };
    }
  }

  // Actualizar usuario
  async updateUser(userId: string, userData: Partial<User>): Promise<APIResponse<User>> {
    try {
      console.log(`✏️ Actualizando usuario ${userId}...`);
      
      const response = await apiService.put<User>(`/users/${userId}`, userData);
      
      if (response.success && response.data) {
        console.log(`✅ Usuario actualizado: ${response.data.name}`);
      } else {
        console.error('❌ Error actualizando usuario:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en updateUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        statusCode: 0,
      };
    }
  }
}

// Instancia global del servicio
export const userService = UserService.getInstance();

// Funciones helper para uso directo
export const getUsers = () => userService.getUsers();
export const updateUserStatus = (userId: string, isActive: boolean) => 
  userService.updateUserStatus(userId, isActive);
export const deleteUser = (userId: string) => userService.deleteUser(userId);
export const getUserById = (userId: string) => userService.getUserById(userId);
export const createUser = (userData: Partial<User>) => userService.createUser(userData);
export const updateUser = (userId: string, userData: Partial<User>) => 
  userService.updateUser(userId, userData);

export default UserService;
