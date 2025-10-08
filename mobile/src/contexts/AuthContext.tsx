import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import apiService from '../services/api'; // Usar servicio real de API
// import { forceCorrectNetworkConfig } from '../utils/networkUtils'; // Forzar configuración correcta
import authVerificationService from '../services/authVerification';
import { userPersistenceService } from '../services/userPersistenceService';
import { getBaseURL } from '../config/api';
// import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  pendingUser: User | null;
  savedUser: any | null;
  setUser: (user: User | null) => void;
  setRequiresTwoFactor: (requires: boolean) => void;
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
  loadUserProfile: (forceReload?: boolean) => Promise<void>;
  clearLocalProfileData: () => Promise<void>;
  updateUserAfterProfileEdit: (updatedUserData: any) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
  // Métodos de persistencia
  getSavedUser: () => Promise<any | null>;
  saveUser: (user: any) => Promise<void>;
  clearSavedUser: () => Promise<void>;
  hasSavedUser: () => Promise<boolean>;
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
  const [savedUser, setSavedUser] = useState<any | null>(null);
  // const { showToast } = useToast();

  // Debug: Log cuando cambia el estado del usuario
  useEffect(() => {
    console.log('🔍 AuthContext - Estado del usuario cambió:', user ? `${user.email} (${user.role})` : 'null');
    if (user) {
      console.log('🔍 AuthContext - user.profileImage:', user.profileImage);
      console.log('🔍 AuthContext - user.avatar:', user.avatar);
      console.log('🔍 AuthContext - user keys:', Object.keys(user));
    }
  }, [user]);

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
        console.log('🔍 AuthContext - storedUser en AsyncStorage:', storedUser ? 'existe' : 'null');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('🔍 AuthContext - userData parseado:', userData);
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
          
          // Guardar el tempToken y usuario pendiente para usar en la verificación 2FA
          await AsyncStorage.setItem('tempToken', response.tempToken);
          await AsyncStorage.setItem('pendingUser', JSON.stringify(response.data.user));
          
          showToast('Ingresa el código de 2FA', 'info');
        } else {
          // IMPORTANTE: Guardar también el token en AsyncStorage
          console.log('🔍 response.data completo:', JSON.stringify(response.data, null, 2));
          console.log('🔍 response.data.token existe:', !!response.data.token);
          console.log('🔍 response.data.token valor:', response.data.token);
          console.log('🔍 response.data.token tipo:', typeof response.data.token);
          console.log('🔍 response.data.token longitud:', response.data.token?.length);
          
          if (response.data.token) {
            console.log('🔍 response.data.token existe:', response.data.token);
            await AsyncStorage.setItem('authToken', response.data.token);
            console.log('✅ Token guardado en AsyncStorage:', `${response.data.token.substring(0, 20)}...`);
            
            // Verificar que se guardó correctamente
            const verifyToken = await AsyncStorage.getItem('authToken');
            console.log('🔍 Token verificado en AsyncStorage:', verifyToken ? `${verifyToken.substring(0, 20)}...` : 'null');
            
            // Pequeño delay para asegurar que el token se guarde
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Notificar al apiService que tiene un nuevo token
            await apiService.refreshToken();
            console.log('✅ apiService notificado del nuevo token');
          } else {
            console.log('⚠️ No hay token en response.data.token, creando token simulado');
            // Si no hay token del backend, crear uno simulado para admin
            const mockToken = createMockAdminToken(response.data.user);
            console.log('🔍 Mock token creado:', mockToken);
            await AsyncStorage.setItem('authToken', mockToken);
            console.log('✅ Token simulado de admin guardado en AsyncStorage:', `${mockToken.substring(0, 20)}...`);
            
            // Verificar que se guardó correctamente
            const verifyToken = await AsyncStorage.getItem('authToken');
            console.log('🔍 Token simulado verificado en AsyncStorage:', verifyToken ? `${verifyToken.substring(0, 20)}...` : 'null');
            
            // Pequeño delay para asegurar que el token se guarde
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Notificar al apiService que tiene un nuevo token
            await apiService.refreshToken();
            console.log('✅ apiService notificado del token simulado');
          }
          
          // Intentar cargar y guardar la imagen del perfil localmente
          let finalUser = response.data.user;
          try {
            console.log('🔄 Intentando cargar imagen del perfil...');
            console.log('🔍 Usuario del login:', response.data.user);
            console.log('🔍 ¿Tiene profileImage en login?', !!response.data.user.profileImage);
            
            const profileResponse = await apiService.getUserProfile();
            console.log('🔍 Respuesta de getUserProfile:', profileResponse);
            console.log('🔍 profileResponse.success:', profileResponse.success);
            console.log('🔍 profileResponse.data:', profileResponse.data);
            console.log('🔍 profileResponse.data.profileImage:', profileResponse.data?.profileImage);
            console.log('🔍 profileResponse.data.avatar:', profileResponse.data?.avatar);
            console.log('🔍 profileResponse.data completo:', JSON.stringify(profileResponse.data, null, 2));
            
            if (profileResponse.success && profileResponse.data.profileImage) {
              // Construir la URL completa de la imagen
              const imageUrl = profileResponse.data.profileImage.startsWith('http') 
                ? profileResponse.data.profileImage 
                : `${getBaseURL()}${profileResponse.data.profileImage}`;
              
              finalUser = {
                ...response.data.user,
                profileImage: imageUrl
              };
              console.log('✅ Imagen del perfil cargada y guardada localmente:', imageUrl);
            } else {
              console.log('⚠️ No se pudo cargar imagen del perfil, guardando usuario sin imagen');
              console.log('⚠️ profileResponse.success:', profileResponse.success);
              console.log('⚠️ profileResponse.data:', profileResponse.data);
            }
          } catch (error) {
            console.log('⚠️ Error cargando imagen del perfil, guardando usuario sin imagen:', error);
          }
          
          // Normalizar identificador y establecer usuario final con imagen preservada
          if ((finalUser as any)._id && !(finalUser as any).id) {
            (finalUser as any).id = (finalUser as any)._id;
          }
          console.log('🔍 AuthContext - Estableciendo usuario final:', finalUser);
          console.log('🔍 AuthContext - finalUser.profileImage:', finalUser.profileImage);
          console.log('🔍 AuthContext - finalUser.avatar:', finalUser.avatar);
          console.log('🔍 AuthContext - finalUser completo:', JSON.stringify(finalUser, null, 2));
          setUser(finalUser);
          await AsyncStorage.setItem('user', JSON.stringify(finalUser));
          console.log('✅ Usuario final establecido en AuthContext:', finalUser.name, finalUser.profileImage ? 'con imagen' : 'sin imagen');
          console.log('✅ Usuario guardado en AsyncStorage');
          
          // Verificar que se guardó correctamente
          const savedUserData = await AsyncStorage.getItem('user');
          const parsedUser = JSON.parse(savedUserData || '{}');
          console.log('🔍 AuthContext - Usuario guardado en AsyncStorage:', parsedUser);
          console.log('🔍 AuthContext - parsedUser.profileImage:', parsedUser.profileImage);
          console.log('🔍 AuthContext - parsedUser.avatar:', parsedUser.avatar);
          
          // Guardar credenciales para uso futuro con PIN/biometría
          await AsyncStorage.setItem('savedCredentials', JSON.stringify({
            email: email,
            password: password
          }));
          
          // No sobrescribir con response.data.user para no perder profileImage
          
          // Guardar usuario en persistencia para pantalla simplificada
          await saveUser({
            name: finalUser.name,
            email: finalUser.email,
            avatar: finalUser.profileImage || finalUser.avatar,
            role: finalUser.role,
          });
          
          console.log('✅ Usuario autenticado y guardado:', response.data.user.name);
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
          // Pequeño delay para asegurar que el token se guarde
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Notificar al apiService que tiene un nuevo token
          await apiService.refreshToken();
          console.log('✅ apiService notificado del token real');
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

  const loadUserProfile = async (forceReload = false) => {
    try {
      if (!user?.id) {
        console.log('No hay usuario logueado, no se pueden cargar datos del perfil');
        return;
      }

      console.log('Cargando perfil del usuario desde el backend...');
      const response = await apiService.getUserProfile();
      
      if (response.success && response.data) {
        console.log('Perfil del usuario cargado desde backend:', response.data);
        console.log('📥 Datos específicos del backend:');
        console.log('  - name:', response.data.name);
        console.log('  - email:', response.data.email);
        console.log('  - phone:', response.data.phone);
        console.log('  - address:', response.data.address);
        console.log('  - location:', response.data.location);
        
        let updatedUser = { ...response.data };
        
        // Priorizar datos del backend sobre datos locales
        // Solo usar datos locales como fallback si el backend no tiene esos campos
        if (!forceReload) {
          const userProfileKey = `profileData_${user.id}`;
          const savedProfileData = await AsyncStorage.getItem(userProfileKey);
          
          if (savedProfileData) {
            const localData = JSON.parse(savedProfileData);
            console.log('Datos locales encontrados (usando como fallback):', localData);
            
            // Solo usar datos locales si el backend no tiene esos campos o están vacíos
            updatedUser = {
              ...updatedUser,
              name: updatedUser.name || localData.name,
              email: updatedUser.email || localData.email,
              phone: updatedUser.phone || localData.phone,
              address: updatedUser.address || localData.address,
              avatar: updatedUser.avatar || updatedUser.profileImage || localData.profileImage,
              profileImage: updatedUser.profileImage || updatedUser.avatar || localData.profileImage,
              location: updatedUser.location || localData.location
            };
            
            console.log('Usuario actualizado (backend primero, local como fallback):', updatedUser);
          }
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

  const clearLocalProfileData = async () => {
    try {
      if (!user?.id) {
        console.log('No hay usuario logueado');
        return;
      }

      const userProfileKey = `profileData_${user.id}`;
      await AsyncStorage.removeItem(userProfileKey);
      console.log('✅ Datos locales del perfil eliminados');
      
      // Recargar perfil desde el backend
      await loadUserProfile(true);
    } catch (error) {
      console.error('Error limpiando datos locales:', error);
    }
  };

  const updateUserAfterProfileEdit = async (updatedUserData: any) => {
    try {
      if (!user?.id) {
        console.log('No hay usuario logueado');
        return;
      }

      console.log('🔄 Actualizando usuario después de editar perfil:', updatedUserData);
      
      // Actualizar el usuario con los nuevos datos
      const newUser = {
        ...user,
        ...updatedUserData,
        // Asegurar que la imagen se maneje correctamente
        avatar: updatedUserData.avatar || updatedUserData.profileImage || user.avatar,
        profileImage: updatedUserData.profileImage || updatedUserData.avatar || user.profileImage
      };
      
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      // Limpiar datos locales para forzar recarga desde backend
      const userProfileKey = `profileData_${user.id}`;
      await AsyncStorage.removeItem(userProfileKey);
      
      console.log('✅ Usuario actualizado después de editar perfil');
    } catch (error) {
      console.error('Error actualizando usuario después de editar perfil:', error);
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

  // Métodos de persistencia de usuarios
  const getSavedUser = async () => {
    try {
      const savedUserData = await userPersistenceService.getSavedUser();
      setSavedUser(savedUserData);
      return savedUserData;
    } catch (error) {
      console.error('Error obteniendo usuario guardado:', error);
      return null;
    }
  };

  const saveUser = async (userData: any) => {
    try {
      await userPersistenceService.saveUser(userData);
      setSavedUser(userData);
      console.log('✅ Usuario guardado en persistencia');
    } catch (error) {
      console.error('Error guardando usuario:', error);
      throw error;
    }
  };

  const clearSavedUser = async () => {
    try {
      await userPersistenceService.clearSavedUser();
      setSavedUser(null);
      console.log('✅ Usuario guardado eliminado');
    } catch (error) {
      console.error('Error eliminando usuario guardado:', error);
      throw error;
    }
  };

  const hasSavedUser = async () => {
    try {
      return await userPersistenceService.hasSavedUser();
    } catch (error) {
      console.error('Error verificando usuario guardado:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user, // Usar autenticación normal con servicio mock
    requiresTwoFactor,
    pendingUser,
    savedUser,
    setUser,
    setRequiresTwoFactor,
    login,
    loginWithGoogle,
    verifyTwoFactor,
    register,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    verifyEmail,
    loadUserProfile,
    clearLocalProfileData,
    updateUserAfterProfileEdit,
    logout,
    clearError,
    error,
    // Métodos de persistencia
    getSavedUser,
    saveUser,
    clearSavedUser,
    hasSavedUser,
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
