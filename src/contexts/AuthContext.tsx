import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  location: { latitude: number; longitude: number } | null;
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

  // Verificar token al cargar la aplicación (simplificado)
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

        // Por ahora, solo usar los datos almacenados sin verificar con el backend
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
    // Implementación simplificada
    return !!user && !!token;
  };

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginAsync = async (email: string, password: string) => {
    try {
      console.log('🌐 Enviando request a:', `http://localhost:5000/api/auth/login`);
      const response = await fetch(`http://localhost:5000/api/auth/login`, {
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

      console.log('✅ Login exitoso, guardando datos...');
      login(data.data.user, data.data.token);
    } catch (error) {
      console.error('❌ Error en loginAsync:', error);
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
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    token,
    location,
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