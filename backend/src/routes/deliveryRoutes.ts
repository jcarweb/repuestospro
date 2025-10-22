import express from 'express';
import {
  registerDelivery,
  getDelivery,
  updateDelivery,
  updateAvailability,
  getAvailableDeliverys,
  updateDeliveryStatus
} from '../controllers/deliveryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

// Rutas públicas
router.post('/register', registerDelivery);

// Rutas protegidas para deliverys
router.get('/:id', authMiddleware, getDelivery);
router.put('/:id', authMiddleware, updateDelivery);
router.put('/:id/availability', authMiddleware, updateAvailability);

// Rutas para obtener deliverys disponibles (públicas para el sistema de asignación)
router.get('/available/list', getAvailableDeliverys);

// Rutas administrativas
router.put('/:id/status', authMiddleware, roleMiddleware(['admin', 'super_admin']), updateDeliveryStatus);

export default router;