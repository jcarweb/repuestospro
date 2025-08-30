import express from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middleware/authMiddleware';
import { storeManagerMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ===== STORE MANAGER ENDPOINTS =====

// Obtener estadísticas de reseñas para dashboard
router.get('/stats', storeManagerMiddleware, ReviewController.getReviewStats);

// Obtener reseñas de la tienda del store manager
router.get('/store', storeManagerMiddleware, ReviewController.getStoreReviews);

// Obtener reseñas de un producto específico
router.get('/product/:productId', storeManagerMiddleware, ReviewController.getProductReviews);

// Responder a una reseña
router.post('/:reviewId/reply', storeManagerMiddleware, ReviewController.replyToReview);

// Obtener reseñas pendientes de respuesta
router.get('/pending-replies', storeManagerMiddleware, ReviewController.getPendingReplies);

// ===== CLIENT ENDPOINTS =====

// Marcar reseña como útil
router.post('/:reviewId/helpful', ReviewController.markReviewHelpful);

// Reportar reseña
router.post('/:reviewId/report', ReviewController.reportReview);

export default router;
