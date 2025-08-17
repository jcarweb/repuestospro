import express from 'express';
import multer from 'multer';
import path from 'path';
import { LoyaltyController } from '../controllers/loyaltyController';
import { authMiddleware } from '../middleware/authMiddleware';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads/rewards/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Estadísticas de fidelización
router.get('/stats', LoyaltyController.getLoyaltyStats);

// Premios disponibles (cliente)
router.get('/available-rewards', LoyaltyController.getAvailableRewards);

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

// ===== ADMIN ENDPOINTS =====

// Premios (admin)
router.get('/rewards', LoyaltyController.getAllRewards);
router.post('/rewards', upload.single('image'), LoyaltyController.createReward);
router.put('/rewards/:rewardId', upload.single('image'), LoyaltyController.updateReward);

// Canjes (admin)
router.get('/redemptions', LoyaltyController.getAllRedemptions);
router.put('/redemptions/:redemptionId/status', LoyaltyController.updateRedemptionStatus);
router.put('/redemptions/:redemptionId/tracking', LoyaltyController.updateRedemptionTracking);

// Políticas de puntos (admin)
router.get('/policies', LoyaltyController.getPointsPolicies);
router.put('/policies', LoyaltyController.updatePointsPolicies);

// Estadísticas detalladas (admin)
router.get('/admin/stats', LoyaltyController.getAdminStats);

export default router; 