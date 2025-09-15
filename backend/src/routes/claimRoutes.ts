import { Router } from 'express';
import { ClaimController } from '../controllers/ClaimController';

const createClaimRoutes = (): Router => {
  const router = Router();
  const claimController = new ClaimController();

  // Rutas para usuarios (clientes)
  router.get('/user', claimController.getUserClaims);
  router.get('/user/stats', claimController.getClaimStats);
  router.get('/user/:claimId', claimController.getClaimDetails);
  router.post('/user/create', claimController.createClaim);
  router.put('/user/:claimId/update', claimController.updateClaim);
  router.post('/user/:claimId/evidence', claimController.addEvidence);
  router.post('/user/:claimId/communication', claimController.addCommunication);
  router.post('/user/:claimId/cancel', claimController.cancelClaim);

  // Rutas para tiendas (store managers)
  router.get('/store/:storeId', claimController.getStoreClaims);
  router.get('/store/:storeId/stats', claimController.getClaimStats);
  router.get('/store/:storeId/:claimId', claimController.getClaimDetails);
  router.post('/store/:storeId/:claimId/communication', claimController.addCommunication);

  // Rutas para administradores
  router.get('/admin/all', claimController.getUserClaims); // Con filtros adicionales
  router.get('/admin/stats', claimController.getClaimStats);

  return router;
};

export default createClaimRoutes;
