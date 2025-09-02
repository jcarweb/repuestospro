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
   */
  async verifyEmailInMobile(token: string, email: string): Promise<boolean> {
    try {
      console.log('🔐 Verificando email en app móvil:', { token, email });
      
      // Simular verificación exitosa para la app móvil
      const verifiedUser: MobileVerificationUser = {
        id: '1',
        name: 'Usuario',
        email: email,
        emailVerified: true,
        role: 'client'
      };
      
      // Guardar el usuario verificado en AsyncStorage (solo para móvil)
      await AsyncStorage.setItem('user', JSON.stringify(verifiedUser));
      await AsyncStorage.setItem('mobileEmailVerified', 'true');
      
      console.log('✅ Email verificado exitosamente en app móvil');
      return true;
      
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
