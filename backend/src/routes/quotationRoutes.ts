import { Router } from 'express';
import { QuotationController } from '../controllers/quotationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { hasAnyRole } from '../middleware/roleMiddleware';

const router = Router();
const quotationController = new QuotationController();

// Middleware para verificar que el usuario sea gestor de tienda o vendedor
const quotationAccessMiddleware = hasAnyRole(['store_manager', 'seller']);

// Rutas de cotizaciones
router.post('/', authMiddleware, quotationAccessMiddleware, quotationController.createQuotation);
router.get('/', authMiddleware, quotationAccessMiddleware, quotationController.getQuotations);
router.get('/stats', authMiddleware, quotationAccessMiddleware, quotationController.getQuotationStats);
router.get('/:id', authMiddleware, quotationAccessMiddleware, quotationController.getQuotationById);
router.put('/:id', authMiddleware, quotationAccessMiddleware, quotationController.updateQuotation);
router.delete('/:id', authMiddleware, quotationAccessMiddleware, quotationController.deleteQuotation);
router.post('/:id/send', authMiddleware, quotationAccessMiddleware, quotationController.sendQuotation);
router.get('/:id/download', authMiddleware, quotationAccessMiddleware, quotationController.downloadQuotationPDF);

export default router;
