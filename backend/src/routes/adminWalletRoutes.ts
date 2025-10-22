import express from 'express';
import adminWalletController from '../controllers/AdminWalletController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// Middleware de autenticación y autorización para admin
router.use(authenticateToken);
router.use(requireAdmin);

// Obtener todas las Wallets
router.get('/', adminWalletController.getAllWallets);

// Obtener Wallet específica
router.get('/:walletId', adminWalletController.getWalletById);

// Ajuste manual de saldo
router.post('/:walletId/adjustment', adminWalletController.manualAdjustment);

// Revertir transacción
router.post('/transactions/:transactionId/reverse', adminWalletController.reverseTransaction);

// Bloquear/Desbloquear Wallet
router.patch('/:walletId/status', adminWalletController.toggleWalletStatus);

// Obtener estadísticas globales
router.get('/stats/global', adminWalletController.getGlobalStats);

// Exportar datos
router.get('/export/data', adminWalletController.exportWalletData);

export default router;
