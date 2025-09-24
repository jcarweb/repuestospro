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

// Órdenes del delivery
router.get('/orders', DeliveryController.getDeliveryOrders);
router.put('/orders/:orderId/status', DeliveryController.updateOrderStatus);

// Ubicaciones y mapa
router.get('/locations', DeliveryController.getDeliveryLocations);

// Reportes
router.get('/reports', DeliveryController.getDeliveryReports);

// Calificaciones
router.get('/ratings', DeliveryController.getDeliveryRatings);

// Horario de trabajo
router.get('/schedule', DeliveryController.getDeliverySchedule);
router.put('/schedule', DeliveryController.updateDeliverySchedule);

// Configuración
router.get('/settings', DeliveryController.getDeliverySettings);
router.put('/settings', DeliveryController.updateDeliverySettings);

// Ubicación en tiempo real
router.get('/location', DeliveryController.getDeliveryLocation);
router.put('/location', DeliveryController.updateDeliveryLocation);

// Ganancias
router.get('/earnings', DeliveryController.getDeliveryEarnings);

// Rutas para gestores de tienda y admin
router.use(roleMiddleware(['store_manager', 'admin']));

// Gestión de deliveries
router.post('/', DeliveryController.createDelivery);
router.get('/', DeliveryController.getDeliveries);
router.get('/stats', DeliveryController.getDeliveryStats);
router.get('/:id', DeliveryController.getDelivery);
router.put('/:id/status', DeliveryController.updateDeliveryStatus);

export default router;
