import express from 'express';
import { GoogleAnalyticsController } from '../controllers/googleAnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/status', GoogleAnalyticsController.checkStatus);
router.get('/tracking-code', GoogleAnalyticsController.getTrackingCode);
router.get('/custom-config', GoogleAnalyticsController.getCustomConfiguration);

// Rutas protegidas (requieren autenticación)
router.get('/configuration', authMiddleware, GoogleAnalyticsController.getConfiguration);

// Rutas de administrador (requieren autenticación + rol admin)
router.post('/configuration', authMiddleware, adminMiddleware, GoogleAnalyticsController.updateConfiguration);
router.post('/toggle', authMiddleware, adminMiddleware, GoogleAnalyticsController.toggleAnalytics);

export default router; 