import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import passport from 'passport';

const router = Router();

// Rutas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/login/2fa/complete', AuthController.completeLoginWithTwoFactor);
router.post('/login/pin', AuthController.loginWithPin);
router.post('/login/fingerprint', AuthController.loginWithFingerprint);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

// Rutas de Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google/error' }),
  AuthController.googleCallback
);
router.get('/google/error', AuthController.googleAuthError);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware);

router.get('/verify', AuthController.verifyToken);
router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.get('/activity-history', AuthController.getActivityHistory);
router.get('/recent-activity', AuthController.getRecentActivity);

router.post('/setup-pin', AuthController.setupPin);
router.post('/setup-fingerprint', AuthController.setupFingerprint);

// Rutas de 2FA
router.get('/2fa/generate-secret', AuthController.generateTwoFactorSecret);
router.post('/2fa/enable', AuthController.enableTwoFactor);
router.post('/2fa/disable', AuthController.disableTwoFactor);
router.post('/2fa/verify', AuthController.verifyTwoFactorCode);
router.post('/2fa/backup-codes', AuthController.generateNewBackupCodes);

// Rutas de seguridad
router.post('/change-password', AuthController.changePassword);

export default router;