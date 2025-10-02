import { Router } from 'express';
import { AdvancedSearchController } from '../controllers/advancedSearchController';
import { authMiddleware } from '../middleware/authMiddleware';
import { hasAnyRole } from '../middleware/roleMiddleware';

const router = Router();
const advancedSearchController = new AdvancedSearchController();

// Middleware para verificar que el usuario sea gestor de tienda o vendedor
const quotationAccessMiddleware = hasAnyRole(['store_manager', 'seller']);

// Rutas de búsqueda avanzada
router.get('/products', authMiddleware, quotationAccessMiddleware, advancedSearchController.searchProducts);
router.get('/quick', authMiddleware, quotationAccessMiddleware, advancedSearchController.quickSearch);
router.get('/suggestions', authMiddleware, quotationAccessMiddleware, advancedSearchController.getSearchSuggestions);
router.get('/similar/:productId', authMiddleware, quotationAccessMiddleware, advancedSearchController.getSimilarProducts);
router.get('/most-searched', authMiddleware, quotationAccessMiddleware, advancedSearchController.getMostSearchedProducts);
router.get('/filters', authMiddleware, quotationAccessMiddleware, advancedSearchController.getAvailableFilters);

export default router;
