import { Router } from 'express';
import masterController from '../controllers/masterController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación y rol de Admin
router.use(authMiddleware);
router.use(adminMiddleware);

// ===== VEHICLE TYPES =====
router.get('/vehicle-types', masterController.getVehicleTypes);
router.post('/vehicle-types', masterController.createVehicleType);
router.put('/vehicle-types/:id', masterController.updateVehicleType);
router.delete('/vehicle-types/:id', masterController.deleteVehicleType);

// ===== BRANDS =====
router.get('/brands', masterController.getBrands);
router.post('/brands', masterController.createBrand);
router.put('/brands/:id', masterController.updateBrand);
router.delete('/brands/:id', masterController.deleteBrand);

// ===== CATEGORIES =====
router.get('/categories', masterController.getCategories);
router.post('/categories', masterController.createCategory);
router.put('/categories/:id', masterController.updateCategory);
router.delete('/categories/:id', masterController.deleteCategory);

// ===== SUBCATEGORIES =====
router.get('/subcategories', masterController.getSubcategories);
router.post('/subcategories', masterController.createSubcategory);
router.put('/subcategories/:id', masterController.updateSubcategory);
router.delete('/subcategories/:id', masterController.deleteSubcategory);

export default router;
