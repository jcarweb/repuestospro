import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import webpush from 'web-push';
import config from '../config/env';

// Configurar web-push con las claves VAPID
webpush.setVapidDetails(
  'mailto:noreply@piezasya.com',
  config.VAPID_PUBLIC_KEY,
  config.VAPID_PRIVATE_KEY
);

class NotificationController {
  // Suscribirse a notificaciones push
  async subscribeToPush(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id;
      const { subscription } = req.body;

      if (!subscription) {
        return res.status(400).json({
          success: false,
          message: 'Suscripción requerida'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Guardar la suscripción en el usuario
      user.pushToken = JSON.stringify(subscription);
      user.pushEnabled = true;
      await user.save();

      res.json({
        success: true,
        message: 'Suscrito a notificaciones push correctamente'
      });
    } catch (error) {
      console.error('Error subscribing to push:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Desuscribirse de notificaciones push
  async unsubscribeFromPush(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Remover la suscripción del usuario
      user.pushToken = undefined;
      user.pushEnabled = false;
      await user.save();

      res.json({
        success: true,
        message: 'Desuscrito de notificaciones push correctamente'
      });
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Enviar notificación push a un usuario específico
  async sendPushToUser(userId: string, notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.pushToken || !user.pushEnabled) {
        return false;
      }

      const subscription = JSON.parse(user.pushToken);
      
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/piezasya.png',
        badge: notification.badge || '/piezasya.png',
        tag: notification.tag || 'piezasya-notification',
        data: notification.data || {},
        actions: notification.actions || []
      });

      await webpush.sendNotification(subscription, payload);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Enviar notificación push a múltiples usuarios
  async sendPushToUsers(userIds: string[], notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendPushToUser(userId, notification))
    );

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    return {
      total: userIds.length,
      successful,
      failed: userIds.length - successful
    };
  }

  // Enviar notificación push a todos los usuarios con push habilitado
  async sendPushToAll(notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }) {
    try {
      const users = await User.find({
        pushEnabled: true,
        pushToken: { $exists: true, $ne: null }
      });

      const userIds = users.map(user => (user as any)._id.toString());
      return await this.sendPushToUsers(userIds, notification);
    } catch (error) {
      console.error('Error sending push to all users:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0
      };
    }
  }

  // Enviar notificación push por rol
  async sendPushByRole(role: string, notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }) {
    try {
      const users = await User.find({
        role,
        pushEnabled: true,
        pushToken: { $exists: true, $ne: null }
      });

      const userIds = users.map(user => (user as any)._id.toString());
      return await this.sendPushToUsers(userIds, notification);
    } catch (error) {
      console.error('Error sending push by role:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0
      };
    }
  }

  // Enviar notificación push por ubicación (usuarios en un radio específico)
  async sendPushByLocation(center: [number, number], radiusKm: number, notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }) {
    try {
      const users = await User.find({
        pushEnabled: true,
        pushToken: { $exists: true, $ne: null },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: center
            },
            $maxDistance: radiusKm * 1000 // Convertir km a metros
          }
        }
      });

      const userIds = users.map(user => (user as any)._id.toString());
      return await this.sendPushToUsers(userIds, notification);
    } catch (error) {
      console.error('Error sending push by location:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0
      };
    }
  }

  // Obtener estadísticas de notificaciones push
  async getPushStats(req: Request, res: Response) {
    try {
      const totalUsers = await User.countDocuments();
      const pushEnabledUsers = await User.countDocuments({
        pushEnabled: true,
        pushToken: { $exists: true, $ne: null }
      });

      const pushStatsByRole = await User.aggregate([
        {
          $match: {
            pushEnabled: true,
            pushToken: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          pushEnabledUsers,
          pushEnabledPercentage: totalUsers > 0 ? (pushEnabledUsers / totalUsers) * 100 : 0,
          byRole: pushStatsByRole
        }
      });
    } catch (error) {
      console.error('Error getting push stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new NotificationController();
