import express from 'express';
import inventoryController from '../controllers/inventoryController';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';

// Configuración de multer para archivos CSV
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

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

// Rutas específicas para Admin
router.get('/admin/all', inventoryController.getAdminInventory);
router.get('/admin/stats', inventoryController.getAdminStats);
router.get('/admin/export', inventoryController.exportAdminInventory);
router.post('/admin/import', upload.single('csvFile'), inventoryController.importAdminInventory);

// Rutas específicas para Store Manager
router.get('/store-manager/inventory', inventoryController.getStoreManagerInventory);
router.get('/store-manager/stats/:storeId', inventoryController.getStoreManagerStats);
router.get('/store-manager/movements/:storeId', inventoryController.getStoreManagerMovements);
router.get('/store-manager/export', inventoryController.exportStoreManagerInventory);
router.post('/store-manager/import', upload.single('csvFile'), inventoryController.importStoreManagerInventory);

export default router;
