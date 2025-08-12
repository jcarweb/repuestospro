import { Router } from 'express';
import productController from '../controllers/ProductController';

const router = Router();

// Rutas públicas para clientes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

export default router; 