import express from 'express';
import walletController from '../controllers/WalletController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Obtener información de Wallet
router.get('/:storeId', walletController.getWalletInfo);

// Obtener historial de transacciones
router.get('/:storeId/transactions', walletController.getTransactionHistory);

// Recargar Wallet
router.post('/:storeId/recharge', walletController.rechargeWallet);

// Verificar saldo para pago en efectivo
router.post('/:storeId/check-balance', walletController.checkCashPaymentBalance);

// Bloquear/Desbloquear pagos en efectivo
router.patch('/:storeId/cash-payments', walletController.toggleCashPayments);

// Obtener configuraciones de Wallet
router.get('/:storeId/settings', walletController.getWalletSettings);

// Actualizar configuraciones de Wallet
router.put('/:storeId/settings', walletController.updateWalletSettings);

// Obtener estadísticas de Wallet
router.get('/:storeId/stats', walletController.getWalletStats);

export default router;
