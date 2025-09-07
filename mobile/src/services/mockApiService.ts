/**
 * Servicio de API simulado para desarrollo sin backend
 * Reemplaza temporalmente el apiService real
 */

import { User } from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class MockApiService {
  // Simular login exitoso
  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando login exitoso');
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: 'mock-user-123',
      name: 'Usuario Mock',
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
        user: mockUser,
        token: 'mock-jwt-token-123'
      },
      message: 'Login exitoso (simulado)'
    };
  }
  
  // Simular registro exitoso
  async register(userData: any): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando registro exitoso');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        user: {
          id: 'mock-user-new',
          name: userData.name,
          email: userData.email,
          role: 'client',
          emailVerified: false
        }
      },
      message: 'Registro exitoso (simulado)'
    };
  }
  
  // Simular login con Google
  async loginWithGoogle(token: string, userInfo: any): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando login con Google');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        user: {
          id: 'google-user-123',
          name: userInfo.name || 'Usuario Google',
          email: userInfo.email,
          role: 'client',
          emailVerified: true
        },
        token: 'mock-google-token-123'
      },
      message: 'Login con Google exitoso (simulado)'
    };
  }
  
  // Simular forgot password
  async forgotPassword(email: string): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando forgot password');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Email de recuperación enviado (simulado)'
    };
  }
  
  // Simular reset password
  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando reset password');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Contraseña restablecida (simulado)'
    };
  }
  
  // Simular resend verification email
  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando resend verification email');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Email de verificación reenviado (simulado)'
    };
  }
  
  // Simular verify email
  async verifyEmail(token: string): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando verify email');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Email verificado (simulado)'
    };
  }
  
  // Simular logout
  async logout(): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando logout');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Logout exitoso (simulado)'
    };
  }
  
  // Simular obtener productos
  async getProducts(): Promise<ApiResponse> {
    console.log('🔧 MOCK API: Simulando obtener productos');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockProducts = [
      {
        id: '1',
        name: 'Producto Mock 1',
        price: 100,
        description: 'Descripción del producto mock',
        image: 'https://via.placeholder.com/300x200',
        category: 'Categoría Mock'
      },
      {
        id: '2',
        name: 'Producto Mock 2',
        price: 200,
        description: 'Descripción del producto mock 2',
        image: 'https://via.placeholder.com/300x200',
        category: 'Categoría Mock'
      }
    ];
    
    return {
      success: true,
      data: mockProducts,
      message: 'Productos obtenidos (simulado)'
    };
  }
}

export default new MockApiService();
