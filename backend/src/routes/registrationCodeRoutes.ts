import express from 'express';
import { RegistrationCodeController } from '../controllers/registrationCodeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/verify/:code', RegistrationCodeController.verifyCode);

// Rutas protegidas (requieren autenticación)
router.post('/start-registration', RegistrationCodeController.startRegistration);
router.post('/complete-registration', authMiddleware, RegistrationCodeController.completeRegistration);

// Rutas de administrador (requieren autenticación + rol admin)
router.post('/create', authMiddleware, adminMiddleware, RegistrationCodeController.createCode);
router.get('/all', authMiddleware, adminMiddleware, RegistrationCodeController.getAllCodes);
router.get('/stats', authMiddleware, adminMiddleware, RegistrationCodeController.getStats);
router.delete('/revoke/:codeId', authMiddleware, adminMiddleware, RegistrationCodeController.revokeCode);
router.post('/clean-expired', authMiddleware, adminMiddleware, RegistrationCodeController.cleanExpiredCodes);

export default router; 