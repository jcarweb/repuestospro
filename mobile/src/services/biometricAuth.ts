import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

class BiometricAuthService {
  /**
   * Verifica si la autenticación biométrica está disponible en el dispositivo
   */
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      console.log('🔐 Biometric Auth - Hardware disponible:', hasHardware);
      console.log('🔐 Biometric Auth - Huella configurada:', isEnrolled);
      
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Obtiene los tipos de autenticación disponibles
   */
  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log('🔐 Tipos de autenticación disponibles:', types);
      return types;
    } catch (error) {
      console.error('❌ Error obteniendo tipos de autenticación:', error);
      return [];
    }
  }

  /**
   * Autentica al usuario usando biometría
   */
  async authenticate(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación biométrica requerida',
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        // Manejar diferentes tipos de errores
        let errorMessage = 'Autenticación fallida';
        
        if (result.error) {
          const errorType = result.error as string;
          switch (errorType) {
            case 'UserCancel':
              errorMessage = 'Autenticación cancelada por el usuario';
              break;
            case 'UserFallback':
              errorMessage = 'Usuario eligió método alternativo';
              break;
            case 'SystemCancel':
              errorMessage = 'Autenticación cancelada por el sistema';
              break;
            case 'AuthenticationFailed':
              errorMessage = 'Autenticación biométrica fallida';
              break;
            case 'PasscodeNotSet':
              errorMessage = 'No se ha configurado un PIN';
              break;
            case 'NotEnrolled':
              errorMessage = 'No hay biometría configurada';
              break;
            case 'NotAvailable':
              errorMessage = 'Biometría no disponible';
              break;
            default:
              errorMessage = 'Error de autenticación';
          }
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return { success: false, error: 'Error durante la autenticación' };
    }
  }

  /**
   * Obtiene información sobre el dispositivo
   */
  async getDeviceInfo() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return {
        hasHardware,
        isEnrolled,
        types,
        platform: Platform.OS,
      };
    } catch (error) {
      console.error('❌ Error obteniendo información del dispositivo:', error);
      return null;
    }
  }
}

export default new BiometricAuthService();
