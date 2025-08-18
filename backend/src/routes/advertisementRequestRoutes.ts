import express from 'express';
import { AdvertisementRequestController } from '../controllers/advertisementRequestController';
import { authMiddleware, adminMiddleware, storeManagerMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rutas para gestores de tienda
router.post('/', authMiddleware, storeManagerMiddleware, AdvertisementRequestController.createRequest);
router.get('/my-requests', authMiddleware, storeManagerMiddleware, AdvertisementRequestController.getStoreManagerRequests);
router.get('/my-requests/:id', authMiddleware, storeManagerMiddleware, AdvertisementRequestController.getRequestById);
router.put('/my-requests/:id', authMiddleware, storeManagerMiddleware, AdvertisementRequestController.updateRequest);
router.post('/my-requests/:id/submit', authMiddleware, storeManagerMiddleware, AdvertisementRequestController.submitRequest);
router.post('/my-requests/:id/cancel', authMiddleware, storeManagerMiddleware, AdvertisementRequestController.cancelRequest);

// Rutas para administradores
router.get('/admin/all', authMiddleware, adminMiddleware, AdvertisementRequestController.getAllRequests);
router.get('/admin/:id', authMiddleware, adminMiddleware, AdvertisementRequestController.getRequestById);
router.post('/admin/:id/approve', authMiddleware, adminMiddleware, AdvertisementRequestController.approveRequest);
router.post('/admin/:id/reject', authMiddleware, adminMiddleware, AdvertisementRequestController.rejectRequest);
router.put('/admin/:id/review-status', authMiddleware, adminMiddleware, AdvertisementRequestController.changeReviewStatus);

export default router;
