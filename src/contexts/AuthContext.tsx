import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  pin?: string;
  fingerprintEnabled?: boolean;
  twoFactorEnabled?: boolean;
  loyaltyLevel?: string;
  createdAt?: string;
}

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

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginAsync = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la autenticación');
      }

      if (data.success && data.data) {
        const userData = data.data.user;
        const token = data.data.token;
        
        // Asegurar que el usuario tenga un rol
        if (!userData.role) {
          userData.role = 'user'; // Rol por defecto
        }
        
        login(userData, token);
      } else {
        throw new Error(data.message || 'Error en la autenticación');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateLocation = (newLocation: { latitude: number; longitude: number }) => {
    setLocation(newLocation);
    localStorage.setItem('location', JSON.stringify(newLocation));
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('location');
  };

  const isAuthenticated = !!user && !!token;
  
  console.log('🔍 AuthContext - isAuthenticated:', isAuthenticated);
  console.log('🔍 AuthContext - user:', user);
  console.log('🔍 AuthContext - token:', token ? 'exists' : 'missing');
  
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
    isAuthenticated,
    checkAuthStatus
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};