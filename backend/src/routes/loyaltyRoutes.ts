import express from 'express';
import { LoyaltyController } from '../controllers/loyaltyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Estadísticas de fidelización
router.get('/stats', LoyaltyController.getLoyaltyStats);

// Premios disponibles
router.get('/rewards', LoyaltyController.getAvailableRewards);

// Canjear premio
router.post('/redeem', LoyaltyController.redeemReward);

// Enviar calificación
router.post('/review', LoyaltyController.submitReview);

// Códigos de referido
router.get('/referral-code', LoyaltyController.getReferralCode);
router.post('/verify-referral', LoyaltyController.verifyReferralCode);

// Historial
router.get('/redemption-history', LoyaltyController.getRedemptionHistory);
router.get('/reviews', LoyaltyController.getUserReviews);

// Tracking de referidos
router.post('/track-share', LoyaltyController.trackReferralShare);
router.get('/track-click/:referralCode', LoyaltyController.trackReferralClick);
router.get('/tracking-stats', LoyaltyController.getReferralTrackingStats);

export default router; 