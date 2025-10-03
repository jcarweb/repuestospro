import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedUser {
  name: string;
  email: string;
  avatar?: string;
  lastLogin: string;
  role: string;
}

export interface SavedCredentials {
  email: string;
  password: string;
  savedAt: string;
}

class UserPersistenceService {
  private readonly SAVED_USER_KEY = 'savedUser';
  private readonly SAVED_CREDENTIALS_KEY = 'savedCredentials';
  private readonly MAX_SAVED_USERS = 3; // Máximo 3 usuarios guardados

  /**
   * Guardar usuario después del login exitoso
   */
  async saveUser(user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  }): Promise<void> {
    try {
      const savedUser: SavedUser = {
        ...user,
        lastLogin: new Date().toISOString(),
      };

      await AsyncStorage.setItem(this.SAVED_USER_KEY, JSON.stringify(savedUser));
      console.log('✅ Usuario guardado:', savedUser.name);
    } catch (error) {
      console.error('❌ Error guardando usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario guardado
   */
  async getSavedUser(): Promise<SavedUser | null> {
    try {
      const savedUserData = await AsyncStorage.getItem(this.SAVED_USER_KEY);
      if (savedUserData) {
        const user = JSON.parse(savedUserData);
        console.log('👤 Usuario guardado cargado:', user.name);
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Error cargando usuario guardado:', error);
      return null;
    }
  }

  /**
   * Guardar credenciales para autenticación biométrica/PIN
   */
  async saveCredentials(email: string, password: string): Promise<void> {
    try {
      const credentials: SavedCredentials = {
        email,
        password,
        savedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(this.SAVED_CREDENTIALS_KEY, JSON.stringify(credentials));
      console.log('🔐 Credenciales guardadas para:', email);
    } catch (error) {
      console.error('❌ Error guardando credenciales:', error);
      throw error;
    }
  }

  /**
   * Obtener credenciales guardadas
   */
  async getSavedCredentials(): Promise<SavedCredentials | null> {
    try {
      const credentialsData = await AsyncStorage.getItem(this.SAVED_CREDENTIALS_KEY);
      if (credentialsData) {
        const credentials = JSON.parse(credentialsData);
        console.log('🔐 Credenciales cargadas para:', credentials.email);
        return credentials;
      }
      return null;
    } catch (error) {
      console.error('❌ Error cargando credenciales:', error);
      return null;
    }
  }

  /**
   * Limpiar usuario guardado
   */
  async clearSavedUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SAVED_USER_KEY);
      console.log('🗑️ Usuario guardado eliminado');
    } catch (error) {
      console.error('❌ Error eliminando usuario guardado:', error);
      throw error;
    }
  }

  /**
   * Limpiar credenciales guardadas
   */
  async clearSavedCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SAVED_CREDENTIALS_KEY);
      console.log('🗑️ Credenciales eliminadas');
    } catch (error) {
      console.error('❌ Error eliminando credenciales:', error);
      throw error;
    }
  }

  /**
   * Limpiar todos los datos guardados
   */
  async clearAllSavedData(): Promise<void> {
    try {
      await this.clearSavedUser();
      await this.clearSavedCredentials();
      console.log('🗑️ Todos los datos guardados eliminados');
    } catch (error) {
      console.error('❌ Error eliminando datos guardados:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay usuario guardado
   */
  async hasSavedUser(): Promise<boolean> {
    try {
      const savedUser = await this.getSavedUser();
      return savedUser !== null;
    } catch (error) {
      console.error('❌ Error verificando usuario guardado:', error);
      return false;
    }
  }

  /**
   * Verificar si hay credenciales guardadas
   */
  async hasSavedCredentials(): Promise<boolean> {
    try {
      const credentials = await this.getSavedCredentials();
      return credentials !== null;
    } catch (error) {
      console.error('❌ Error verificando credenciales:', error);
      return false;
    }
  }

  /**
   * Obtener información del usuario para mostrar en la pantalla
   */
  async getUserDisplayInfo(): Promise<{
    name: string;
    email: string;
    avatar?: string;
    lastLogin: string;
    role: string;
  } | null> {
    try {
      const savedUser = await this.getSavedUser();
      if (!savedUser) return null;

      return {
        name: savedUser.name,
        email: savedUser.email,
        avatar: savedUser.avatar,
        lastLogin: savedUser.lastLogin,
        role: savedUser.role,
      };
    } catch (error) {
      console.error('❌ Error obteniendo información del usuario:', error);
      return null;
    }
  }

  /**
   * Actualizar información del usuario
   */
  async updateUserInfo(updates: Partial<SavedUser>): Promise<void> {
    try {
      const currentUser = await this.getSavedUser();
      if (!currentUser) {
        throw new Error('No hay usuario guardado para actualizar');
      }

      const updatedUser: SavedUser = {
        ...currentUser,
        ...updates,
        lastLogin: new Date().toISOString(),
      };

      await AsyncStorage.setItem(this.SAVED_USER_KEY, JSON.stringify(updatedUser));
      console.log('✅ Información del usuario actualizada');
    } catch (error) {
      console.error('❌ Error actualizando información del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso
   */
  async getUsageStats(): Promise<{
    lastLogin: string;
    daysSinceLastLogin: number;
    hasCredentials: boolean;
  }> {
    try {
      const savedUser = await this.getSavedUser();
      const hasCredentials = await this.hasSavedCredentials();
      
      if (!savedUser) {
        return {
          lastLogin: '',
          daysSinceLastLogin: 0,
          hasCredentials: false,
        };
      }

      const lastLoginDate = new Date(savedUser.lastLogin);
      const now = new Date();
      const daysSinceLastLogin = Math.floor(
        (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        lastLogin: savedUser.lastLogin,
        daysSinceLastLogin,
        hasCredentials,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        lastLogin: '',
        daysSinceLastLogin: 0,
        hasCredentials: false,
      };
    }
  }
}

export const userPersistenceService = new UserPersistenceService();
