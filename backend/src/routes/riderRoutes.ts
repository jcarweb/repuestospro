import express from 'express';
import RiderController from '../controllers/RiderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para gestores de tienda y admin
router.use(roleMiddleware(['store_manager', 'admin']));

// Gestión de riders
router.post('/', RiderController.createRider);
router.get('/', RiderController.getRiders);
router.get('/stats', RiderController.getRidersStats);
router.get('/:id', RiderController.getRider);
router.get('/:id/stats', RiderController.getRiderStats);
router.put('/:id', RiderController.updateRider);
router.put('/:id/status', RiderController.updateRiderStatus);
router.put('/:id/availability', RiderController.updateRiderAvailability);
router.put('/:id/documents/verify', RiderController.verifyRiderDocuments);
router.put('/:id/service-areas', RiderController.updateServiceAreas);

// Rutas específicas para admin
router.use(roleMiddleware(['admin']));

router.delete('/:id', RiderController.deleteRider);

export default router;
