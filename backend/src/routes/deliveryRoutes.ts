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

// Rutas específicas para delivery
router.use(roleMiddleware(['delivery']));

// Estadísticas personales del delivery
router.get('/stats/personal', DeliveryController.getPersonalDeliveryStats);

// Actualizar estado de disponibilidad del delivery
router.put('/status', DeliveryController.updateDeliveryStatus);

// Obtener perfil del delivery
router.get('/profile', DeliveryController.getDeliveryProfile);

// Rutas para gestores de tienda y admin
router.use(roleMiddleware(['store_manager', 'admin']));

// Gestión de deliveries
router.post('/', DeliveryController.createDelivery);
router.get('/', DeliveryController.getDeliveries);
router.get('/stats', DeliveryController.getDeliveryStats);
router.get('/:id', DeliveryController.getDelivery);
router.put('/:id/status', DeliveryController.updateDeliveryStatus);

export default router;
