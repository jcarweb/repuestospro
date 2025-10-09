import express from 'express';
import { Request, Response } from 'express';
import AdminController from '../controllers/AdminController';
import { authMiddleware as authenticateToken, adminMiddleware as requireAdmin } from '../middleware/authMiddleware';
import { storePhotoUpload } from '../config/cloudinary';
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

// Obtener todos los productos para admin
router.get('/products/all', AdminController.getAllProducts);

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
router.delete('/clean-test-data', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
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
      res.json({
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

// ===== GESTIÓN DE ÓRDENES =====

// Obtener todas las órdenes
router.get('/orders', AdminController.getOrders);

// Obtener estadísticas de órdenes
router.get('/orders/stats', AdminController.getOrderStats);

// Actualizar estado de orden
router.put('/orders/:orderId/status', AdminController.updateOrderStatus);

// ===== ESTADÍSTICAS Y REPORTES =====

// Obtener estadísticas generales del dashboard
router.get('/dashboard-stats', AdminController.getDashboardStats);

// Obtener estadísticas de tiendas
router.get('/store-stats', AdminController.getStoreStats);

// Obtener reportes detallados
router.get('/reports', AdminController.getReports);

// ===== CONFIGURACIÓN DEL SISTEMA =====

// Obtener configuraciones del sistema
router.get('/settings', AdminController.getSystemSettings);

// Actualizar configuración del sistema
router.put('/settings', AdminController.updateSystemSettings);

// ===== SISTEMA DE ENRIQUECIMIENTO =====

// Subir foto de tienda con GPS
router.post('/upload-store-photo', storePhotoUpload.single('image'), AdminController.uploadStorePhoto);

// Obtener fotos de tiendas
router.get('/store-photos', AdminController.getStorePhotos);

// Obtener estadísticas de fotos de tiendas
router.get('/store-photos/stats', AdminController.getStorePhotosStats);

// Ejecutar proceso de enriquecimiento
router.post('/run-enrichment', AdminController.runEnrichment);

// Eliminar foto de tienda
router.delete('/store-photos/:id', AdminController.deleteStorePhoto);

// Probar configuración de Cloudinary
router.get('/test-cloudinary', AdminController.testCloudinaryConfig);

// Endpoint de prueba para diagnosticar problemas
router.post('/test-endpoint', storePhotoUpload.single('image'), AdminController.testEndpoint);

// ===== GESTIÓN DE TIENDAS =====

// Obtener todas las tiendas
router.get('/stores', AdminController.getStores);

// Obtener estadísticas de tiendas
router.get('/stores/stats', AdminController.getStoreStats);

// Crear nueva tienda
router.post('/stores', AdminController.createStore);

// Actualizar tienda
router.put('/stores/:storeId', AdminController.updateStore);

// Eliminar tienda
router.delete('/stores/:storeId', AdminController.deleteStore);

// Cambiar estado de tienda
router.put('/stores/:storeId/toggle-status', AdminController.toggleStoreStatus);

// Obtener propietarios disponibles
router.get('/stores/available-owners', AdminController.getAvailableOwners);

// Obtener managers disponibles
router.get('/stores/available-managers', AdminController.getAvailableManagers);

// Agregar manager a tienda
router.post('/stores/:storeId/managers', AdminController.addManager);

// Remover manager de tienda
router.delete('/stores/:storeId/managers/:managerId', AdminController.removeManager);

// ===== GESTIÓN DE DELIVERY =====

// Obtener repartidores
router.get('/delivery/drivers', AdminController.getDeliveryDrivers);

// Obtener pedidos de delivery
router.get('/delivery/orders', AdminController.getDeliveryOrders);

// Obtener estadísticas de delivery
router.get('/delivery/stats', AdminController.getDeliveryStats);

// Cambiar estado de repartidor
router.put('/delivery/drivers/:driverId/toggle-status', AdminController.toggleDriverStatus);

// Asignar repartidor a pedido
router.put('/delivery/orders/:orderId/assign', AdminController.assignDriver);

// Actualizar estado de pedido de delivery
router.put('/delivery/orders/:orderId/status', AdminController.updateDeliveryOrderStatus);

// ===== CONFIGURACIÓN DE BÚSQUEDA =====

// Obtener configuración de búsqueda
router.get('/search-config', AdminController.getSearchConfig);

// ===== GESTIÓN DE VENDEDORES =====

// Obtener estadísticas del vendedor
router.get('/seller/stats', AdminController.getSellerStats);

// ===== GESTIÓN DE CARRITO =====

// Obtener carrito del usuario
router.get('/cart', AdminController.getCart);

// Agregar producto al carrito
router.post('/cart/add', AdminController.addToCart);

// Actualizar cantidad de producto en el carrito
router.put('/cart/items/:itemId', AdminController.updateCartItem);

// Eliminar producto del carrito
router.delete('/cart/items/:itemId', AdminController.removeFromCart);

// Vaciar carrito
router.delete('/cart/clear', AdminController.clearCart);

// ===== GESTIÓN DE DELIVERY (PARA REPARTIDORES) =====

// Cambiar estado del repartidor (para el propio repartidor)
router.put('/delivery/status', AdminController.updateDeliveryStatus);

// Obtener órdenes asignadas al repartidor
router.get('/delivery/orders', AdminController.getAssignedOrders);

// Obtener reportes del delivery
router.get('/delivery/reports', AdminController.getDeliveryReports);

// Obtener calificaciones del delivery
router.get('/delivery/ratings', AdminController.getDeliveryRatings);

// Obtener configuración del delivery
router.get('/delivery/settings', AdminController.getDeliverySettings);

// Actualizar configuración del delivery
router.put('/delivery/settings', AdminController.updateDeliverySettings);

// Obtener ganancias del delivery
router.get('/delivery/earnings', AdminController.getDeliveryEarnings);

// Guardar firma del cliente para entrega
router.post('/delivery/orders/:orderId/signature', AdminController.saveDeliverySignature);

// Actualizar configuración de búsqueda
router.put('/search-config', AdminController.updateSearchConfig);

// Las estadísticas están disponibles en las rutas específicas:
// - /users/stats para estadísticas de usuarios
// - /products/stats para estadísticas de productos
// - /subscription-stats para estadísticas de suscripciones

export default router; 