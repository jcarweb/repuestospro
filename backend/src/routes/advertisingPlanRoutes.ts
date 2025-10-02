import express from 'express';
import {
  getAdvertisingPlans,
  getAdvertisingPlanById,
  createAdvertisingPlan,
  updateAdvertisingPlan,
  deleteAdvertisingPlan,
  toggleAdvertisingPlanStatus,
  getAdvertisingPlanStats,
  getActiveAdvertisingPlans,
  getRecommendedPlans,
  getPopularPlans,
  checkPlanSuitability,
  duplicateAdvertisingPlan
} from '../controllers/advertisingPlanController';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rutas públicas (para tiendas)
router.get('/active', getActiveAdvertisingPlans);
router.get('/recommended', getRecommendedPlans);
router.get('/popular', getPopularPlans);
router.get('/:planId/suitability/:storeId', checkPlanSuitability);

// Rutas protegidas (solo admin)
router.use(adminMiddleware);

// CRUD de planes de publicidad
router.get('/', getAdvertisingPlans);
router.get('/stats', getAdvertisingPlanStats);
router.get('/:id', getAdvertisingPlanById);
router.post('/', createAdvertisingPlan);
router.put('/:id', updateAdvertisingPlan);
router.delete('/:id', deleteAdvertisingPlan);
router.patch('/:id/toggle', toggleAdvertisingPlanStatus);
router.post('/:id/duplicate', duplicateAdvertisingPlan);

export default router;
