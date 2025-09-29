import { Router } from 'express';
import { QuotationConfigController } from '../controllers/quotationConfigController';
import { authMiddleware } from '../middleware/authMiddleware';
import { hasAnyRole } from '../middleware/roleMiddleware';

const router = Router();
const quotationConfigController = new QuotationConfigController();

// Middleware para verificar que el usuario sea gestor de tienda
const storeManagerMiddleware = hasAnyRole(['store_manager']);

// Rutas de configuración de cotizaciones
router.get('/', authMiddleware, storeManagerMiddleware, quotationConfigController.getConfig);
router.put('/', authMiddleware, storeManagerMiddleware, quotationConfigController.updateConfig);
router.post('/reset', authMiddleware, storeManagerMiddleware, quotationConfigController.resetConfig);
router.get('/tutorial', authMiddleware, storeManagerMiddleware, quotationConfigController.getTutorial);

export default router;
