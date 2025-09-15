import { Router } from 'express';
import { WarrantyController } from '../controllers/WarrantyController';

const createWarrantyRoutes = (): Router => {
  const router = Router();
  const warrantyController = new WarrantyController();

  // Rutas para usuarios (clientes)
  router.get('/user', warrantyController.getUserWarranties);
  router.get('/user/stats', warrantyController.getWarrantyStats);
  router.get('/user/:warrantyId', warrantyController.getWarrantyDetails);
  router.post('/user/create', warrantyController.createWarranty);
  router.post('/user/:warrantyId/activate', warrantyController.activateWarranty);
  router.post('/user/:warrantyId/extend', warrantyController.extendWarranty);
  router.post('/user/:warrantyId/cancel', warrantyController.cancelWarranty);
  router.get('/user/:warrantyId/eligibility', warrantyController.checkClaimEligibility);

  // Rutas para tiendas (store managers)
  router.get('/store/:storeId', warrantyController.getStoreWarranties);
  router.get('/store/:storeId/stats', warrantyController.getWarrantyStats);

  // Rutas para administradores
  router.get('/admin/all', warrantyController.getUserWarranties); // Con filtros adicionales
  router.get('/admin/stats', warrantyController.getWarrantyStats);

  return router;
};

export default createWarrantyRoutes;
