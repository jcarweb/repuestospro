import express from 'express';
import adminController from '../controllers/AdminController';
import { authenticateToken, requireAdmin } from '../middleware';

const router = express.Router();

// Ruta de prueba simple
router.get('/test', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Ruta de administrador funcionando correctamente',
    user: (req as any).user
  });
});

// Rutas para generación de productos (solo administradores)
router.post('/generate-products', authenticateToken, requireAdmin, adminController.generateProducts);
router.get('/product-stats', authenticateToken, requireAdmin, adminController.getProductStats);

export default router; 