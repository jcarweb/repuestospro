import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface SessionData {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: number;
  lastActivity: number;
  deviceInfo: {
    platform: string;
    version: string;
    deviceId: string;
  };
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'token_refresh' | 'suspicious_activity' | 'password_change' | '2fa_enabled' | '2fa_disabled';
  timestamp: number;
  deviceInfo: any;
  location?: {
    latitude: number;
    longitude: number;
  };
  ipAddress?: string;
  userAgent?: string;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionData: SessionData | null = null;
  private readonly SESSION_KEY = 'user_session';
  private readonly SECURITY_EVENTS_KEY = 'security_events';
  private readonly MAX_INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos antes de expirar

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Crear nueva sesión
  async createSession(user: User, token: string, refreshToken?: string): Promise<void> {
    try {
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
      
      this.sessionData = {
        user,
        token,
        refreshToken,
        expiresAt,
        lastActivity: Date.now(),
        deviceInfo: {
          platform: 'mobile',
          version: '1.0.0',
          deviceId: await this.getDeviceId(),
        },
      };

      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(this.sessionData));
      
      // Registrar evento de seguridad
      await this.logSecurityEvent('login', {
        deviceInfo: this.sessionData.deviceInfo,
      });

      console.log('🔐 Sesión creada exitosamente');
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Error al crear la sesión');
    }
  }

  // Obtener sesión actual
  async getCurrentSession(): Promise<SessionData | null> {
    try {
      if (this.sessionData) {
        return this.sessionData;
      }

      const sessionString = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionString) {
        return null;
      }

      this.sessionData = JSON.parse(sessionString);
      
      // Verificar si la sesión ha expirado
      if (this.isSessionExpired()) {
        await this.clearSession();
        return null;
      }

      // Verificar inactividad
      if (this.isSessionInactive()) {
        await this.clearSession();
        return null;
      }

      return this.sessionData;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // Actualizar actividad de la sesión
  async updateActivity(): Promise<void> {
    try {
      if (!this.sessionData) {
        return;
      }

      this.sessionData.lastActivity = Date.now();
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(this.sessionData));
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  // Refrescar token
  async refreshToken(): Promise<string | null> {
    try {
      if (!this.sessionData || !this.sessionData.refreshToken) {
        return null;
      }

      // Simular refresh del token (en implementación real, llamarías al backend)
      const newToken = `new_token_${Date.now()}`;
      const newExpiresAt = Date.now() + (24 * 60 * 60 * 1000);

      this.sessionData.token = newToken;
      this.sessionData.expiresAt = newExpiresAt;
      this.sessionData.lastActivity = Date.now();

      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(this.sessionData));
      
      // Registrar evento de seguridad
      await this.logSecurityEvent('token_refresh', {
        deviceInfo: this.sessionData.deviceInfo,
      });

      console.log('🔄 Token refrescado exitosamente');
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // Limpiar sesión
  async clearSession(): Promise<void> {
    try {
      if (this.sessionData) {
        // Registrar evento de seguridad
        await this.logSecurityEvent('logout', {
          deviceInfo: this.sessionData.deviceInfo,
        });
      }

      this.sessionData = null;
      await AsyncStorage.removeItem(this.SESSION_KEY);
      
      console.log('🔐 Sesión limpiada exitosamente');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Verificar si la sesión ha expirado
  private isSessionExpired(): boolean {
    if (!this.sessionData) {
      return true;
    }

    const now = Date.now();
    const timeUntilExpiry = this.sessionData.expiresAt - now;
    
    // Si el token expira en menos de 5 minutos, intentar refrescar
    if (timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0) {
      this.refreshToken();
    }

    return now >= this.sessionData.expiresAt;
  }

  // Verificar si la sesión está inactiva
  private isSessionInactive(): boolean {
    if (!this.sessionData) {
      return true;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - this.sessionData.lastActivity;
    
    return timeSinceLastActivity > this.MAX_INACTIVITY_TIME;
  }

  // Obtener ID único del dispositivo
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `fallback_device_${Date.now()}`;
    }
  }

  // Registrar evento de seguridad
  async logSecurityEvent(type: SecurityEvent['type'], additionalData: any = {}): Promise<void> {
    try {
      const event: SecurityEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: Date.now(),
        deviceInfo: this.sessionData?.deviceInfo || additionalData.deviceInfo || {},
        ...additionalData,
      };

      // Obtener eventos existentes
      const existingEventsString = await AsyncStorage.getItem(this.SECURITY_EVENTS_KEY);
      const existingEvents: SecurityEvent[] = existingEventsString 
        ? JSON.parse(existingEventsString) 
        : [];

      // Agregar nuevo evento
      existingEvents.push(event);

      // Mantener solo los últimos 100 eventos
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }

      // Guardar eventos
      await AsyncStorage.setItem(this.SECURITY_EVENTS_KEY, JSON.stringify(existingEvents));

      console.log(`🔒 Evento de seguridad registrado: ${type}`);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Obtener eventos de seguridad
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    try {
      const eventsString = await AsyncStorage.getItem(this.SECURITY_EVENTS_KEY);
      return eventsString ? JSON.parse(eventsString) : [];
    } catch (error) {
      console.error('Error getting security events:', error);
      return [];
    }
  }

  // Verificar actividad sospechosa
  async checkSuspiciousActivity(): Promise<boolean> {
    try {
      const events = await this.getSecurityEvents();
      const recentEvents = events.filter(event => 
        Date.now() - event.timestamp < 60 * 60 * 1000 // Última hora
      );

      // Detectar múltiples intentos de login fallidos
      const failedLogins = recentEvents.filter(event => 
        event.type === 'login' && event.deviceInfo?.failed === true
      );

      if (failedLogins.length > 5) {
        await this.logSecurityEvent('suspicious_activity', {
          reason: 'multiple_failed_logins',
          count: failedLogins.length,
        });
        return true;
      }

      // Detectar login desde múltiples dispositivos
      const uniqueDevices = new Set(
        recentEvents
          .filter(event => event.type === 'login')
          .map(event => event.deviceInfo?.deviceId)
      );

      if (uniqueDevices.size > 3) {
        await this.logSecurityEvent('suspicious_activity', {
          reason: 'multiple_devices',
          deviceCount: uniqueDevices.size,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  }

  // Obtener información de la sesión
  getSessionInfo(): {
    isActive: boolean;
    timeUntilExpiry: number;
    timeSinceLastActivity: number;
    deviceInfo: any;
  } {
    if (!this.sessionData) {
      return {
        isActive: false,
        timeUntilExpiry: 0,
        timeSinceLastActivity: 0,
        deviceInfo: null,
      };
    }

    const now = Date.now();
    return {
      isActive: !this.isSessionExpired() && !this.isSessionInactive(),
      timeUntilExpiry: Math.max(0, this.sessionData.expiresAt - now),
      timeSinceLastActivity: now - this.sessionData.lastActivity,
      deviceInfo: this.sessionData.deviceInfo,
    };
  }

  // Forzar logout por seguridad
  async forceLogout(reason: string): Promise<void> {
    try {
      await this.logSecurityEvent('suspicious_activity', {
        reason,
        action: 'force_logout',
      });

      await this.clearSession();
      
      console.log(`🔒 Logout forzado por seguridad: ${reason}`);
    } catch (error) {
      console.error('Error in force logout:', error);
    }
  }
}

export default SessionManager.getInstance();
