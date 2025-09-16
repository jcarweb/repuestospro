import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

class ClientNotificationController {
  // Obtener notificaciones del usuario
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { page = 1, limit = 20, category, isRead } = req.query;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Construir filtros
      const filters: any = { userId };
      
      if (category) {
        filters.category = category;
      }
      
      if (isRead !== undefined) {
        filters.isRead = isRead === 'true';
      }
      
      // Solo mostrar notificaciones no archivadas
      filters.isArchived = false;

      const skip = (Number(page) - 1) * Number(limit);
      
      // Obtener notificaciones
      const notifications = await Notification.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      // Contar total de notificaciones
      const total = await Notification.countDocuments(filters);
      
      // Contar notificaciones no leídas
      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
        isArchived: false
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          },
          unreadCount
        }
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener notificaciones no leídas (para el header)
  async getUnreadNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { limit = 10 } = req.query;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const notifications = await (Notification as any).getUnread(userId?.toString() || '', Number(limit));
      const unreadCount = await (Notification as any).countUnread(userId?.toString() || '');

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount
        }
      });
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Marcar notificación como leída
  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { notificationId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const notification = await (Notification as any).markAsRead(notificationId, userId?.toString() || '');
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      // Obtener nuevo conteo de no leídas
      const unreadCount = await (Notification as any).countUnread(userId?.toString() || '');

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: {
          notification,
          unreadCount
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Marcar múltiples notificaciones como leídas
  async markMultipleAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { notificationIds } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
          success: false,
          message: 'IDs de notificaciones requeridos'
        });
      }

      await (Notification as any).markMultipleAsRead(notificationIds, userId?.toString() || '');
      
      // Obtener nuevo conteo de no leídas
      const unreadCount = await (Notification as any).countUnread(userId?.toString() || '');

      res.json({
        success: true,
        message: 'Notificaciones marcadas como leídas',
        data: {
          unreadCount
        }
      });
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      await (Notification as any).markAllAsRead(userId?.toString() || '');

      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        data: {
          unreadCount: 0
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Archivar notificación
  async archiveNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { notificationId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const notification = await (Notification as any).archive(notificationId, userId?.toString() || '');
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación archivada',
        data: {
          notification
        }
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Contar por categoría
      const categoryStats = await Notification.aggregate([
        {
          $match: {
            userId: userId,
            isArchived: false
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            unread: {
              $sum: {
                $cond: ['$isRead', 0, 1]
              }
            }
          }
        }
      ]);

      // Contar por tipo
      const typeStats = await Notification.aggregate([
        {
          $match: {
            userId: userId,
            isArchived: false
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            unread: {
              $sum: {
                $cond: ['$isRead', 0, 1]
              }
            }
          }
        }
      ]);

      // Contar por prioridad
      const priorityStats = await Notification.aggregate([
        {
          $match: {
            userId: userId,
            isArchived: false
          }
        },
        {
          $group: {
            _id: '$priority',
            total: { $sum: 1 },
            unread: {
              $sum: {
                $cond: ['$isRead', 0, 1]
              }
            }
          }
        }
      ]);

      // Totales generales
      const totalNotifications = await Notification.countDocuments({
        userId,
        isArchived: false
      });

      const unreadCount = await (Notification as any).countUnread(userId?.toString() || '');

      res.json({
        success: true,
        data: {
          total: totalNotifications,
          unread: unreadCount,
          read: totalNotifications - unreadCount,
          byCategory: categoryStats,
          byType: typeStats,
          byPriority: priorityStats
        }
      });
    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear notificación de prueba (para desarrollo)
  async createTestNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { type = 'info', category = 'system', priority = 'medium' } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const notification = await (Notification as any).createForUser(userId?.toString() || '', {
        title: 'Notificación de Prueba',
        message: 'Esta es una notificación de prueba para verificar el sistema.',
        type,
        category,
        priority,
        data: {
          url: '/notifications',
          actionUrl: '/profile',
          actionText: 'Ver Perfil'
        },
        metadata: {
          source: 'test',
          trigger: 'manual_test'
        }
      });

      res.json({
        success: true,
        message: 'Notificación de prueba creada',
        data: {
          notification
        }
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new ClientNotificationController();
