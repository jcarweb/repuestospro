import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface AuthVerificationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface UserAuthSettings {
  emailVerified: boolean;
  gpsRequired: boolean;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  pinEnabled: boolean;
  pin?: string;
}

class AuthVerificationService {
  private readonly STORAGE_KEYS = {
    USER_AUTH_SETTINGS: 'user_auth_settings',
    USER_PIN: 'user_pin',
    BIOMETRIC_ENABLED: 'biometric_enabled',
  };

  /**
   * Verifica el email usando un token de verificación
   */
  async verifyEmail(token: string): Promise<AuthVerificationResult> {
    try {
      const response = await fetch('http://192.168.31.122:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success,
          error: data.success ? undefined : data.message || 'Error al verificar email',
          data: data,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Error al verificar email',
        };
      }
    } catch (error) {
      console.error('❌ Error verificando email:', error);
      return {
        success: false,
        error: 'Error de conexión al verificar email',
      };
    }
  }

  /**
   * Verifica si el email del usuario está verificado
   */
  async checkEmailVerification(userEmail: string): Promise<AuthVerificationResult> {
    try {
      // Aquí deberías hacer una llamada al backend para verificar el estado del email
      // Por ahora, simulamos la verificación
      const response = await fetch('http://192.168.31.122:5000/api/auth/check-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.verified,
          error: data.verified ? undefined : 'Email no verificado',
          data: data,
        };
      } else {
        return {
          success: false,
          error: 'Error verificando email',
        };
      }
    } catch (error) {
      console.error('❌ Error verificando email:', error);
      return {
        success: false,
        error: 'Error de conexión al verificar email',
      };
    }
  }

  /**
   * Verifica si el GPS está habilitado y obtiene la ubicación
   */
  async checkGPSLocation(): Promise<AuthVerificationResult> {
    try {
      // Verificar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return {
          success: false,
          error: 'Se requieren permisos de ubicación para continuar',
        };
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      if (location) {
        return {
          success: true,
          data: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          },
        };
      } else {
        return {
          success: false,
          error: 'No se pudo obtener la ubicación',
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      return {
        success: false,
        error: 'Error al obtener la ubicación GPS',
      };
    }
  }

  /**
   * Verifica el código de doble factor de autenticación
   */
  async verifyTwoFactorCode(code: string, userEmail: string): Promise<AuthVerificationResult> {
    try {
      const response = await fetch('http://192.168.31.122:5000/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          code: code,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.valid,
          error: data.valid ? undefined : 'Código inválido',
          data: data,
        };
      } else {
        return {
          success: false,
          error: 'Error verificando código 2FA',
        };
      }
    } catch (error) {
      console.error('❌ Error verificando 2FA:', error);
      return {
        success: false,
        error: 'Error de conexión al verificar 2FA',
      };
    }
  }

  /**
   * Verifica el PIN del usuario
   */
  async verifyPIN(pin: string): Promise<AuthVerificationResult> {
    try {
      const storedPin = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PIN);
      
      if (!storedPin) {
        return {
          success: false,
          error: 'PIN no configurado',
        };
      }

      const isValid = pin === storedPin;
      
      return {
        success: isValid,
        error: isValid ? undefined : 'PIN incorrecto',
      };
    } catch (error) {
      console.error('❌ Error verificando PIN:', error);
      return {
        success: false,
        error: 'Error al verificar PIN',
      };
    }
  }

  /**
   * Guarda el PIN del usuario
   */
  async savePIN(pin: string): Promise<AuthVerificationResult> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_PIN, pin);
      return { success: true };
    } catch (error) {
      console.error('❌ Error guardando PIN:', error);
      return {
        success: false,
        error: 'Error al guardar PIN',
      };
    }
  }

  /**
   * Obtiene la configuración de autenticación del usuario
   */
  async getUserAuthSettings(userEmail: string): Promise<UserAuthSettings> {
    try {
      const response = await fetch('http://192.168.31.122:5000/api/auth/user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.settings;
      } else {
        // Configuración por defecto
        return {
          emailVerified: false,
          gpsRequired: false,
          biometricEnabled: false,
          twoFactorEnabled: false,
          pinEnabled: false,
        };
      }
    } catch (error) {
      console.error('❌ Error obteniendo configuración de usuario:', error);
      return {
        emailVerified: false,
        gpsRequired: false,
        biometricEnabled: false,
        twoFactorEnabled: false,
        pinEnabled: false,
      };
    }
  }

  /**
   * Verifica si la autenticación biométrica está habilitada
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('❌ Error verificando biometría:', error);
      return false;
    }
  }

  /**
   * Habilita o deshabilita la autenticación biométrica
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('❌ Error configurando biometría:', error);
    }
  }

  /**
   * Solicita permisos de ubicación
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permisos de ubicación:', error);
      return false;
    }
  }
}

const authVerificationService = new AuthVerificationService();
export default authVerificationService;
