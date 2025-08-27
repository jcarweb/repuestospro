import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

export function createOrderRoutes(): Router {
  const router = Router();
  const orderController = new OrderController();

  // Aplicar autenticación a todas las rutas
  router.use(authMiddleware);

  // ===== RUTAS PARA CLIENTES =====
  
  /**
   * @route POST /api/orders
   * @desc Crear nueva orden desde transacción
   * @access Cliente
   */
  router.post('/', 
    roleMiddleware(['client']), 
    orderController.createOrder
  );

  /**
   * @route GET /api/orders/user
   * @desc Obtener órdenes del usuario
   * @access Cliente
   */
  router.get('/user', 
    roleMiddleware(['client']), 
    orderController.getUserOrders
  );

  /**
   * @route GET /api/orders/user/:orderId
   * @desc Obtener orden específica del usuario
   * @access Cliente (solo sus propias órdenes)
   */
  router.get('/user/:orderId', 
    roleMiddleware(['client']), 
    orderController.getOrderById
  );

  /**
   * @route PUT /api/orders/user/:orderId
   * @desc Actualizar orden del usuario (limitado)
   * @access Cliente (solo sus propias órdenes)
   */
  router.put('/user/:orderId', 
    roleMiddleware(['client']), 
    orderController.updateOrder
  );

  /**
   * @route DELETE /api/orders/user/:orderId
   * @desc Cancelar orden del usuario
   * @access Cliente (solo sus propias órdenes)
   */
  router.delete('/user/:orderId', 
    roleMiddleware(['client']), 
    orderController.cancelOrder
  );

  // ===== RUTAS PARA STORE MANAGERS =====
  
  /**
   * @route GET /api/orders/store
   * @desc Obtener órdenes de la tienda
   * @access Store Manager
   */
  router.get('/store', 
    roleMiddleware(['store_manager']), 
    orderController.getStoreOrders
  );

  /**
   * @route GET /api/orders/store/:orderId
   * @desc Obtener orden específica de la tienda
   * @access Store Manager (solo órdenes de su tienda)
   */
  router.get('/store/:orderId', 
    roleMiddleware(['store_manager']), 
    orderController.getOrderById
  );

  /**
   * @route PUT /api/orders/store/:orderId
   * @desc Actualizar orden de la tienda
   * @access Store Manager (solo órdenes de su tienda)
   */
  router.put('/store/:orderId', 
    roleMiddleware(['store_manager']), 
    orderController.updateOrder
  );

  /**
   * @route DELETE /api/orders/store/:orderId
   * @desc Cancelar orden de la tienda
   * @access Store Manager (solo órdenes de su tienda)
   */
  router.delete('/store/:orderId', 
    roleMiddleware(['store_manager']), 
    orderController.cancelOrder
  );

  /**
   * @route POST /api/orders/store/:orderId/assign
   * @desc Asignar orden a un empleado
   * @access Store Manager
   */
  router.post('/store/:orderId/assign', 
    roleMiddleware(['store_manager']), 
    orderController.assignOrder
  );

  /**
   * @route POST /api/orders/store/:orderId/assign-delivery
   * @desc Asignar delivery a una orden
   * @access Store Manager
   */
  router.post('/store/:orderId/assign-delivery', 
    roleMiddleware(['store_manager']), 
    orderController.assignDelivery
  );

  /**
   * @route GET /api/orders/store/stats
   * @desc Obtener estadísticas de órdenes de la tienda
   * @access Store Manager
   */
  router.get('/store/stats', 
    roleMiddleware(['store_manager']), 
    orderController.getOrderStats
  );

  /**
   * @route GET /api/orders/store/status/:status
   * @desc Obtener órdenes por estado
   * @access Store Manager
   */
  router.get('/store/status/:status', 
    roleMiddleware(['store_manager']), 
    orderController.getOrdersByStatus
  );

  /**
   * @route GET /api/orders/store/urgent
   * @desc Obtener órdenes urgentes
   * @access Store Manager
   */
  router.get('/store/urgent', 
    roleMiddleware(['store_manager']), 
    orderController.getUrgentOrders
  );

  /**
   * @route GET /api/orders/store/search
   * @desc Buscar órdenes
   * @access Store Manager
   */
  router.get('/store/search', 
    roleMiddleware(['store_manager']), 
    orderController.searchOrders
  );

  /**
   * @route GET /api/orders/store/export
   * @desc Exportar órdenes
   * @access Store Manager
   */
  router.get('/store/export', 
    roleMiddleware(['store_manager']), 
    orderController.exportOrders
  );

  // ===== RUTAS PARA ADMINISTRADORES =====
  
  /**
   * @route GET /api/orders/admin
   * @desc Obtener todas las órdenes (admin)
   * @access Admin
   */
  router.get('/admin', 
    roleMiddleware(['admin']), 
    orderController.getAllOrders
  );

  /**
   * @route GET /api/orders/admin/:orderId
   * @desc Obtener cualquier orden (admin)
   * @access Admin
   */
  router.get('/admin/:orderId', 
    roleMiddleware(['admin']), 
    orderController.getOrderById
  );

  /**
   * @route PUT /api/orders/admin/:orderId
   * @desc Actualizar cualquier orden (admin)
   * @access Admin
   */
  router.put('/admin/:orderId', 
    roleMiddleware(['admin']), 
    orderController.updateOrder
  );

  /**
   * @route DELETE /api/orders/admin/:orderId
   * @desc Cancelar cualquier orden (admin)
   * @access Admin
   */
  router.delete('/admin/:orderId', 
    roleMiddleware(['admin']), 
    orderController.cancelOrder
  );

  /**
   * @route POST /api/orders/admin/:orderId/assign
   * @desc Asignar orden a un empleado (admin)
   * @access Admin
   */
  router.post('/admin/:orderId/assign', 
    roleMiddleware(['admin']), 
    orderController.assignOrder
  );

  /**
   * @route POST /api/orders/admin/:orderId/assign-delivery
   * @desc Asignar delivery a una orden (admin)
   * @access Admin
   */
  router.post('/admin/:orderId/assign-delivery', 
    roleMiddleware(['admin']), 
    orderController.assignDelivery
  );

  /**
   * @route GET /api/orders/admin/stats
   * @desc Obtener estadísticas globales de órdenes (admin)
   * @access Admin
   */
  router.get('/admin/stats', 
    roleMiddleware(['admin']), 
    orderController.getOrderStats
  );

  /**
   * @route GET /api/orders/admin/status/:status
   * @desc Obtener órdenes por estado (admin)
   * @access Admin
   */
  router.get('/admin/status/:status', 
    roleMiddleware(['admin']), 
    orderController.getOrdersByStatus
  );

  /**
   * @route GET /api/orders/admin/urgent
   * @desc Obtener órdenes urgentes (admin)
   * @access Admin
   */
  router.get('/admin/urgent', 
    roleMiddleware(['admin']), 
    orderController.getUrgentOrders
  );

  /**
   * @route GET /api/orders/admin/search
   * @desc Buscar órdenes (admin)
   * @access Admin
   */
  router.get('/admin/search', 
    roleMiddleware(['admin']), 
    orderController.searchOrders
  );

  /**
   * @route GET /api/orders/admin/export
   * @desc Exportar órdenes (admin)
   * @access Admin
   */
  router.get('/admin/export', 
    roleMiddleware(['admin']), 
    orderController.exportOrders
  );

  // ===== RUTAS PARA DELIVERY =====
  
  /**
   * @route GET /api/orders/delivery
   * @desc Obtener órdenes asignadas al delivery
   * @access Delivery
   */
  router.get('/delivery', 
    roleMiddleware(['delivery']), 
    orderController.getUserOrders
  );

  /**
   * @route GET /api/orders/delivery/:orderId
   * @desc Obtener orden específica asignada al delivery
   * @access Delivery
   */
  router.get('/delivery/:orderId', 
    roleMiddleware(['delivery']), 
    orderController.getOrderById
  );

  /**
   * @route PUT /api/orders/delivery/:orderId
   * @desc Actualizar estado de entrega
   * @access Delivery
   */
  router.put('/delivery/:orderId', 
    roleMiddleware(['delivery']), 
    orderController.updateOrder
  );

  return router;
}
