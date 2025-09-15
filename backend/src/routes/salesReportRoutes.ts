import { Router } from 'express';
import { SalesReportController } from '../controllers/SalesReportController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

export function createSalesReportRoutes(): Router {
  const router = Router();
  const salesReportController = new SalesReportController();
  
  // Aplicar middleware de autenticación a todas las rutas
  router.use(authMiddleware);

  // Rutas para gestores de tienda
  router.get('/store', roleMiddleware(['store_manager']), salesReportController.generateSalesReport);
  router.get('/store/quick-metrics', roleMiddleware(['store_manager']), salesReportController.getQuickMetrics);
  router.get('/store/trends', roleMiddleware(['store_manager']), salesReportController.getSalesTrends);
  router.get('/store/top-products', roleMiddleware(['store_manager']), salesReportController.getTopProducts);
  router.get('/store/customer-analytics', roleMiddleware(['store_manager']), salesReportController.getCustomerAnalytics);
  router.get('/store/payment-analytics', roleMiddleware(['store_manager']), salesReportController.getPaymentAnalytics);
  router.get('/store/export', roleMiddleware(['store_manager']), salesReportController.exportReport);

  // Rutas para administradores (acceso global)
  router.get('/admin', roleMiddleware(['admin']), salesReportController.generateSalesReport);
  router.get('/admin/quick-metrics', roleMiddleware(['admin']), salesReportController.getQuickMetrics);
  router.get('/admin/trends', roleMiddleware(['admin']), salesReportController.getSalesTrends);
  router.get('/admin/top-products', roleMiddleware(['admin']), salesReportController.getTopProducts);
  router.get('/admin/customer-analytics', roleMiddleware(['admin']), salesReportController.getCustomerAnalytics);
  router.get('/admin/payment-analytics', roleMiddleware(['admin']), salesReportController.getPaymentAnalytics);
  router.get('/admin/export', roleMiddleware(['admin']), salesReportController.exportReport);

  // Ruta para generar datos de prueba (solo admin)
  router.post('/generate-test-data', roleMiddleware(['admin']), salesReportController.generateTestData);

  // Ruta para generar datos de prueba para gestores de tienda (solo admin)
  router.post('/generate-store-manager-test-data', roleMiddleware(['admin']), salesReportController.generateStoreManagerTestData);

  // Ruta temporal para generar token de prueba (SOLO PARA DESARROLLO)
  router.get('/generate-test-token', salesReportController.generateTestToken);

  return router;
}
