import express from 'express';
import {
  getWallet,
  getTransactionHistory,
  requestWithdrawal,
  getWalletStats
} from '../controllers/deliveryWalletController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener información de la wallet
router.get('/:deliveryId', getWallet);

// Obtener historial de transacciones
router.get('/:deliveryId/transactions', getTransactionHistory);

// Solicitar retiro de fondos
router.post('/:deliveryId/withdraw', requestWithdrawal);

// Obtener estadísticas de la wallet
router.get('/:deliveryId/stats', getWalletStats);

export default router;
