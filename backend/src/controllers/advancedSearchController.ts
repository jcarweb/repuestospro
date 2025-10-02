import { Request, Response } from 'express';
import { AdvancedProductSearchService, AdvancedSearchFilters } from '../services/advancedProductSearchService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class AdvancedSearchController {
  private searchService: AdvancedProductSearchService;

  constructor() {
    this.searchService = AdvancedProductSearchService.getInstance();
  }

  // Búsqueda avanzada de productos
  async searchProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        searchTerm,
        category,
        brand,
        subcategory,
        vehicleType,
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'popularity',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      const filters: AdvancedSearchFilters = {
        searchTerm: searchTerm as string,
        category: category as string,
        brand: brand as string,
        subcategory: subcategory as string,
        vehicleType: vehicleType as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStock ? inStock === 'true' : undefined,
        store: req.user.store, // Filtrar por tienda del usuario
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        page: Number(page),
        limit: Number(limit)
      };

      const results = await this.searchService.searchProducts(filters);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Búsqueda rápida para autocompletado
  async quickSearch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || (q as string).length < 2) {
        res.json({
          success: true,
          data: {
            products: [],
            suggestions: []
          }
        });
        return;
      }

      const products = await this.searchService.quickSearch(q as string, Number(limit));

      res.json({
        success: true,
        data: {
          products,
          suggestions: products.map(p => p.name)
        }
      });
    } catch (error) {
      console.error('Error en búsqueda rápida:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener productos similares
  async getSimilarProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'ID de producto requerido'
        });
        return;
      }
      const { limit } = req.query;
      const limitNumber = limit ? Number(limit) : 5;

      const products = await this.searchService.getSimilarProducts(productId, limitNumber);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error obteniendo productos similares:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener productos más buscados
  async getMostSearchedProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const products = await this.searchService.getMostSearchedProducts(Number(limit));

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error obteniendo productos más buscados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener filtros disponibles
  async getAvailableFilters(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = await this.searchService.getAvailableFilters();

      res.json({
        success: true,
        data: filters
      });
    } catch (error) {
      console.error('Error obteniendo filtros disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener sugerencias de búsqueda
  async getSearchSuggestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || (q as string).length < 2) {
        res.json({
          success: true,
          data: []
        });
        return;
      }

      const products = await this.searchService.quickSearch(q as string, 5);
      const suggestions = products.map(p => ({
        text: p.name,
        type: 'product',
        data: {
          id: p._id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          image: p.images[0]
        }
      }));

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
