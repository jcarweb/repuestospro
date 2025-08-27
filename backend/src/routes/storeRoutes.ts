import { Router } from 'express';
import storeController from '../controllers/storeController';
import { authMiddleware, adminMiddleware, storeManagerMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.get('/stores', storeController.getAllStores);
router.get('/stores/:id', storeController.getStoreById);
router.get('/stores/search/by-division', storeController.searchByAdministrativeDivision);

// Rutas protegidas
router.use(authMiddleware);

// Rutas para todos los usuarios autenticados
router.get('/user/stores', storeController.getUserStores);
router.get('/user/stores/debug', storeController.getUserStoresDebug);
router.get('/user/stores/complete', storeController.getUserStoresComplete);
router.get('/user/stores/test', storeController.testUserStores);
router.get('/stores/branches', storeController.getBranches);
router.post('/stores', storeController.createStore);
router.put('/stores/:id', storeController.updateStore);

// Rutas para gestión de managers (solo owner)
router.post('/stores/:id/managers', storeController.addManager);
router.delete('/stores/:id/managers', storeController.removeManager);

// Rutas para desactivar tienda (solo owner)
router.put('/stores/:id/deactivate', storeController.deactivateStore);

// Rutas para toggle status, establecer principal y eliminar (solo owner)
router.patch('/stores/:id/toggle-status', storeController.toggleStoreStatus);
router.put('/stores/:id/set-main', storeController.setMainStore);
router.delete('/stores/:id', storeController.deleteStore);

// Rutas para admin
router.get('/admin/stores/stats', adminMiddleware, storeController.getStoreStats);

export default router;
