import { Router } from 'express';
import productController, { upload } from '../controllers/productController';
import { authMiddleware, adminMiddleware, storeManagerMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.get('/test', productController.testEndpoint);

// Rutas para todos los usuarios autenticados
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/nearby', productController.getProductsByLocation);
router.get('/:id', productController.getProductById);

// Rutas protegidas para administración
router.use(authMiddleware);

// Rutas para Admin
router.get('/admin/all', adminMiddleware, productController.getAdminProducts);
router.get('/admin/stats', adminMiddleware, productController.getProductStats);
router.post('/admin/create', adminMiddleware, productController.createProduct);
router.put('/admin/:id', adminMiddleware, productController.updateProduct);
router.delete('/admin/:id', adminMiddleware, productController.deleteProduct);
router.post('/admin/import-csv', adminMiddleware, upload.single('csvFile'), productController.importProductsFromCSV);

// Rutas para Store Manager
router.get('/store-manager/all', authMiddleware, storeManagerMiddleware, productController.getStoreManagerProducts);
router.get('/store-manager/stats', authMiddleware, storeManagerMiddleware, productController.getProductStats);
router.post('/store-manager/create', authMiddleware, storeManagerMiddleware, productController.createProduct);
router.put('/store-manager/:id', authMiddleware, storeManagerMiddleware, productController.updateProduct);
router.delete('/store-manager/:id', authMiddleware, storeManagerMiddleware, productController.deleteProduct);
router.post('/store-manager/import-csv', authMiddleware, storeManagerMiddleware, upload.single('csvFile'), productController.importProductsFromCSV);

// Rutas para papelera (productos eliminados)
router.get('/store-manager/trash', authMiddleware, storeManagerMiddleware, productController.getDeletedProducts);
router.put('/store-manager/trash/:id/restore', authMiddleware, storeManagerMiddleware, productController.restoreProduct);
router.delete('/store-manager/trash/:id/permanent', authMiddleware, storeManagerMiddleware, productController.permanentlyDeleteProduct);

export default router; 