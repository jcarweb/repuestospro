import { Product } from '../models/Product';
import { Store } from '../models/Store';

export interface AdvancedSearchFilters {
  searchTerm?: string;
  category?: string;
  brand?: string;
  subcategory?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  store?: string;
  sortBy?: 'name' | 'price' | 'popularity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  product: any;
  relevanceScore: number;
  matchedFields: string[];
}

export class AdvancedProductSearchService {
  private static instance: AdvancedProductSearchService;

  static getInstance(): AdvancedProductSearchService {
    if (!AdvancedProductSearchService.instance) {
      AdvancedProductSearchService.instance = new AdvancedProductSearchService();
    }
    return AdvancedProductSearchService.instance;
  }

  // Búsqueda avanzada de productos
  async searchProducts(filters: AdvancedSearchFilters): Promise<{
    products: SearchResult[];
    total: number;
    suggestions: string[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
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
        store,
        sortBy = 'popularity',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = filters;

      // Construir filtros de MongoDB
      const mongoFilters: any = {
        isActive: true,
        deleted: { $ne: true }
      };

      // Filtro por tienda
      if (store) {
        mongoFilters.store = store;
      }

      // Filtros básicos
      if (category) mongoFilters.category = category;
      if (brand) mongoFilters.brand = brand;
      if (subcategory) mongoFilters.subcategory = subcategory;
      if (vehicleType) mongoFilters.vehicleType = vehicleType;

      // Filtros de precio
      if (minPrice !== undefined || maxPrice !== undefined) {
        mongoFilters.price = {};
        if (minPrice !== undefined) mongoFilters.price.$gte = minPrice;
        if (maxPrice !== undefined) mongoFilters.price.$lte = maxPrice;
      }

      // Filtro de stock
      if (inStock !== undefined) {
        mongoFilters.stock = inStock ? { $gt: 0 } : 0;
      }

      // Búsqueda por texto
      if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, 'i');
        mongoFilters.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { sku: searchRegex },
          { originalPartCode: searchRegex },
          { brand: searchRegex },
          { category: searchRegex },
          { subcategory: searchRegex },
          { tags: { $in: [searchRegex] } }
        ];
      }

      // Ordenamiento
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Paginación
      const skip = (page - 1) * limit;

      // Ejecutar consulta
      const products = await Product.find(mongoFilters)
        .populate('store', 'name address phone email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Product.countDocuments(mongoFilters);

      // Calcular relevancia para cada producto
      const searchResults: SearchResult[] = products.map(product => {
        const relevanceScore = searchTerm ? 
          this.calculateRelevanceScore(product, searchTerm) : 0;
        
        const matchedFields = searchTerm ? 
          this.getMatchedFields(product, searchTerm) : [];

        return {
          product,
          relevanceScore,
          matchedFields
        };
      });

      // Ordenar por relevancia si hay término de búsqueda
      if (searchTerm) {
        searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }

      // Generar sugerencias
      const suggestions = await this.generateSuggestions(searchTerm, mongoFilters);

      return {
        products: searchResults,
        total,
        suggestions,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      throw error;
    }
  }

  // Búsqueda rápida para autocompletado
  async quickSearch(searchTerm: string, limit: number = 10): Promise<any[]> {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const searchRegex = new RegExp(searchTerm, 'i');
      const products = await Product.find({
        isActive: true,
        deleted: { $ne: true },
        $or: [
          { name: searchRegex },
          { sku: searchRegex },
          { originalPartCode: searchRegex },
          { brand: searchRegex }
        ]
      })
      .select('name sku originalPartCode brand price stock images')
      .limit(limit)
      .sort({ popularity: -1 });

      return products;
    } catch (error) {
      console.error('Error en búsqueda rápida:', error);
      return [];
    }
  }

  // Obtener productos similares
  async getSimilarProducts(productId: string, limit: number = 5): Promise<any[]> {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return [];
      }

      const similarProducts = await Product.find({
        _id: { $ne: productId },
        isActive: true,
        deleted: { $ne: true },
        $or: [
          { category: product.category },
          { brand: product.brand },
          { subcategory: product.subcategory },
          { vehicleType: product.vehicleType }
        ]
      })
      .select('name sku originalPartCode brand price stock images')
      .limit(limit)
      .sort({ popularity: -1 });

      return similarProducts;
    } catch (error) {
      console.error('Error obteniendo productos similares:', error);
      return [];
    }
  }

  // Obtener productos más buscados
  async getMostSearchedProducts(limit: number = 10): Promise<any[]> {
    try {
      const products = await Product.find({
        isActive: true,
        deleted: { $ne: true }
      })
      .select('name sku originalPartCode brand price stock images popularity')
      .sort({ popularity: -1 })
      .limit(limit);

      return products;
    } catch (error) {
      console.error('Error obteniendo productos más buscados:', error);
      return [];
    }
  }

  // Obtener filtros disponibles
  async getAvailableFilters(): Promise<{
    categories: string[];
    brands: string[];
    subcategories: string[];
    vehicleTypes: string[];
    priceRange: { min: number; max: number };
  }> {
    try {
      const [categories, brands, subcategories, vehicleTypes, priceRange] = await Promise.all([
        Product.distinct('category', { isActive: true, deleted: { $ne: true } }),
        Product.distinct('brand', { isActive: true, deleted: { $ne: true } }),
        Product.distinct('subcategory', { isActive: true, deleted: { $ne: true } }),
        Product.distinct('vehicleType', { isActive: true, deleted: { $ne: true } }),
        Product.aggregate([
          { $match: { isActive: true, deleted: { $ne: true } } },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' }
            }
          }
        ])
      ]);

      return {
        categories: categories.filter(Boolean),
        brands: brands.filter(Boolean),
        subcategories: subcategories.filter(Boolean),
        vehicleTypes: vehicleTypes.filter(Boolean),
        priceRange: priceRange[0] ? { min: priceRange[0].minPrice, max: priceRange[0].maxPrice } : { min: 0, max: 0 }
      };
    } catch (error) {
      console.error('Error obteniendo filtros disponibles:', error);
      return {
        categories: [],
        brands: [],
        subcategories: [],
        vehicleTypes: [],
        priceRange: { min: 0, max: 0 }
      };
    }
  }

  private calculateRelevanceScore(product: any, searchTerm: string): number {
    let score = 0;
    const term = searchTerm.toLowerCase();

    // Puntuación por coincidencia exacta
    if (product.name.toLowerCase().includes(term)) score += 10;
    if (product.sku.toLowerCase().includes(term)) score += 15;
    if (product.originalPartCode && product.originalPartCode.toLowerCase().includes(term)) score += 15;
    if (product.brand && product.brand.toLowerCase().includes(term)) score += 8;
    if (product.category.toLowerCase().includes(term)) score += 5;
    if (product.subcategory && product.subcategory.toLowerCase().includes(term)) score += 5;

    // Puntuación por coincidencia parcial
    const nameWords = product.name.toLowerCase().split(' ');
    const termWords = term.split(' ');
    
    termWords.forEach(termWord => {
      nameWords.forEach(nameWord => {
        if (nameWord.includes(termWord)) score += 2;
      });
    });

    // Puntuación por popularidad
    score += (product.popularity || 0) * 0.1;

    // Puntuación por disponibilidad
    if (product.stock > 0) score += 2;

    return Math.min(score, 100); // Normalizar a máximo 100
  }

  private getMatchedFields(product: any, searchTerm: string): string[] {
    const matchedFields: string[] = [];
    const term = searchTerm.toLowerCase();

    if (product.name.toLowerCase().includes(term)) matchedFields.push('name');
    if (product.sku.toLowerCase().includes(term)) matchedFields.push('sku');
    if (product.originalPartCode && product.originalPartCode.toLowerCase().includes(term)) matchedFields.push('originalPartCode');
    if (product.brand && product.brand.toLowerCase().includes(term)) matchedFields.push('brand');
    if (product.category.toLowerCase().includes(term)) matchedFields.push('category');
    if (product.subcategory && product.subcategory.toLowerCase().includes(term)) matchedFields.push('subcategory');

    return matchedFields;
  }

  private async generateSuggestions(searchTerm: string, filters: any): Promise<string[]> {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      // Obtener sugerencias basadas en nombres de productos
      const products = await Product.find({
        ...filters,
        name: { $regex: searchTerm, $options: 'i' }
      })
      .select('name')
      .limit(5);

      const suggestions = products.map(product => product.name);
      return [...new Set(suggestions)]; // Eliminar duplicados
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      return [];
    }
  }
}
