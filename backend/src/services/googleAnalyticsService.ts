import GoogleAnalytics, { IGoogleAnalytics } from '../models/GoogleAnalytics';
import User from '../models/User';

export class GoogleAnalyticsService {
  // Obtener configuración actual de Google Analytics
  static async getConfiguration(): Promise<IGoogleAnalytics | null> {
    try {
      return await GoogleAnalytics.findOne().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error obteniendo configuración de GA:', error);
      throw error;
    }
  }

  // Crear o actualizar configuración de Google Analytics
  static async updateConfiguration(
    adminId: string,
    measurementId: string,
    propertyId: string,
    trackingCode: string,
    customEvents: any,
    customDimensions: any,
    customMetrics: any
  ): Promise<IGoogleAnalytics> {
    try {
      // Verificar que el usuario sea administrador
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden configurar Google Analytics');
      }

      // Validar formato del Measurement ID
      if (!/^G-[A-Z0-9]{10}$/.test(measurementId)) {
        throw new Error('Measurement ID debe tener el formato G-XXXXXXXXXX');
      }

      // Crear nueva configuración
      const config = new GoogleAnalytics({
        measurementId,
        propertyId,
        trackingCode,
        lastConfiguredBy: adminId,
        lastConfiguredAt: new Date(),
        isConfigured: true,
        isEnabled: true,
        customEvents,
        customDimensions,
        customMetrics
      });

      await config.save();
      return config;
    } catch (error) {
      console.error('Error actualizando configuración de GA:', error);
      throw error;
    }
  }

  // Habilitar/deshabilitar Google Analytics
  static async toggleAnalytics(adminId: string, enabled: boolean): Promise<IGoogleAnalytics> {
    try {
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Solo los administradores pueden modificar Google Analytics');
      }

      const config = await GoogleAnalytics.findOne().sort({ createdAt: -1 });
      if (!config) {
        throw new Error('No hay configuración de Google Analytics');
      }

      config.isEnabled = enabled;
      config.lastConfiguredBy = adminId;
      config.lastConfiguredAt = new Date();
      await config.save();

      return config;
    } catch (error) {
      console.error('Error cambiando estado de GA:', error);
      throw error;
    }
  }

  // Generar código de seguimiento para el frontend
  static async getTrackingCode(): Promise<string | null> {
    try {
      const config = await GoogleAnalytics.findOne({ isEnabled: true, isConfigured: true })
        .sort({ createdAt: -1 });

      if (!config) {
        return null;
      }

      return config.trackingCode;
    } catch (error) {
      console.error('Error obteniendo código de seguimiento:', error);
      return null;
    }
  }

  // Generar código de configuración personalizada para eventos
  static async getCustomConfiguration(): Promise<any | null> {
    try {
      const config = await GoogleAnalytics.findOne({ isEnabled: true, isConfigured: true })
        .sort({ createdAt: -1 });

      if (!config) {
        return null;
      }

      return {
        measurementId: config.measurementId,
        customEvents: config.customEvents,
        customDimensions: config.customDimensions,
        customMetrics: config.customMetrics
      };
    } catch (error) {
      console.error('Error obteniendo configuración personalizada:', error);
      return null;
    }
  }

  // Verificar si Google Analytics está habilitado
  static async isEnabled(): Promise<boolean> {
    try {
      const config = await GoogleAnalytics.findOne({ isEnabled: true, isConfigured: true })
        .sort({ createdAt: -1 });
      return !!config;
    } catch (error) {
      console.error('Error verificando estado de GA:', error);
      return false;
    }
  }

  // Obtener estadísticas de configuración
  static async getConfigurationStats(): Promise<any> {
    try {
      const config = await GoogleAnalytics.findOne().sort({ createdAt: -1 });
      if (!config) {
        return {
          isConfigured: false,
          isEnabled: false,
          lastConfiguredBy: null,
          lastConfiguredAt: null
        };
      }

      const admin = await User.findById(config.lastConfiguredBy);
      
      return {
        isConfigured: config.isConfigured,
        isEnabled: config.isEnabled,
        measurementId: config.measurementId,
        propertyId: config.propertyId,
        lastConfiguredBy: admin ? admin.name : 'Desconocido',
        lastConfiguredAt: config.lastConfiguredAt,
        customEvents: config.customEvents,
        customDimensions: config.customDimensions,
        customMetrics: config.customMetrics
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de GA:', error);
      throw error;
    }
  }
} 