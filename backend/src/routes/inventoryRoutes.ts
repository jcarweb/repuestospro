import express from 'express';
import inventoryController from '../controllers/inventoryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Configuración de inventario
router.post('/config/:storeId', inventoryController.configureInventory);
router.get('/config/:storeId', inventoryController.getInventoryConfig);
router.get('/configs', inventoryController.getUserInventoryConfigs);
router.post('/clean-duplicates', inventoryController.cleanDuplicateConfigs);

// Gestión de stock
router.post('/stock/:storeId/:productId', inventoryController.updateStock);
router.get('/inventory/:storeId', inventoryController.getStoreInventory);

// Distribución automática
router.post('/distribute/:storeId', inventoryController.distributeStock);

// Transferencias
router.post('/transfers', inventoryController.createTransfer);
router.get('/transfers/:storeId', inventoryController.getTransfers);
router.put('/transfers/:transferId/approve', inventoryController.approveTransfer);
router.put('/transfers/:transferId/complete', inventoryController.completeTransfer);

export default router;
