import { Request, Response } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';

export class LocationController {
  // Actualizar ubicación del usuario
  static async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { latitude, longitude, enabled } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas y deben ser números'
        });
        return;
      }

      // Validar coordenadas
      if (latitude < -90 || latitude > 90) {
        res.status(400).json({
          success: false,
          message: 'Latitud debe estar entre -90 y 90'
        });
        return;
      }

      if (longitude < -180 || longitude > 180) {
        res.status(400).json({
          success: false,
          message: 'Longitud debe estar entre -180 y 180'
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Actualizar ubicación
      user.location = {
        type: 'Point',
        coordinates: [longitude, latitude] // MongoDB usa [longitude, latitude]
      };
      user.locationEnabled = enabled !== undefined ? enabled : true;
      user.lastLocationUpdate = new Date();
      await user.save();

      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'location_update',
        description: 'Ubicación GPS actualizada',
        metadata: { 
          latitude, 
          longitude, 
          enabled: user.locationEnabled,
          ip: req.ip, 
          userAgent: req.get('User-Agent') 
        }
      });

      res.json({
        success: true,
        message: 'Ubicación actualizada exitosamente',
        data: {
          location: user.location,
          locationEnabled: user.locationEnabled,
          lastLocationUpdate: user.lastLocationUpdate
        }
      });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener ubicación actual del usuario
  static async getLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;

      const user = await User.findById(userId).select('location locationEnabled lastLocationUpdate');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          location: user.location,
          locationEnabled: user.locationEnabled,
          lastLocationUpdate: user.lastLocationUpdate
        }
      });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Habilitar/deshabilitar ubicación
  static async toggleLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'El parámetro enabled es requerido y debe ser un booleano'
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      user.locationEnabled = enabled;
      if (!enabled) {
        // Limpiar ubicación si se deshabilita
        user.location = undefined;
        user.lastLocationUpdate = undefined;
      }
      await user.save();

      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: enabled ? 'location_enabled' : 'location_disabled',
        description: enabled ? 'GPS habilitado' : 'GPS deshabilitado',
        metadata: { 
          enabled,
          ip: req.ip, 
          userAgent: req.get('User-Agent') 
        }
      });

      res.json({
        success: true,
        message: enabled ? 'GPS habilitado' : 'GPS deshabilitado',
        data: {
          locationEnabled: user.locationEnabled,
          location: user.location
        }
      });
    } catch (error) {
      console.error('Error cambiando estado de ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar si el usuario tiene ubicación habilitada
  static async checkLocationStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;

      const user = await User.findById(userId).select('locationEnabled location lastLocationUpdate');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          locationEnabled: user.locationEnabled,
          hasLocation: !!user.location,
          lastLocationUpdate: user.lastLocationUpdate
        }
      });
    } catch (error) {
      console.error('Error verificando estado de ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
} 