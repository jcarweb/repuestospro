import express from 'express';
import AnalyticsController from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

// Verificar acceso a analytics
router.get('/check-access', 
  authMiddleware, 
  roleMiddleware(['store_manager', 'admin']), 
  AnalyticsController.checkAnalyticsAccess
);

// Obtener analytics de una tienda específica
router.get('/store/:storeId', 
  authMiddleware, 
  roleMiddleware(['store_manager', 'admin']), 
  AnalyticsController.getStoreAnalytics
);

export default router;
