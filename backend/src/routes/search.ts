import express from 'express';
import searchController from '../controllers/SearchController';
import { authenticateToken, requireAdmin } from '../middleware';

const router = express.Router();

// Rutas públicas de búsqueda
router.post('/products', searchController.searchProducts);
router.get('/autocomplete', searchController.autocomplete);
router.post('/advanced', searchController.advancedSearch);

// Rutas administrativas (solo admin)
router.get('/config', authenticateToken, requireAdmin, searchController.getSearchConfig);
router.put('/config', authenticateToken, requireAdmin, searchController.updateSearchConfig);
router.get('/stats', authenticateToken, requireAdmin, searchController.getSearchStats);

export default router; 