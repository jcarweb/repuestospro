import express from 'express';
import {
  getAllDeliverys,
  getDeliveryStats,
  getDeliverySettings,
  updateDeliverySettings,
  getProfitabilityReport,
  getSystemLogs,
  toggleDeliveryStatus
} from '../controllers/adminDeliveryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'super_admin']));

// Gestión de deliverys
router.get('/deliverys', getAllDeliverys);
router.get('/stats', getDeliveryStats);
router.put('/deliverys/:deliveryId/status', toggleDeliveryStatus);

// Configuración del sistema
router.get('/settings', getDeliverySettings);
router.put('/settings', updateDeliverySettings);

// Reportes
router.get('/reports/profitability', getProfitabilityReport);

// Logs del sistema
router.get('/logs', getSystemLogs);

export default router;
