import { Router } from 'express';
import { BrandController } from '../controllers/brandController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/brands', BrandController.getAllBrands);
router.get('/brands/:id', BrandController.getBrandById);

// Rutas protegidas (requieren autenticación y permisos de administrador)
router.post('/brands', authMiddleware, adminMiddleware, BrandController.createBrand);
router.put('/brands/:id', authMiddleware, adminMiddleware, BrandController.updateBrand);
router.delete('/brands/:id', authMiddleware, adminMiddleware, BrandController.deleteBrand);
router.patch('/brands/:id/toggle-status', authMiddleware, adminMiddleware, BrandController.toggleBrandStatus);

export default router; 