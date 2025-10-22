import express from 'express';
import AdminLogisticController from '../controllers/AdminLogisticController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = express.Router();
const adminLogisticController = new AdminLogisticController();

// Todas las rutas requieren autenticación y permisos de administrador
router.use(authenticateToken);
router.use(requireAdmin);

// Configuración del sistema
router.get('/settings', adminLogisticController.getLogisticSettings.bind(adminLogisticController));
router.put('/settings', adminLogisticController.updateLogisticSettings.bind(adminLogisticController));

// Dashboard administrativo
router.get('/dashboard', adminLogisticController.getLogisticDashboard.bind(adminLogisticController));

// Reportes y análisis
router.get('/reports/profitability', adminLogisticController.getProfitabilityReport.bind(adminLogisticController));
router.get('/reports/deliverys', adminLogisticController.getDeliveryStatistics.bind(adminLogisticController));

// Logs y monitoreo
router.get('/logs', adminLogisticController.getSystemLogs.bind(adminLogisticController));

// Exportación de datos
router.get('/export', adminLogisticController.exportSystemData.bind(adminLogisticController));

export default router;
