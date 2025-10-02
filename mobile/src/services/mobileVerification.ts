import AsyncStorage from '@react-native-async-storage/async-storage';

interface MobileVerificationUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
}

class MobileVerificationService {
  /**
   * Verifica el email en la app móvil sin interferir con la lógica web
   * NOTA: Este método ya no se usa, la verificación se maneja directamente desde el backend
   */
  async verifyEmailInMobile(token: string, email: string): Promise<boolean> {
    try {
      console.log('🔐 Verificando email en app móvil:', { token, email });
      
      // Este método ya no debería usarse, la verificación se maneja desde el backend
      // Mantener solo para compatibilidad pero no hacer nada
      console.log('⚠️ verifyEmailInMobile está deprecado, usar verificación del backend');
      return false;
      
    } catch (error) {
      console.error('❌ Error verificando email en app móvil:', error);
      return false;
    }
  }

  /**
   * Verifica si el email está verificado en la app móvil
   */
  async isEmailVerifiedInMobile(email: string): Promise<boolean> {
    try {
      const userData = await AsyncStorage.getItem('user');
      const mobileVerified = await AsyncStorage.getItem('mobileEmailVerified');
      
      if (userData && mobileVerified === 'true') {
        const user = JSON.parse(userData);
        return user.email === email && user.emailVerified === true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error verificando estado de email en móvil:', error);
      return false;
    }
  }

  /**
   * Limpia los datos de verificación móvil
   */
  async clearMobileVerification(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('mobileEmailVerified');
      console.log('🧹 Datos de verificación móvil limpiados');
    } catch (error) {
      console.error('❌ Error limpiando verificación móvil:', error);
    }
  }
}

export const mobileVerificationService = new MobileVerificationService();
export default mobileVerificationService;
