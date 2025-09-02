import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import apiService from '../services/api';
import authVerificationService from '../services/authVerification';
import { useToast } from './ToastContext';

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
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
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
  const { showToast } = useToast();

  useEffect(() => {
    // Inicialización simple sin llamadas al backend
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Solo verificar datos locales
        const userData = await AsyncStorage.getItem('user');
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            setUser(user);
          } catch (error) {
            console.log('Error parsing user data, cleaning...');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('authToken');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Primero verificar si hay un usuario verificado localmente
      const localUserData = await AsyncStorage.getItem('user');
      if (localUserData) {
        try {
          const localUser = JSON.parse(localUserData);
          if (localUser.email === email && localUser.emailVerified === true) {
            // Usuario ya verificado localmente, permitir login
            setUser(localUser);
            showToast('Inicio de sesión exitoso', 'success');
            return;
          }
        } catch (error) {
          console.log('Error parsing local user data');
        }
      }
      
      // Si no hay usuario verificado localmente, intentar login normal
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        throw new Error(response.message || 'Error en el inicio de sesión');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Error en el inicio de sesión';
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
        // No establecer el usuario como autenticado hasta que verifique su email
        // setUser(response.data.user);
        // await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        // En su lugar, mostrar mensaje de éxito
        showToast('Cuenta creada exitosamente. Por favor verifica tu email.', 'success');
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.message || 'Error en el registro';
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
      const errorMessage = error.message || 'Error en el inicio de sesión con Google';
      setError(errorMessage);
      showToast(errorMessage, 'error');
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

  const resendVerificationEmail = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.resendVerificationEmail(email);
      setError('Se ha enviado un nuevo enlace de verificación a tu correo electrónico.');
    } catch (error: any) {
      console.error('Resend verification email error:', error);
      setError(error.message || 'Error al reenviar el enlace de verificación.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.verifyEmail(token);
      
      if (response.success) {
        showToast('Email verificado con éxito. Por favor, inicia sesión.', 'success');
      } else {
        throw new Error(response.message || 'Error al verificar el email');
      }
    } catch (error: any) {
      console.error('Verify email error:', error);
      const errorMessage = error.message || 'Error al verificar el email.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw error;
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
    resendVerificationEmail,
    verifyEmail,
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
