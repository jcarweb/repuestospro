import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import cryptoAuthService from '../services/cryptoAuthService';
import { useToast } from './ToastContext';

interface CryptoAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
  checkAuthStatus: () => Promise<void>;
}

const CryptoAuthContext = createContext<CryptoAuthContextType | undefined>(undefined);

interface CryptoAuthProviderProps {
  children: ReactNode;
}

export const CryptoAuthProvider: React.FC<CryptoAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      const isAuthenticated = await cryptoAuthService.isAuthenticated();
      
      if (isAuthenticated) {
        // Verificar si el usuario es admin
        const adminStatus = await cryptoAuthService.isAdmin();
        setIsAdmin(adminStatus);
        
        // Obtener perfil del usuario
        try {
          const response = await cryptoAuthService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Error getting profile:', error);
          // Si hay error obteniendo el perfil, limpiar autenticación
          await cryptoAuthService.logout();
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cryptoAuthService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Verificar si es admin
        const adminStatus = await cryptoAuthService.isAdmin();
        setIsAdmin(adminStatus);
        
        // Guardar usuario en AsyncStorage para persistencia
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        showToast('Inicio de sesión exitoso', 'success');
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
      
      const response = await cryptoAuthService.register({
        ...userData,
        role: 'client'
      });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Verificar si es admin
        const adminStatus = await cryptoAuthService.isAdmin();
        setIsAdmin(adminStatus);
        
        // Guardar usuario en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        showToast('Registro exitoso', 'success');
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

  const logout = async () => {
    try {
      setIsLoading(true);
      
      await cryptoAuthService.logout();
      await AsyncStorage.removeItem('user');
      
      setUser(null);
      setIsAdmin(false);
      setError(null);
      
      showToast('Sesión cerrada', 'success');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: CryptoAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    register,
    logout,
    clearError,
    error,
    checkAuthStatus,
  };

  return (
    <CryptoAuthContext.Provider value={value}>
      {children}
    </CryptoAuthContext.Provider>
  );
};

export const useCryptoAuth = (): CryptoAuthContextType => {
  const context = useContext(CryptoAuthContext);
  if (context === undefined) {
    throw new Error('useCryptoAuth must be used within a CryptoAuthProvider');
  }
  return context;
};
