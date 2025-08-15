import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id', CategoryController.getCategoryById);

// Rutas protegidas (requieren autenticación y permisos de administrador)
router.post('/categories', authMiddleware, adminMiddleware, CategoryController.createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, CategoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, CategoryController.deleteCategory);
router.patch('/categories/:id/toggle-status', authMiddleware, adminMiddleware, CategoryController.toggleCategoryStatus);

export default router; 