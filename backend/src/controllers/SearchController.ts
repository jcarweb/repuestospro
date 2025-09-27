import { Request, Response } from 'express';
import SearchService from '../services/SearchService';
import { authMiddleware as authenticateToken, adminMiddleware as requireAdmin } from '../middleware/authMiddleware';

interface AuthenticatedRequest extends Request {
  user?: any;
}

class SearchController {
  // Búsqueda de productos
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        filters,
        page = 1,
        limit = 50,
        sortBy = 'relevance',
        sortOrder = 'desc'
      } = req.body;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'La consulta de búsqueda es requerida'
        });
      }

      const searchResult = await SearchService.search({
        query: query.trim(),
        filters,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: {
          results: searchResult.results.map(result => ({
            product: result.product,
            relevanceScore: result.relevanceScore,
            matchedFields: result.matchedFields
          })),
          total: searchResult.total,
          page: parseInt(page),
          totalPages: Math.ceil(searchResult.total / parseInt(limit)),
          suggestions: searchResult.suggestions,
          corrections: searchResult.corrections,
          queryAnalysis: searchResult.queryAnalysis
        }
      });
    } catch (error) {
      console.error('Error en búsqueda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Autocompletado
  async autocomplete(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'La consulta es requerida'
        });
      }

      const suggestions = await SearchService.autocomplete(query as string);

      res.json({
        success: true,
        data: {
          suggestions,
          query
        }
      });
    } catch (error) {
      console.error('Error en autocompletado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener configuración de búsqueda (solo admin)
  async getSearchConfig(req: Request, res: Response) {
    try {
      const config = await SearchService.getConfig();

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración de búsqueda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuración de búsqueda (solo admin)
  async updateSearchConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        semanticSearchEnabled,
        semanticThreshold,
        typoCorrectionEnabled,
        maxEditDistance,
        minWordLength,
        searchableFields,
        fieldWeights,
        defaultFilters,
        maxResults,
        minRelevanceScore,
        synonymsEnabled,
        synonymGroups,
        autocompleteEnabled,
        autocompleteMinLength,
        autocompleteMaxSuggestions,
        queryAnalysisEnabled,
        intentRecognitionEnabled
      } = req.body;

      const user = req.user;

      const updatedConfig = await SearchService.updateConfig({
        semanticSearchEnabled,
        semanticThreshold,
        typoCorrectionEnabled,
        maxEditDistance,
        minWordLength,
        searchableFields,
        fieldWeights,
        defaultFilters,
        maxResults,
        minRelevanceScore,
        synonymsEnabled,
        synonymGroups,
        autocompleteEnabled,
        autocompleteMinLength,
        autocompleteMaxSuggestions,
        queryAnalysisEnabled,
        intentRecognitionEnabled
      }, user._id, user.name, user.email);

      res.json({
        success: true,
        message: 'Configuración de búsqueda actualizada exitosamente',
        data: updatedConfig
      });
    } catch (error) {
      console.error('Error actualizando configuración de búsqueda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de búsqueda (solo admin)
  async getSearchStats(req: Request, res: Response) {
    try {
      // Aquí podrías implementar estadísticas de búsqueda
      // como términos más buscados, consultas sin resultados, etc.
      
      res.json({
        success: true,
        data: {
          totalSearches: 0,
          popularQueries: [],
          noResultQueries: [],
          averageResultsPerQuery: 0
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de búsqueda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Búsqueda avanzada con filtros
  async advancedSearch(req: Request, res: Response) {
    try {
      const {
        query,
        category,
        brand,
        subcategory,
        originalPartCode,
        priceRange,
        availability,
        sortBy,
        sortOrder,
        page = 1,
        limit = 50
      } = req.body;

      const filters: any = {};

      if (category) filters.category = Array.isArray(category) ? category : [category];
      if (brand) filters.brand = Array.isArray(brand) ? brand : [brand];
      if (subcategory) filters.subcategory = Array.isArray(subcategory) ? subcategory : [subcategory];
      if (originalPartCode) filters.originalPartCode = Array.isArray(originalPartCode) ? originalPartCode : [originalPartCode];
      if (priceRange) filters.priceRange = priceRange;
      if (availability !== undefined) filters.availability = availability;

      const searchResult = await SearchService.search({
        query: query || '',
        filters,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: {
          results: searchResult.results.map(result => ({
            product: result.product,
            relevanceScore: result.relevanceScore,
            matchedFields: result.matchedFields
          })),
          total: searchResult.total,
          page: parseInt(page),
          totalPages: Math.ceil(searchResult.total / parseInt(limit)),
          filters: filters
        }
      });
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

const searchController = new SearchController();

export default searchController; 