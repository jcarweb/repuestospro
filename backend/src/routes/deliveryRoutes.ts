import express from 'express';
import DeliveryController from '../controllers/DeliveryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

// Rutas públicas (para tracking)
router.get('/tracking/:trackingCode', DeliveryController.getDeliveryTracking);

// Rutas protegidas - Requieren autenticación
router.use(authMiddleware);

// Rutas para todos los usuarios autenticados
router.get('/available-riders', DeliveryController.getAvailableRiders);
router.post('/rate/:id', DeliveryController.rateDelivery);

// Rutas para gestores de tienda y admin
router.use(roleMiddleware(['store_manager', 'admin']));

// Gestión de deliveries
router.post('/', DeliveryController.createDelivery);
router.get('/', DeliveryController.getDeliveries);
router.get('/stats', DeliveryController.getDeliveryStats);
router.get('/:id', DeliveryController.getDelivery);
router.put('/:id/status', DeliveryController.updateDeliveryStatus);
router.put('/:id/assign', DeliveryController.assignDelivery);
router.put('/:id/reassign', DeliveryController.reassignDelivery);
router.put('/:id/cancel', DeliveryController.cancelDelivery);

// Rutas específicas para admin
router.use(roleMiddleware(['admin']));

// Aquí se pueden agregar rutas adicionales específicas para admin
// Por ejemplo: gestión de riders, configuración global, etc.

export default router;
