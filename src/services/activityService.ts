import { api } from '../config/api';

export interface Activity {
  _id: string;
  userId: string;
  type: string;
  description: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    device?: string;
    location?: string;
    productId?: string;
    productName?: string;
    quantity?: number;
    total?: number;
    paymentMethod?: string;
    orderId?: string;
  };
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface ActivityStats {
  type: string;
  count: number;
  successCount: number;
}

class ActivityService {
  // Obtener actividades del usuario
  async getUserActivities(limit: number = 50, skip: number = 0): Promise<Activity[]> {
    try {
      const response = await api.get(`/activities/user?limit=${limit}&skip=${skip}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }

  // Obtener estadísticas de actividades
  async getActivityStats(days: number = 30): Promise<ActivityStats[]> {
    try {
      const response = await api.get(`/activities/stats?days=${days}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return [];
    }
  }

  // Crear una nueva actividad (usado internamente por el sistema)
  async createActivity(
    type: string,
    description: string,
    metadata?: any,
    success: boolean = true,
    errorMessage?: string
  ): Promise<Activity | null> {
    try {
      const response = await api.post('/activities', {
        type,
        description,
        metadata,
        success,
        errorMessage
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      return null;
    }
  }

  // Registrar login
  async logLogin(metadata?: any): Promise<void> {
    await this.createActivity(
      'login',
      'Usuario inició sesión',
      metadata,
      true
    );
  }

  // Registrar logout
  async logLogout(): Promise<void> {
    await this.createActivity(
      'logout',
      'Usuario cerró sesión',
      {},
      true
    );
  }

  // Registrar cambio de contraseña
  async logPasswordChange(): Promise<void> {
    await this.createActivity(
      'password_changed',
      'Usuario cambió su contraseña',
      {},
      true
    );
  }

  // Registrar actualización de perfil
  async logProfileUpdate(fields: string[]): Promise<void> {
    await this.createActivity(
      'profile_update',
      `Usuario actualizó su perfil: ${fields.join(', ')}`,
      { updatedFields: fields },
      true
    );
  }

  // Registrar configuración de PIN
  async logPinSetup(): Promise<void> {
    await this.createActivity(
      'pin_setup',
      'Usuario configuró PIN de acceso',
      {},
      true
    );
  }

  // Registrar configuración de huella
  async logFingerprintSetup(): Promise<void> {
    await this.createActivity(
      'fingerprint_setup',
      'Usuario configuró acceso por huella digital',
      {},
      true
    );
  }

  // Registrar habilitación de 2FA
  async logTwoFactorEnabled(): Promise<void> {
    await this.createActivity(
      'two_factor_enabled',
      'Usuario habilitó autenticación de dos factores',
      {},
      true
    );
  }

  // Registrar cambio de configuración
  async logConfigurationChange(setting: string, value: any): Promise<void> {
    await this.createActivity(
      'profile_update',
      `Usuario cambió configuración: ${setting}`,
      { setting, value },
      true
    );
  }
}

export const activityService = new ActivityService();
