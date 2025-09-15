import { api } from '../config/api';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string; // URL de la imagen de perfil
  role: 'admin' | 'client' | 'delivery' | 'store_manager';
  isEmailVerified: boolean;
  isActive: boolean;
  pin?: string;
  fingerprintEnabled: boolean;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  theme: 'light' | 'dark';
  language: 'es' | 'en' | 'pt';
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  pushEnabled: boolean;
  pushToken?: string;
  points: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationEnabled: boolean;
  lastLocationUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface LocationUpdateData {
  latitude: number;
  longitude: number;
  enabled?: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface PinSetupData {
  pin: string;
  currentPassword: string;
}

export interface FingerprintData {
  fingerprintData?: string;
  enabled: boolean;
}

export interface TwoFactorData {
  enabled: boolean;
  code?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
}

export interface PreferencesData {
  theme: 'light' | 'dark';
  language: 'es' | 'en' | 'pt';
}

export interface PushNotificationSettings {
  pushEnabled: boolean;
  pushToken?: string;
}

class ProfileService {
  // Cache para evitar múltiples llamadas simultáneas
  private profileCache: { data: UserProfile | null; timestamp: number; isRealData: boolean } = {
    data: null,
    timestamp: 0,
    isRealData: false
  };
  
  // Cache para evitar múltiples llamadas simultáneas
  private pendingRequest: Promise<UserProfile> | null = null;

  // Obtener perfil del usuario
  async getProfile(): Promise<UserProfile> {
    try {
      // Verificar si hay token válido antes de intentar cargar
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('ProfileService: No hay token, usando datos mock');
        return this.getMockProfile();
      }

      // Verificar cache solo si contiene datos reales
      const now = Date.now();
      if (this.profileCache.data && this.profileCache.isRealData && (now - this.profileCache.timestamp) < 30000) {
        console.log('ProfileService: Usando datos reales del cache');
        return this.profileCache.data;
      }

      // Si hay una petición pendiente, esperar a que termine
      if (this.pendingRequest) {
        return await this.pendingRequest;
      }

      // Crear nueva petición
      this.pendingRequest = this.fetchProfileFromAPI();
      const profileData = await this.pendingRequest;
      this.pendingRequest = null;
      
      return profileData;
    } catch (error: any) {
      this.pendingRequest = null;
      console.error('Error fetching profile:', error);
      
      // Si el error es de conectividad, usar datos mock
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        console.log('ProfileService: Error de conectividad, usando datos mock');
        return this.getMockProfile();
      }
      
      // Si el error es de autenticación (401), limpiar cache y usar datos mock
      if (error.response?.status === 401) {
        console.warn('ProfileService: Token inválido, limpiando cache y usando datos mock');
        this.clearCache();
        return this.getMockProfile();
      }
      
      // Si es un error 429, mostrar mensaje específico
      if (error.response?.status === 429) {
        throw new Error('Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.');
      }
      
      throw error;
    }
  }

  // Método privado para hacer la llamada real al API
  private async fetchProfileFromAPI(): Promise<UserProfile> {
    const response = await api.get('/profile');
    const profileData = response.data.data;
    
    // Actualizar cache con datos reales
    this.profileCache = {
      data: profileData,
      timestamp: Date.now(),
      isRealData: true
    };
    
    console.log('ProfileService: Datos reales cargados desde la base de datos');
    return profileData;
  }

  // Limpiar cache (útil después de actualizaciones)
  clearCache() {
    console.log('ProfileService - Limpiando cache, cache anterior:', this.profileCache);
    this.profileCache = { data: null, timestamp: 0, isRealData: false };
    console.log('ProfileService - Cache limpiado');
  }

  // Forzar recarga de datos reales (ignora cache)
  async forceReloadRealData(): Promise<UserProfile> {
    console.log('ProfileService: Forzando recarga de datos reales...');
    this.clearCache();
    return await this.getProfile();
  }

  // Actualizar información del perfil
  async updateProfile(data: ProfileUpdateData): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await api.put('/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Actualizar ubicación del usuario
  async updateLocation(data: LocationUpdateData): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await api.post('/location/update', data);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  // Obtener ubicación actual del usuario
  async getLocation(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await api.get('/location/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  async changePassword(data: PasswordChangeData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/profile/password', data);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Configurar PIN
  async setPin(data: PinSetupData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/profile/pin', data);
      return response.data;
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw error;
    }
  }

  // Configurar huella digital
  async setFingerprint(data: FingerprintData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/profile/fingerprint', data);
      return response.data;
    } catch (error) {
      console.error('Error setting fingerprint:', error);
      throw error;
    }
  }

  // Configurar autenticación de dos factores
  async setTwoFactor(data: TwoFactorData): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { secret: string; backupCodes: string[]; googleAuthUrl?: string } 
  }> {
    try {
      const response = await api.put('/profile/two-factor', data);
      return response.data;
    } catch (error) {
      console.error('Error setting two factor:', error);
      throw error;
    }
  }

  // Actualizar configuraciones de notificaciones
  async updateNotifications(data: NotificationSettings): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/profile/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }

  // Actualizar configuraciones de privacidad
  async updatePrivacy(data: PrivacySettings): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/profile/privacy', data);
      return response.data;
    } catch (error) {
      console.error('Error updating privacy:', error);
      throw error;
    }
  }

  // Actualizar preferencias de tema e idioma
  async updatePreferences(data: PreferencesData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/profile/preferences', data);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Actualizar configuraciones de notificaciones push
  async updatePushNotifications(data: PushNotificationSettings): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/profile/push-notifications', data);
      return response.data;
    } catch (error) {
      console.error('Error updating push notifications:', error);
      throw error;
    }
  }

  // Subir foto de perfil
  async uploadAvatar(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('ProfileService - Avatar subido, respuesta:', response.data);
      
      // Limpiar caché después de subir avatar
      this.clearCache();
      console.log('ProfileService - Cache limpiado');
      
      return response.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // Eliminar foto de perfil
  async deleteAvatar(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete('/profile/avatar');
      
      // Limpiar caché después de eliminar avatar
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  }

  // Obtener historial de actividades
  async getActivities(limit: number = 20, skip: number = 0): Promise<any[]> {
    try {
      const response = await api.get(`/profile/activities?limit=${limit}&skip=${skip}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Método para obtener datos mock cuando el backend no está disponible
  private getMockProfile(): UserProfile {
    return {
      _id: 'admin-mock-001',
      name: 'Administrador PiezasYA',
      email: 'admin@piezasyaya.com',
      phone: '+584121234567',
      avatar: '/uploads/perfil/default-avatar.svg',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      pin: null,
      fingerprintEnabled: false,
      twoFactorEnabled: false,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      theme: 'light',
      language: 'es',
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      pushEnabled: false,
      pushToken: null,
      points: 1000,
      loyaltyLevel: 'platinum',
      location: null,
      locationEnabled: false,
      lastLocationUpdate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const profileService = new ProfileService();
