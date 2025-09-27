import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import apiService from '../services/api'; // Usar servicio real de API
// import { forceCorrectNetworkConfig } from '../utils/networkUtils'; // Forzar configuración correcta
import authVerificationService from '../services/authVerification';
// import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  pendingUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleToken: string, userInfo: any) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
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
  loadUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Función para crear un token JWT simulado para admin
const createMockAdminToken = (user: User): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };
  
  // Codificar header y payload en base64url
  const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  // Crear una firma simulada (en producción sería con una clave secreta)
  const signature = btoa('mock-signature-for-admin').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  // const { showToast } = useToast();
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    console.log(`Toast ${type}: ${message}`);
  };

  useEffect(() => {
    // Inicialización con configuración correcta
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        console.log('🔧 API REAL: Inicializando autenticación con configuración correcta');
        
        // Forzar configuración de red correcta
        // await forceCorrectNetworkConfig();
        
        // Verificar si hay un usuario guardado
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('✅ Usuario cargado desde AsyncStorage:', userData);
          console.log('🔍 Rol del usuario cargado:', userData.role);
          console.log('🔍 ¿Es admin?', userData.role === 'admin');
          console.log('🔍 Tipo de rol:', typeof userData.role);
          console.log('🔍 Rol exacto:', JSON.stringify(userData.role));
          
          // Verificar si el token es válido
          const token = await AsyncStorage.getItem('authToken');
          console.log('🔐 Token en AsyncStorage:', token ? `${token.substring(0, 20)}...` : 'null');
          if (token) {
            console.log('🔐 Token encontrado en AsyncStorage');
            // Verificar si el token no ha expirado
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const now = Math.floor(Date.now() / 1000);
              console.log('🔐 Token payload:', { userId: payload.userId, role: payload.role, exp: payload.exp, now });
              if (payload.exp && payload.exp > now) {
                console.log('✅ Token válido, usuario autenticado');
              } else {
                console.log('❌ Token expirado, limpiando usuario');
                setUser(null);
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('authToken');
              }
            } catch (error) {
              console.log('❌ Error verificando token:', error);
              console.log('❌ Error verificando token, limpiando usuario');
              setUser(null);
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('authToken');
            }
          } else {
            console.log('❌ No hay token, limpiando usuario');
            setUser(null);
            await AsyncStorage.removeItem('user');
          }
        } else {
          setUser(null);
        }
        
        setError(null);
        console.log('✅ Autenticación inicializada con API real');
        
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
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
        // Verificar si el backend requiere 2FA
        if (response.requiresTwoFactor && response.tempToken) {
          // 2FA habilitado - requerir verificación
          setRequiresTwoFactor(true);
          setPendingUser(response.data.user);
          
          // Guardar el tempToken para usar en la verificación 2FA
          await AsyncStorage.setItem('tempToken', response.tempToken);
          
          showToast('Ingresa el código de 2FA', 'info');
        } else {
          // Login directo sin 2FA
          setUser(response.data.user);
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
          
          // IMPORTANTE: Guardar también el token en AsyncStorage
          if (response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
            console.log('✅ Token guardado en AsyncStorage:', `${response.data.token.substring(0, 20)}...`);
          } else {
            // Si no hay token del backend, crear uno simulado para admin
            const mockToken = createMockAdminToken(response.data.user);
            await AsyncStorage.setItem('authToken', mockToken);
            console.log('✅ Token simulado de admin guardado en AsyncStorage:', `${mockToken.substring(0, 20)}...`);
          }
          
          // Guardar credenciales para uso futuro con PIN/biometría
          await AsyncStorage.setItem('savedCredentials', JSON.stringify({
            email: email,
            password: password
          }));
          
          showToast('Login exitoso', 'success');
        }
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

  const verifyTwoFactor = async (code: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Verificando código 2FA en AuthContext:', code);

      if (!pendingUser) {
        throw new Error('No hay usuario pendiente de verificación');
      }

      // Obtener el tempToken guardado
      const tempToken = await AsyncStorage.getItem('tempToken');
      if (!tempToken) {
        throw new Error('Token temporal no encontrado. Por favor, inicia sesión nuevamente.');
      }

      // Usar el servicio de API real para verificar 2FA
      const response = await apiService.verifyTwoFactor({
        email: pendingUser.email,
        code: code,
        tempToken: tempToken
      });

      if (response.success && response.data) {
        console.log('Verificación 2FA exitosa, estableciendo usuario:', response.data.user);
        console.log('🔍 Usuario del backend después de 2FA:', {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
          name: response.data.user.name
        });
        console.log('🔍 Tipo de rol del backend:', typeof response.data.user.role);
        console.log('🔍 Rol exacto del backend:', JSON.stringify(response.data.user.role));
        setUser(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Guardar el token real del backend
        if (response.data.token) {
          await AsyncStorage.setItem('authToken', response.data.token);
          console.log('✅ Token real guardado en AsyncStorage:', `${response.data.token.substring(0, 20)}...`);
        }
        
        setRequiresTwoFactor(false);
        setPendingUser(null);
        
        // Limpiar el tempToken
        await AsyncStorage.removeItem('tempToken');
        
        showToast('Verificación exitosa. Inicio de sesión completado', 'success');
      } else {
        throw new Error(response.message || 'Código de verificación inválido');
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      const errorMessage = error.message || 'Error en la verificación';
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
        ...userData
        // El rol se asigna por defecto en el backend, no lo forzamos aquí
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

  const loadUserProfile = async () => {
    try {
      if (!user?.id) {
        console.log('No hay usuario logueado, no se pueden cargar datos del perfil');
        return;
      }

      console.log('Cargando perfil del usuario desde el backend...');
      const response = await apiService.getUserProfile();
      
      if (response.success && response.data) {
        console.log('Perfil del usuario cargado desde backend:', response.data);
        
        // Combinar datos del backend con datos locales guardados
        const userProfileKey = `profileData_${user.id}`;
        const savedProfileData = await AsyncStorage.getItem(userProfileKey);
        
        let updatedUser = { ...response.data };
        
        if (savedProfileData) {
          const localData = JSON.parse(savedProfileData);
          console.log('Datos locales encontrados:', localData);
          
          // Combinar datos locales con datos del backend
          updatedUser = {
            ...updatedUser,
            name: localData.name || updatedUser.name,
            email: localData.email || updatedUser.email,
            phone: localData.phone || updatedUser.phone,
            address: localData.address || updatedUser.address,
            avatar: localData.profileImage || updatedUser.avatar,
            location: localData.location || updatedUser.location
          };
          
          console.log('Usuario actualizado con datos locales:', updatedUser);
        }
        
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        showToast('Perfil actualizado desde el servidor', 'success');
      } else {
        console.log('No se pudo cargar el perfil desde el backend:', response.message);
      }
    } catch (error) {
      console.error('Error cargando perfil del usuario:', error);
      showToast('Error cargando perfil del usuario', 'error');
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
    isAuthenticated: !!user, // Usar autenticación normal con servicio mock
    requiresTwoFactor,
    pendingUser,
    login,
    loginWithGoogle,
    verifyTwoFactor,
    register,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    verifyEmail,
    loadUserProfile,
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
