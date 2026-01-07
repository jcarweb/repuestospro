import { Router } from 'express';
import storeController from '../controllers/storeController';
import { authMiddleware, adminMiddleware, storeManagerMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.get('/stores/:id', storeController.getStoreById);
router.get('/stores/search/by-division', storeController.searchByAdministrativeDivision);
router.get('/stores/managers', storeController.getStoreManagers);

// Ruta para crear tienda (requiere autenticación)
router.post('/stores', authMiddleware, storeController.createStore);

// Rutas protegidas
router.use(authMiddleware);

// Ruta para obtener todas las tiendas (solo para usuarios autenticados)
router.get('/stores', storeController.getAllStores);

// Rutas para todos los usuarios autenticados
router.get('/user/stores', storeController.getUserStores);
router.get('/user/stores/complete', storeController.getUserStoresComplete);
// Endpoints de debug removidos por seguridad
router.get('/stores/branches', storeController.getBranches);
router.put('/stores/:id', storeController.updateStore);

// Rutas para gestión de managers (solo owner)
router.post('/stores/:id/managers', storeController.addManager);
router.delete('/stores/:id/managers', storeController.removeManager);

// Rutas para desactivar tienda (solo owner)
router.put('/stores/:id/deactivate', storeController.deactivateStore);

// Rutas para toggle status (admin, owner o store_manager)
router.patch('/stores/:id/toggle-status', storeController.toggleStoreStatus);
router.put('/stores/:id/set-main', storeController.setMainStore);
router.delete('/stores/:id', storeController.deleteStore);

// Rutas para admin (movidas a adminRoutes.ts)

export default router;
