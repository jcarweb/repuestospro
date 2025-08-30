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
      console.error('❌ Error verificando disponibilidad biométrica:', error);
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
  async authenticate(): Promise<BiometricResult> {
    try {
      console.log('🔐 Iniciando autenticación biométrica...');
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentícate con tu huella dactilar',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      console.log('🔐 Resultado de autenticación biométrica:', result);

      if (result.success) {
        return { success: true };
      } else {
        let errorMessage = 'Autenticación cancelada';
        
        if (result.error === 'UserCancel') {
          errorMessage = 'Autenticación cancelada por el usuario';
        } else if (result.error === 'UserFallback') {
          errorMessage = 'Usuario eligió usar contraseña';
        } else if (result.error === 'SystemCancel') {
          errorMessage = 'Autenticación cancelada por el sistema';
        } else if (result.error === 'AuthenticationFailed') {
          errorMessage = 'Autenticación fallida';
        } else if (result.error === 'PasscodeNotSet') {
          errorMessage = 'No hay código de acceso configurado';
        } else if (result.error === 'NotEnrolled') {
          errorMessage = 'No hay huellas dactilares registradas';
        } else if (result.error === 'NotAvailable') {
          errorMessage = 'Autenticación biométrica no disponible';
        }

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Error en autenticación biométrica:', error);
      return { 
        success: false, 
        error: 'Error inesperado en la autenticación biométrica' 
      };
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

const biometricAuthService = new BiometricAuthService();
export default biometricAuthService;
