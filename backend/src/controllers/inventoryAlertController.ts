import { Request, Response } from 'express';
import InventoryAlert from '../models/InventoryAlert';
import AlertNotification from '../models/AlertNotification';
import ProductInventory from '../models/ProductInventory';
import Product from '../models/Product';
import Store from '../models/Store';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

class InventoryAlertController {
  // Obtener alertas de una tienda
  async getStoreAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10, alertType, isActive } = req.query;

      const query: any = { store: storeId };
      
      if (alertType) {
        query.alertType = alertType;
      }
      
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const alerts = await InventoryAlert.find(query)
        .populate('product', 'name sku category brand')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await InventoryAlert.countDocuments(query);

      res.json({
        success: true,
        data: {
          alerts,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error getting store alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear nueva alerta
  async createAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId, productId, alertType, threshold, notificationSettings } = req.body;
      const userId = req.user?.id;

      // Verificar que la tienda existe y el usuario tiene acceso
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
      }

      // Verificar que el producto existe
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Verificar que no existe una alerta duplicada
      const existingAlert = await InventoryAlert.findOne({
        store: storeId,
        product: productId,
        alertType
      });

      if (existingAlert) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una alerta de este tipo para este producto'
        });
      }

      const alert = new InventoryAlert({
        store: storeId,
        product: productId,
        alertType,
        threshold,
        notificationSettings: notificationSettings || {
          email: true,
          inApp: true,
          sms: false
        },
        createdBy: userId,
        updatedBy: userId
      });

      await alert.save();

      // Poblar la respuesta
      await alert.populate([
        { path: 'product', select: 'name sku category brand' },
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Alerta creada exitosamente',
        data: alert
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar alerta
  async updateAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { alertId } = req.params;
      const { threshold, isActive, notificationSettings } = req.body;
      const userId = req.user?.id;

      const alert = await InventoryAlert.findById(alertId);
      if (!alert) {
        res.status(404).json({
          success: false,
          message: 'Alerta no encontrada'
        });
      }

      if (threshold !== undefined) alert!.threshold = threshold;
      if (isActive !== undefined) alert!.isActive = isActive;
      if (notificationSettings) alert!.notificationSettings = { ...alert!.notificationSettings, ...notificationSettings };
      
      alert!.updatedBy = userId;
      await alert!.save();

      // Poblar la respuesta
      await alert!.populate([
        { path: 'product', select: 'name sku category brand' },
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]);

      res.json({
        success: true,
        message: 'Alerta actualizada exitosamente',
        data: alert
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar alerta
  async deleteAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { alertId } = req.params;

      const alert = await InventoryAlert.findByIdAndDelete(alertId);
      if (!alert) {
        res.status(404).json({
          success: false,
          message: 'Alerta no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Alerta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener notificaciones de alertas
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10, isRead, storeId } = req.query;

      const query: any = { user: userId };
      
      if (isRead !== undefined) {
        query.isRead = isRead === 'true';
      }
      
      if (storeId) {
        query.store = storeId;
      }

      const notifications = await AlertNotification.find(query)
        .populate('product', 'name sku category brand')
        .populate('store', 'name city')
        .populate('alert', 'alertType threshold')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await AlertNotification.countDocuments(query);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
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

  // Marcar notificación como leída
  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { notificationId } = req.params;

      const notification = await AlertNotification.findByIdAndUpdate(
        notificationId,
        { 
          isRead: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar y generar alertas automáticamente
  async checkAndGenerateAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const { storeId } = req.params;
      
      // Obtener todas las alertas activas de la tienda
      const alerts = await InventoryAlert.find({
        store: storeId,
        isActive: true
      }).populate('product', 'name sku');

      const generatedNotifications = [];

      for (const alert of alerts) {
        // Obtener el inventario actual del producto
        const inventory = await ProductInventory.findOne({
          product: alert.product._id,
          store: storeId
        });

        if (!inventory) continue;

        const currentStock = inventory.mainStock.available;
        const shouldTrigger = currentStock <= alert.threshold;

        // Verificar si ya se generó una notificación recientemente (últimas 24 horas)
        const lastNotification = await AlertNotification.findOne({
          alert: alert._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (shouldTrigger && !lastNotification) {
          // Generar notificación
          const notification = new AlertNotification({
            user: alert.createdBy,
            store: storeId,
            product: alert.product._id,
            alert: alert._id,
            type: alert.alertType,
            title: `Alerta de Stock - ${(alert.product as any).name}`,
            message: `El producto ${(alert.product as any).name} (${(alert.product as any).sku}) tiene ${currentStock} unidades disponibles. Umbral: ${alert.threshold}`,
            currentStock,
            threshold: alert.threshold,
            isSent: false
          });

          await notification.save();
          generatedNotifications.push(notification);

          // Actualizar última vez que se activó la alerta
          alert.lastTriggered = new Date();
          await alert.save();
        }
      }

      res.json({
        success: true,
        message: `Se generaron ${generatedNotifications.length} notificaciones`,
        data: generatedNotifications
      });
    } catch (error) {
      console.error('Error checking alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de alertas
  async getAlertStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { storeId } = req.params;

      const stats = await InventoryAlert.aggregate([
        { $match: { store: storeId } },
        {
          $group: {
            _id: '$alertType',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]);

      const notificationStats = await AlertNotification.aggregate([
        { $match: { store: storeId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: ['$isRead', 0, 1] } },
            today: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          alerts: stats,
          notifications: notificationStats[0] || { total: 0, unread: 0, today: 0 }
        }
      });
    } catch (error) {
      console.error('Error getting alert stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new InventoryAlertController();
