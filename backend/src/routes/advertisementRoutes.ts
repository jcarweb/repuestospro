import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware';
import {
  getAllAdvertisements,
  getAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  changeAdvertisementStatus,
  getAdvertisementStats,
  getActiveAdvertisements,
  recordImpression,
  recordClick,
  getAnalyticsData
} from '../controllers/advertisementController';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas para administradores
router.get('/admin', requireAdmin, getAllAdvertisements);
router.get('/admin/stats', requireAdmin, getAdvertisementStats);
router.get('/admin/analytics', requireAdmin, getAnalyticsData);
router.get('/admin/:id', requireAdmin, getAdvertisementById);
router.post('/admin', requireAdmin, createAdvertisement);
router.put('/admin/:id', requireAdmin, updateAdvertisement);
router.delete('/admin/:id', requireAdmin, deleteAdvertisement);
router.patch('/admin/:id/status', requireAdmin, changeAdvertisementStatus);

// Rutas públicas para obtener publicidades activas (sin autenticación requerida)
router.get('/active', getActiveAdvertisements);

// Rutas para tracking (sin autenticación requerida)
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

export default router;
