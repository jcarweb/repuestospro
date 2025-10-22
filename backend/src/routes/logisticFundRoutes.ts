import express from 'express';
import LogisticFundController from '../controllers/LogisticFundController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = express.Router();
const logisticFundController = new LogisticFundController();

// Rutas públicas (con autenticación)
router.get('/status', authenticateToken, logisticFundController.getFundStatus.bind(logisticFundController));
router.get('/transactions', authenticateToken, logisticFundController.getFundTransactions.bind(logisticFundController));
router.get('/metrics', authenticateToken, logisticFundController.getFundMetrics.bind(logisticFundController));

// Rutas para procesamiento de pedidos (sistema interno)
router.post('/contribution', authenticateToken, logisticFundController.processOrderContribution.bind(logisticFundController));
router.post('/payment', authenticateToken, logisticFundController.processDeliveryPayment.bind(logisticFundController));

// Rutas de gobernanza (solo administradores)
router.post('/governance/execute', authenticateToken, requireAdmin, logisticFundController.executeGovernance.bind(logisticFundController));
router.get('/governance/report', authenticateToken, requireAdmin, logisticFundController.getGovernanceReport.bind(logisticFundController));

// Rutas de bonos (solo administradores)
router.post('/bonuses/weekly', authenticateToken, requireAdmin, logisticFundController.processWeeklyBonuses.bind(logisticFundController));
router.post('/bonuses/special', authenticateToken, requireAdmin, logisticFundController.calculateSpecialBonuses.bind(logisticFundController));
router.get('/bonuses/statistics', authenticateToken, requireAdmin, logisticFundController.getBonusStatistics.bind(logisticFundController));

// Ruta de inicialización del sistema (solo administradores)
router.post('/initialize', authenticateToken, requireAdmin, logisticFundController.initializeSystem.bind(logisticFundController));

export default router;
