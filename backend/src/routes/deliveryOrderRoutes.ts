import express from 'express';
import {
  assignOrder,
  markPickedUp,
  markInTransit,
  completeDelivery,
  cancelOrder,
  getDeliveryOrders
} from '../controllers/deliveryOrderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Asignar pedido (sistema interno)
router.post('/assign', assignOrder);

// Rutas protegidas para deliverys
router.use(authMiddleware);

// Marcar pedido como recogido
router.put('/:orderId/pickup', markPickedUp);

// Marcar pedido como en tránsito
router.put('/:orderId/transit', markInTransit);

// Completar entrega
router.put('/:orderId/complete', completeDelivery);

// Cancelar pedido
router.put('/:orderId/cancel', cancelOrder);

// Obtener pedidos del delivery
router.get('/delivery/:deliveryId', getDeliveryOrders);

export default router;
