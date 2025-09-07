import { Router } from 'express';
import { CryptoAuthController } from '../controllers/cryptoAuthController';
import { cryptoAuthMiddleware } from '../middleware/cryptoAuthMiddleware';

const router = Router();

// Rutas públicas
router.post('/login', CryptoAuthController.login);
router.post('/register', CryptoAuthController.register);
router.get('/verify', CryptoAuthController.verifyToken);

// Rutas protegidas
router.get('/profile', cryptoAuthMiddleware, CryptoAuthController.getProfile);

export default router;
