import express from 'express';
import { RechargeController } from '../controllers/rechargeController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
// import { upload, handleUploadError } from '../middleware/uploadMiddleware';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas para usuarios
router.post('/:storeId/initiate', RechargeController.createRechargeRequest as express.RequestHandler);
router.get('/user', RechargeController.getUserRechargeRequests as express.RequestHandler);
// router.post('/:rechargeRequestId/proof', upload.single('paymentProof'), handleUploadError, RechargeController.uploadPaymentProof);

// Rutas para administradores
router.get('/admin/pending', 
  requireRole(['admin']), 
  RechargeController.getPendingRecharges as any
);

router.patch('/:rechargeRequestId/validate', 
  requireRole(['admin']), 
  RechargeController.validateRecharge as any
);

export default router;
