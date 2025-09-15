import express from 'express';
import inventoryAlertController from '../controllers/inventoryAlertController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para gestores de tienda
router.get('/store/:storeId', inventoryAlertController.getStoreAlerts);
router.post('/store/:storeId', inventoryAlertController.createAlert);
router.put('/:alertId', inventoryAlertController.updateAlert);
router.delete('/:alertId', inventoryAlertController.deleteAlert);

// Rutas para notificaciones
router.get('/notifications', inventoryAlertController.getNotifications);
router.put('/notifications/:notificationId/read', inventoryAlertController.markAsRead);

// Rutas para verificación automática de alertas
router.post('/check/:storeId', inventoryAlertController.checkAndGenerateAlerts);

// Rutas para estadísticas
router.get('/stats/:storeId', inventoryAlertController.getAlertStats);

export default router;
