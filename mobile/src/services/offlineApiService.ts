/**
 * Servicio de API completamente offline
 * Reemplaza TODAS las llamadas de red con respuestas simuladas
 */

import { User } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class OfflineApiService {
  private mockUser: User | null = null;

  // Simular login exitoso SIEMPRE
  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Login simulado exitoso');
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.mockUser = {
      id: 'user-123',
      name: 'Usuario PiezasYA',
      email: credentials.email,
      role: 'client',
      emailVerified: true,
      phone: '+1234567890',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: {
        user: this.mockUser,
        token: 'offline-jwt-token-123'
      },
      message: 'Login exitoso (offline)'
    };
  }
  
  // Simular registro exitoso SIEMPRE
  async register(userData: any): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Registro simulado exitoso');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        user: {
          id: 'offline-user-new',
          name: userData.name,
          email: userData.email,
          role: 'client',
          emailVerified: false
        }
      },
      message: 'Registro exitoso (offline)'
    };
  }
  
  // Simular login con Google SIEMPRE
  async loginWithGoogle(token: string, userInfo: any): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Login con Google simulado');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.mockUser = {
      id: 'google-user-123',
      name: userInfo.name || 'Usuario Google',
      email: userInfo.email,
      role: 'client',
      emailVerified: true
    };
    
    return {
      success: true,
      data: {
        user: this.mockUser,
        token: 'offline-google-token-123'
      },
      message: 'Login con Google exitoso (offline)'
    };
  }
  
  // Simular forgot password SIEMPRE
  async forgotPassword(email: string): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Forgot password simulado');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Email de recuperación enviado (offline)'
    };
  }
  
  // Simular reset password SIEMPRE
  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Reset password simulado');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Contraseña restablecida (offline)'
    };
  }
  
  // Simular resend verification email SIEMPRE
  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Resend verification simulado');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Email de verificación reenviado (offline)'
    };
  }
  
  // Simular verify email SIEMPRE
  async verifyEmail(token: string): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Verify email simulado');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Email verificado (offline)'
    };
  }
  
  // Simular logout SIEMPRE
  async logout(): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Logout simulado');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.mockUser = null;
    
    return {
      success: true,
      message: 'Logout exitoso (offline)'
    };
  }
  
  // Simular obtener productos SIEMPRE
  async getProducts(): Promise<ApiResponse> {
    console.log('🔧 OFFLINE API: Productos simulados');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockProducts = [
      {
        id: '1',
        name: 'Producto Offline 1',
        price: 100,
        description: 'Descripción del producto offline',
        image: 'https://via.placeholder.com/300x200',
        category: 'Categoría Offline'
      },
      {
        id: '2',
        name: 'Producto Offline 2',
        price: 200,
        description: 'Descripción del producto offline 2',
        image: 'https://via.placeholder.com/300x200',
        category: 'Categoría Offline'
      }
    ];
    
    return {
      success: true,
      data: mockProducts,
      message: 'Productos obtenidos (offline)'
    };
  }
}

export default new OfflineApiService();
