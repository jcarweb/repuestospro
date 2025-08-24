import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

export function createTransactionRoutes(): Router {
  const router = Router();
  const transactionController = new TransactionController();

  // Aplicar autenticación a todas las rutas
  router.use(authMiddleware);

  // ===== RUTAS PARA CLIENTES =====
  
  /**
   * @route POST /api/transactions
   * @desc Crear nueva transacción (checkout)
   * @access Cliente
   */
  router.post('/', 
    roleMiddleware(['client']), 
    transactionController.createTransaction
  );

  /**
   * @route GET /api/transactions/user
   * @desc Obtener transacciones del usuario
   * @access Cliente
   */
  router.get('/user', 
    roleMiddleware(['client']), 
    transactionController.getUserTransactions
  );

  /**
   * @route GET /api/transactions/:transactionId
   * @desc Obtener transacción específica del usuario
   * @access Cliente (solo sus propias transacciones)
   */
  router.get('/:transactionId', 
    roleMiddleware(['client']), 
    transactionController.getTransactionById
  );

  /**
   * @route PUT /api/transactions/:transactionId/status
   * @desc Actualizar estado de transacción (limitado para clientes)
   * @access Cliente (solo sus propias transacciones)
   */
  router.put('/:transactionId/status', 
    roleMiddleware(['client']), 
    transactionController.updateTransactionStatus
  );

  /**
   * @route DELETE /api/transactions/:transactionId
   * @desc Cancelar transacción
   * @access Cliente (solo sus propias transacciones)
   */
  router.delete('/:transactionId', 
    roleMiddleware(['client']), 
    transactionController.cancelTransaction
  );

  /**
   * @route POST /api/transactions/calculate-summary
   * @desc Calcular resumen de checkout (preview)
   * @access Cliente
   */
  router.post('/calculate-summary', 
    roleMiddleware(['client']), 
    transactionController.calculateCheckoutSummary
  );

  /**
   * @route GET /api/transactions/user/stats
   * @desc Obtener estadísticas de transacciones del usuario
   * @access Cliente
   */
  router.get('/user/stats', 
    roleMiddleware(['client']), 
    transactionController.getTransactionStats
  );

  // ===== RUTAS PARA STORE MANAGERS =====
  
  /**
   * @route GET /api/transactions/store
   * @desc Obtener transacciones de la tienda
   * @access Store Manager
   */
  router.get('/store', 
    roleMiddleware(['store_manager']), 
    transactionController.getStoreTransactions
  );

  /**
   * @route GET /api/transactions/store/:transactionId
   * @desc Obtener transacción específica de la tienda
   * @access Store Manager (solo transacciones de su tienda)
   */
  router.get('/store/:transactionId', 
    roleMiddleware(['store_manager']), 
    transactionController.getTransactionById
  );

  /**
   * @route PUT /api/transactions/store/:transactionId/status
   * @desc Actualizar estado de transacción de la tienda
   * @access Store Manager (solo transacciones de su tienda)
   */
  router.put('/store/:transactionId/status', 
    roleMiddleware(['store_manager']), 
    transactionController.updateTransactionStatus
  );

  /**
   * @route GET /api/transactions/store/stats
   * @desc Obtener estadísticas de transacciones de la tienda
   * @access Store Manager
   */
  router.get('/store/stats', 
    roleMiddleware(['store_manager']), 
    transactionController.getTransactionStats
  );

  // ===== RUTAS PARA ADMINISTRADORES =====
  
  /**
   * @route GET /api/transactions/admin
   * @desc Obtener todas las transacciones (admin)
   * @access Admin
   */
  router.get('/admin', 
    roleMiddleware(['admin']), 
    transactionController.getUserTransactions // Reutilizar método pero con filtros admin
  );

  /**
   * @route GET /api/transactions/admin/:transactionId
   * @desc Obtener cualquier transacción (admin)
   * @access Admin
   */
  router.get('/admin/:transactionId', 
    roleMiddleware(['admin']), 
    transactionController.getTransactionById
  );

  /**
   * @route PUT /api/transactions/admin/:transactionId/status
   * @desc Actualizar estado de cualquier transacción (admin)
   * @access Admin
   */
  router.put('/admin/:transactionId/status', 
    roleMiddleware(['admin']), 
    transactionController.updateTransactionStatus
  );

  /**
   * @route DELETE /api/transactions/admin/:transactionId
   * @desc Cancelar cualquier transacción (admin)
   * @access Admin
   */
  router.delete('/admin/:transactionId', 
    roleMiddleware(['admin']), 
    transactionController.cancelTransaction
  );

  /**
   * @route GET /api/transactions/admin/stats
   * @desc Obtener estadísticas globales de transacciones (admin)
   * @access Admin
   */
  router.get('/admin/stats', 
    roleMiddleware(['admin']), 
    transactionController.getTransactionStats
  );

  return router;
}
