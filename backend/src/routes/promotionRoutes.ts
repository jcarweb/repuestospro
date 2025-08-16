import express from 'express';
import { PromotionController } from '../controllers/promotionController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware para verificar que el usuario es admin o store_manager
const adminOrStoreManagerMiddleware = (req: any, res: any, next: any) => {
  const user = req.user;
  if (user.role === 'admin' || user.role === 'store_manager') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo administradores y gestores de tienda pueden acceder a esta funcionalidad.'
    });
  }
};

// Rutas protegidas que requieren autenticación y rol específico
router.use(authMiddleware);
router.use(adminOrStoreManagerMiddleware);

// Crear nueva promoción
router.post('/', PromotionController.createPromotion);

// Obtener todas las promociones
router.get('/', PromotionController.getAllPromotions);

// Obtener promoción por ID
router.get('/:id', PromotionController.getPromotionById);

// Actualizar promoción
router.put('/:id', PromotionController.updatePromotion);

// Eliminar promoción
router.delete('/:id', PromotionController.deletePromotion);

// Activar/Desactivar promoción
router.patch('/:id/toggle', PromotionController.togglePromotionStatus);

// Obtener estadísticas de promociones
router.get('/stats/overview', PromotionController.getPromotionStats);

// Obtener productos disponibles para promociones
router.get('/products/available', PromotionController.getAvailableProducts);

// Obtener tiendas disponibles para promociones (solo admin)
router.get('/stores/available', adminMiddleware, PromotionController.getAvailableStores);

// Obtener categorías disponibles para promociones
router.get('/categories/available', PromotionController.getAvailableCategories);

// Calcular precio con promociones para un producto
router.post('/calculate-price/:productId', PromotionController.calculateProductPrice);

// Obtener promociones próximas a expirar
router.get('/expiring/list', PromotionController.getExpiringPromotions);

// Validar promoción para un producto
router.get('/validate/:promotionId/:productId', PromotionController.validatePromotion);

// Incrementar uso de promoción
router.post('/:id/increment-usage', PromotionController.incrementPromotionUsage);

export default router; 