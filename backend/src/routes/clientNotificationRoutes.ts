import express from 'express';
import clientNotificationController from '../controllers/clientNotificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener notificaciones del usuario
router.get('/', clientNotificationController.getNotifications);

// Obtener notificaciones no leídas (para el header)
router.get('/unread', clientNotificationController.getUnreadNotifications);

// Obtener estadísticas de notificaciones
router.get('/stats', clientNotificationController.getNotificationStats);

// Marcar notificación como leída
router.patch('/:notificationId/read', clientNotificationController.markAsRead);

// Marcar múltiples notificaciones como leídas
router.patch('/mark-multiple-read', clientNotificationController.markMultipleAsRead);

// Marcar todas las notificaciones como leídas
router.patch('/mark-all-read', clientNotificationController.markAllAsRead);

// Archivar notificación
router.patch('/:notificationId/archive', clientNotificationController.archiveNotification);

// Crear notificación de prueba (solo para desarrollo)
router.post('/test', clientNotificationController.createTestNotification);

export default router;
