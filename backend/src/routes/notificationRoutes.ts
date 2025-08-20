import express from 'express';
import notificationController from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rutas para usuarios autenticados
router.post('/push/subscribe', authMiddleware, notificationController.subscribeToPush);
router.delete('/push/unsubscribe', authMiddleware, notificationController.unsubscribeFromPush);

// Rutas para administradores
router.get('/push/stats', authMiddleware, adminMiddleware, notificationController.getPushStats);

export default router;
