import { Request, Response } from 'express';
import { GoogleAnalyticsService } from '../services/googleAnalyticsService';

export class GoogleAnalyticsController {
  // Obtener configuración actual
  static async getConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const stats = await GoogleAnalyticsService.getConfigurationStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo configuración de GA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuración (solo admin)
  static async updateConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const {
        measurementId,
        propertyId,
        trackingCode,
        customEvents,
        customDimensions,
        customMetrics
      } = req.body;

      if (!measurementId || !propertyId || !trackingCode) {
        res.status(400).json({
          success: false,
          message: 'Measurement ID, Property ID y Tracking Code son requeridos'
        });
        return;
      }

      const config = await GoogleAnalyticsService.updateConfiguration(
        userId.toString(),
        measurementId,
        propertyId,
        trackingCode,
        customEvents || {},
        customDimensions || {},
        customMetrics || {}
      );

      res.json({
        success: true,
        message: 'Configuración de Google Analytics actualizada exitosamente',
        data: {
          measurementId: config.measurementId,
          propertyId: config.propertyId,
          isEnabled: config.isEnabled,
          isConfigured: config.isConfigured,
          lastConfiguredAt: config.lastConfiguredAt
        }
      });
    } catch (error) {
      console.error('Error actualizando configuración de GA:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Habilitar/deshabilitar Google Analytics (solo admin)
  static async toggleAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'El parámetro "enabled" debe ser un booleano'
        });
        return;
      }

      const config = await GoogleAnalyticsService.toggleAnalytics(userId.toString(), enabled);

      res.json({
        success: true,
        message: `Google Analytics ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
        data: {
          isEnabled: config.isEnabled,
          lastConfiguredAt: config.lastConfiguredAt
        }
      });
    } catch (error) {
      console.error('Error cambiando estado de GA:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener código de seguimiento para el frontend
  static async getTrackingCode(req: Request, res: Response): Promise<void> {
    try {
      const trackingCode = await GoogleAnalyticsService.getTrackingCode();
      
      if (!trackingCode) {
        res.status(404).json({
          success: false,
          message: 'Google Analytics no está configurado o habilitado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          trackingCode,
          isEnabled: true
        }
      });
    } catch (error) {
      console.error('Error obteniendo código de seguimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener configuración personalizada para eventos
  static async getCustomConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const config = await GoogleAnalyticsService.getCustomConfiguration();
      
      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Google Analytics no está configurado o habilitado'
        });
        return;
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración personalizada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar si Google Analytics está habilitado
  static async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const isEnabled = await GoogleAnalyticsService.isEnabled();
      
      res.json({
        success: true,
        data: {
          isEnabled
        }
      });
    } catch (error) {
      console.error('Error verificando estado de GA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
} 