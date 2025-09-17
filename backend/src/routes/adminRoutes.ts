import express from 'express';
import { AdminController } from '../controllers/adminControllerExport';
import { authMiddleware as authenticateToken, adminMiddleware as requireAdmin } from '../middleware/authMiddleware';
import Store from '../models/Store';
import Product from '../models/Product';

const router = express.Router();

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authenticateToken, requireAdmin);

// ===== GESTIÓN DE USUARIOS =====

// Obtener todos los usuarios
router.get('/users', AdminController.getUsers);

// Obtener usuario por ID
router.get('/users/:id', AdminController.getUser);

// Crear nuevo usuario
router.post('/users', AdminController.createUser);

// Actualizar usuario
router.put('/users/:id', AdminController.updateUser);

// Desactivar usuario
router.patch('/users/:id/deactivate', AdminController.deactivateUser);

// Reactivar usuario
router.patch('/users/:id/reactivate', AdminController.reactivateUser);

// ===== GESTIÓN DE TIENDAS =====

// Generar tiendas de prueba
router.post('/stores/generate', AdminController.generateStores);

// Obtener estadísticas de tiendas
router.get('/stores/stats', AdminController.getStoreStats);

// ===== GESTIÓN DE SUSCRIPCIONES DE TIENDAS =====

// Obtener todas las tiendas con sus suscripciones
router.get('/store-subscriptions', AdminController.getStoreSubscriptions);

// Asignar suscripción a una tienda
router.put('/store-subscriptions/:storeId/assign', AdminController.assignSubscriptionToStore);

// Actualizar estado de suscripción de una tienda
router.put('/store-subscriptions/:storeId/status', AdminController.updateStoreSubscriptionStatus);

// Obtener estadísticas de suscripciones
router.get('/subscription-stats', AdminController.getSubscriptionStats);

// Obtener tiendas que necesitan renovación
router.get('/stores-needing-renewal', AdminController.getStoresNeedingRenewal);

// ===== GESTIÓN DE PRODUCTOS =====

// Generar productos de prueba
router.post('/products/generate', AdminController.generateProducts);

// Regenerar productos con imágenes reales (método de prueba)
router.post('/products/regenerate-images', AdminController.regenerateProductsWithRealImages);

// Buscar productos por ubicación
router.get('/products/by-location', AdminController.findProductsByLocation);

// Obtener estadísticas de productos
router.get('/products/stats', AdminController.getProductStats);

// ===== GESTIÓN DE CLOUDINARY =====

// Limpiar todas las imágenes de productos de prueba
router.delete('/cloudinary/cleanup-all-images', AdminController.cleanupAllTestImages);

// Limpiar carpeta específica de Cloudinary
router.delete('/cloudinary/cleanup-folder', AdminController.cleanupCloudinaryFolder);

// Obtener estadísticas de uso de Cloudinary
router.get('/cloudinary/stats', AdminController.getCloudinaryStats);

// ===== GESTIÓN DE USUARIOS ADICIONALES =====

// Obtener estadísticas de usuarios
router.get('/users/stats', AdminController.getUserStats);

// Resetear contraseña de usuario
router.post('/users/:id/reset-password', AdminController.resetUserPassword);

// Verificar configuración de email
router.get('/email-config', AdminController.checkEmailConfig);

// Endpoint para limpiar datos de prueba
router.delete('/clean-test-data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testStoreNames = [
      'AutoParts Express',
      'Mega Repuestos', 
      'Super Auto Parts',
      'Elite Repuestos',
      'Premium Auto Parts'
    ];

    // Buscar tiendas de prueba
    const testStores = await Store.find({ name: { $in: testStoreNames } });
    const testStoreIds = testStores.map(store => store._id);

    if (testStoreIds.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron tiendas de prueba para eliminar',
        deletedStores: 0,
        deletedProducts: 0
      });
    }

    // Eliminar productos de estas tiendas
    const deletedProducts = await Product.deleteMany({ store: { $in: testStoreIds } });
    
    // Eliminar las tiendas de prueba
    const deletedStores = await Store.deleteMany({ _id: { $in: testStoreIds } });

    // Obtener tiendas restantes
    const remainingStores = await Store.find({}).select('name city state isActive');

    res.json({
      success: true,
      message: 'Datos de prueba eliminados exitosamente',
      deletedStores: deletedStores.deletedCount,
      deletedProducts: deletedProducts.deletedCount,
      remainingStores: remainingStores
    });

  } catch (error) {
    console.error('Error limpiando datos de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al limpiar datos de prueba'
    });
  }
});

// ===== ESTADÍSTICAS Y REPORTES =====

// Obtener estadísticas generales del dashboard
router.get('/dashboard-stats', AdminController.getDashboardStats);

// Obtener estadísticas de tiendas
router.get('/store-stats', AdminController.getStoreStats);

// Las estadísticas están disponibles en las rutas específicas:
// - /users/stats para estadísticas de usuarios
// - /products/stats para estadísticas de productos
// - /subscription-stats para estadísticas de suscripciones

export default router; 