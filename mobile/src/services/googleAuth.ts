import { Platform } from 'react-native';

class GoogleAuthService {
  isAvailable(): boolean {
    return Platform.OS === 'web' || Platform.OS === 'ios' || Platform.OS === 'android';
  }

  async signInWithGoogle(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Mock implementation - en producción esto se conectaría con Google OAuth
      console.log('Google sign in initiated');
      
      // Simular un delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userInfo = {
        id: 'google_user_id',
        email: 'user@example.com',
        name: 'Usuario Google',
        picture: 'https://example.com/avatar.jpg',
      };

      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Error during Google sign in:', error);
      return { success: false, error: 'Error durante la autenticación con Google' };
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('Google sign out completed');
    } catch (error) {
      console.error('Error during Google sign out:', error);
    }
  }
}

export default new GoogleAuthService();
