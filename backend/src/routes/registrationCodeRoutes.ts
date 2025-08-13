import express from 'express';
import { RegistrationCodeController } from '../controllers/registrationCodeController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/verify/:code', RegistrationCodeController.verifyCode);

// Rutas de administrador (requieren autenticación + rol admin)
router.post('/create', authMiddleware, adminMiddleware, RegistrationCodeController.createCode);
router.get('/list', authMiddleware, adminMiddleware, RegistrationCodeController.listCodes);
router.get('/stats', authMiddleware, adminMiddleware, RegistrationCodeController.getStats);
router.delete('/revoke/:codeId', authMiddleware, adminMiddleware, RegistrationCodeController.revokeCode);
router.post('/resend/:codeId', authMiddleware, adminMiddleware, RegistrationCodeController.resendCode);
router.get('/by-role/:role', authMiddleware, adminMiddleware, RegistrationCodeController.getCodesByRole);

export default router; 