import { Router } from 'express';
import { StorePhotoController } from '../controllers/storePhotoController';
import { cryptoAuthMiddleware, cryptoAdminMiddleware } from '../middleware/cryptoAuthMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(cryptoAuthMiddleware);

// Rutas para subir y gestionar fotos
router.post('/upload', StorePhotoController.uploadStorePhoto);
router.get('/', StorePhotoController.getStorePhotos);
router.get('/:id', StorePhotoController.getStorePhoto);
router.delete('/:id', StorePhotoController.deleteStorePhoto);

// Rutas específicas para admin
router.post('/admin/enrichment/run', cryptoAdminMiddleware, StorePhotoController.runEnrichment);
router.get('/admin/enrichment/stats', cryptoAdminMiddleware, StorePhotoController.getEnrichmentStats);
router.post('/admin/worker/control', cryptoAdminMiddleware, StorePhotoController.controlWorker);

export default router;
