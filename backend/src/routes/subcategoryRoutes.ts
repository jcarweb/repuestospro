import { Router } from 'express';
import { SubcategoryController } from '../controllers/subcategoryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/subcategories', SubcategoryController.getAllSubcategories);
router.get('/subcategories/:id', SubcategoryController.getSubcategoryById);

// Rutas protegidas (requieren autenticación y permisos de administrador)
router.post('/subcategories', authMiddleware, adminMiddleware, SubcategoryController.createSubcategory);
router.put('/subcategories/:id', authMiddleware, adminMiddleware, SubcategoryController.updateSubcategory);
router.delete('/subcategories/:id', authMiddleware, adminMiddleware, SubcategoryController.deleteSubcategory);
router.patch('/subcategories/:id/toggle-status', authMiddleware, adminMiddleware, SubcategoryController.toggleSubcategoryStatus);

export default router; 