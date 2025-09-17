import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { API_BASE_URL } from '../../config/api';

interface AuthContextType {
  user: User | null | undefined;
  token: string | null;
  location: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  loginAsync: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  updateLocation: (location: { latitude: number; longitude: number }) => void;
  clearLocation: () => void;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<boolean>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('AuthContext - Stored token:', storedToken ? 'exists' : 'not found');
        console.log('AuthContext - Stored user:', storedUser);

        if (!storedToken || !storedUser) {
          console.log('AuthContext - No token or user found, setting null');
          setUser(null);
          setToken(null);
          setIsLoading(false);
          return;
        }

        // Verificar que el token no esté expirado (básico)
        try {
          const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            console.log('AuthContext - Token expirado, limpiando datos');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return;
          }
        } catch (tokenError) {
          console.warn('AuthContext - Error verificando token, continuando con datos almacenados');
        }

        // Usar los datos almacenados
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          console.log('AuthContext - Using stored user data:', userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkAuthStatus:', error);
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        return false;
      }

      // Verificar token con el backend
      const apiUrl = import.meta.env.VITE_API_URL || 'API_BASE_URL';
      const response = await fetch(`${apiUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(storedToken);
        return true;
      } else {
        // Token inválido, limpiar datos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        return false;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  };

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginAsync = async (email: string, password: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'API_BASE_URL';
      console.log('🌐 Enviando request a:', `${apiUrl}/auth/login`);
      
      // Verificar si el servidor está disponible antes de hacer la petición
      const serverCheck = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);

      if (!serverCheck || !serverCheck.ok) {
        throw new Error('El servidor backend no está disponible. Por favor, asegúrate de que el servidor esté ejecutándose en el puerto 5000.');
      }

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📄 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión');
      }

      // Verificar si requiere 2FA
      if (data.requiresTwoFactor) {
        console.log('🔐 2FA requerido, lanzando error especial');
        const error = new Error('2FA_REQUIRED');
        (error as any).requiresTwoFactor = true;
        (error as any).tempToken = data.tempToken;
        (error as any).userData = data.data.user;
        throw error;
      }

      console.log('✅ Login exitoso, guardando datos...');
      login(data.data.user, data.data.token);
    } catch (error: any) {
      console.error('❌ Error en loginAsync:', error);
      
      // Manejar errores específicos de red
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en API_BASE_URL');
      }
      
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLocation(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateLocation = (newLocation: { latitude: number; longitude: number }) => {
    setLocation(newLocation);
  };

  const clearLocation = () => {
    setLocation(null);
  };

  const hasRole = (role: UserRole): boolean => {
    console.log('🔍 hasRole check:', { userRole: user?.role, requestedRole: role, match: user?.role === role });
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    token,
    location,
    isLoading,
    login,
    loginAsync,
    logout,
    updateUser,
    updateLocation,
    clearLocation,
    isAuthenticated: !!user && !!token,
    checkAuthStatus,
    hasRole,
    hasAnyRole,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};