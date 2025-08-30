import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import GOOGLE_CONFIG from '../config/google';

// Configurar WebBrowser para manejar la redirección
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

class GoogleAuthService {
  private request: AuthSession.AuthRequest | null = null;

  constructor() {
    this.createAuthRequest();
  }

  private createAuthRequest() {
    this.request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CONFIG.CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'piezasya',
        path: 'auth',
      }),
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
    });
  }

  async signInWithGoogle(): Promise<GoogleUser | null> {
    try {
      if (!this.request) {
        this.createAuthRequest();
      }

      console.log('🔐 Iniciando autenticación con Google...');
      console.log('📱 Client ID:', GOOGLE_CONFIG.CLIENT_ID);

      // Iniciar la sesión de autenticación
      const result = await this.request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      });

      if (result.type === 'success' && result.params.code) {
        console.log('✅ Código de autorización obtenido');
        
        // Intercambiar el código por tokens
        const tokenResult = await this.exchangeCodeForTokens(result.params.code);
        
        if (tokenResult) {
          // Obtener información del usuario
          const userInfo = await this.getUserInfo(tokenResult.access_token);
          return userInfo;
        }
      } else if (result.type === 'cancel') {
        console.log('❌ Usuario canceló la autenticación');
      } else {
        console.log('❌ Error en la autenticación:', result.type);
      }

      return null;
    } catch (error) {
      console.error('❌ Error en signInWithGoogle:', error);
      return null;
    }
  }

  private async exchangeCodeForTokens(code: string) {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          redirect_uri: AuthSession.makeRedirectUri({
            scheme: 'piezasya',
            path: 'auth',
          }),
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Error al intercambiar código por tokens');
      }

      const tokenData = await tokenResponse.json();
      return tokenData;
    } catch (error) {
      console.error('❌ Error intercambiando código por tokens:', error);
      return null;
    }
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUser | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          given_name: userData.given_name,
          family_name: userData.family_name,
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo información del usuario:', error);
      return null;
    }
  }

  // Método para verificar si la autenticación está disponible
  isAvailable(): boolean {
    return Platform.OS !== 'web' && !!GOOGLE_CONFIG.CLIENT_ID;
  }
}

const googleAuthService = new GoogleAuthService();
export default googleAuthService;
