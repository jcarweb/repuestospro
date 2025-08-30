import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import apiService from '../services/api';
import authVerificationService from '../services/authVerification';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleToken: string, userInfo: any) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Limpiar tokens al inicio para asegurar estado limpio
    const cleanStart = async () => {
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      } catch (error) {
        console.error('Error cleaning storage:', error);
      }
    };
    
    cleanStart().then(() => {
      checkAuthStatus();
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Primero verificar si hay token local
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        // No hay token, usuario no autenticado
        setUser(null);
        return;
      }
      
      // Hay token, verificar si es válido
      const isAuth = await apiService.isAuthenticated();
      
      if (isAuth) {
        try {
          const currentUser = await apiService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token inválido, limpiar
            await AsyncStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (error) {
          // Error al obtener usuario, token probablemente inválido
          console.log('Token inválido, limpiando...');
          await AsyncStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        throw new Error(response.message || 'Error en el inicio de sesión');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error en el inicio de sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.register({
        ...userData,
        role: 'client'
      });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.message || 'Error en el registro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken: string, userInfo: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.loginWithGoogle(googleToken, userInfo);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        throw new Error(response.message || 'Error en el inicio de sesión con Google');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'Error en el inicio de sesión con Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.forgotPassword(email);
      setError('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Error al enviar el enlace de recuperación.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.resetPassword(token, password);
      setError('Contraseña restablecida con éxito. Por favor, inicia sesión.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Error al restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    forgotPassword,
    resetPassword,
    logout,
    clearError,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
