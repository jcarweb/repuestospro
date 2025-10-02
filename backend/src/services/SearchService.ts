import Product from '../models/Product';
import SearchConfig from '../models/SearchConfig';
import { ISearchConfig } from '../models/SearchConfig';
import mongoose from 'mongoose';

interface SearchResult {
  product: any;
  relevanceScore: number;
  matchedFields: string[];
  corrections: string[];
  suggestions: string[];
}

interface SearchQuery {
  query: string;
  filters?: {
    category?: string[];
    brand?: string[];
    subcategory?: string[];
    originalPartCode?: string[];
    priceRange?: { min: number; max: number };
    availability?: boolean;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class SearchService {
  private config: ISearchConfig | null = null;

  // Cargar configuración de búsqueda
  async loadConfig(): Promise<ISearchConfig> {
    if (!this.config) {
      this.config = await SearchConfig.findOne().sort({ updatedAt: -1 });
      if (!this.config) {
        // Crear configuración por defecto
        const systemUserId = new mongoose.Types.ObjectId();
        this.config = await SearchConfig.create({
          createdBy: { 
            _id: systemUserId, 
            name: 'System', 
            email: 'system@repuestospro.com' 
          },
          updatedBy: { 
            _id: systemUserId, 
            name: 'System', 
            email: 'system@repuestospro.com' 
          },
          searchableFields: ['name', 'description', 'category', 'brand', 'sku', 'originalPartCode'],
          fieldWeights: {
            name: 10,
            sku: 8,
            originalPartCode: 8,
            brand: 6,
            category: 4,
            description: 2
          }
        }) as ISearchConfig;
      }
    }
    return this.config!;
  }

  // Calcular distancia de Levenshtein para corrección de errores
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0]![i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j]![0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1, // deletion
          matrix[j - 1]![i]! + 1, // insertion
          matrix[j - 1]![i - 1]! + indicator // substitution
        );
      }
    }

    return matrix[str2.length]![str1.length]!;
  }

  // Corregir errores tipográficos
  private correctTypos(query: string, dictionary: string[]): string[] {
    const config = this.config!;
    if (!config.typoCorrectionEnabled) return [query];

    const words = query.toLowerCase().split(/\s+/);
    const corrections: string[] = [];

    for (const word of words) {
      if (word.length < config.minWordLength) {
        corrections.push(word);
        continue;
      }

      let bestMatch = word;
      let minDistance = Infinity;

      for (const dictWord of dictionary) {
        const distance = this.levenshteinDistance(word, dictWord);
        if (distance <= config.maxEditDistance && distance < minDistance) {
          minDistance = distance;
          bestMatch = dictWord;
        }
      }

      corrections.push(bestMatch);
    }

    return [corrections.join(' '), query]; // Retornar tanto la corrección como la consulta original
  }

  // Generar sinónimos para la consulta
  private generateSynonyms(query: string): string[] {
    const config = this.config!;
    if (!config.synonymsEnabled) return [query];

    const synonyms: string[] = [query];
    const words = query.toLowerCase().split(/\s+/);

    for (const group of config.synonymGroups) {
      for (const word of words) {
        if (group.words.includes(word)) {
          for (const synonym of group.words) {
            if (synonym !== word) {
              const synonymQuery = query.replace(new RegExp(word, 'gi'), synonym);
              synonyms.push(synonymQuery);
            }
          }
        }
      }
    }

    return [...new Set(synonyms)];
  }

  // Analizar intención de la consulta
  private analyzeQueryIntent(query: string): any {
    const config = this.config!;
    if (!config.intentRecognitionEnabled) return {};

    const intent = {
      isSpecificPart: false,
      isBrandSearch: false,
      isCategorySearch: false,
      isPriceSearch: false,
      suggestedFilters: {}
    };

    const lowerQuery = query.toLowerCase();

    // Detectar búsqueda de marca
    const brandKeywords = ['marca', 'brand', 'fabricante'];
    if (brandKeywords.some(keyword => lowerQuery.includes(keyword))) {
      intent.isBrandSearch = true;
    }

    // Detectar búsqueda de categoría
    const categoryKeywords = ['categoría', 'category', 'tipo', 'tipo de'];
    if (categoryKeywords.some(keyword => lowerQuery.includes(keyword))) {
      intent.isCategorySearch = true;
    }

    // Detectar búsqueda de precio
    const priceKeywords = ['barato', 'económico', 'caro', 'precio', 'costo'];
    if (priceKeywords.some(keyword => lowerQuery.includes(keyword))) {
      intent.isPriceSearch = true;
    }

    // Detectar parte específica
    const partKeywords = ['freno', 'motor', 'batería', 'aceite', 'filtro', 'llanta'];
    if (partKeywords.some(keyword => lowerQuery.includes(keyword))) {
      intent.isSpecificPart = true;
    }

    return intent;
  }

  // Calcular puntuación de relevancia
  private calculateRelevanceScore(product: any, query: string, matchedFields: string[]): number {
    const config = this.config!;
    let score = 0;

    // Puntuación por campos coincidentes
    for (const field of matchedFields) {
      const weight = config.fieldWeights[field] || 1;
      score += weight;
    }

    // Puntuación por coincidencia exacta
    const exactMatch = product.name.toLowerCase().includes(query.toLowerCase()) ||
                      product.description.toLowerCase().includes(query.toLowerCase());
    if (exactMatch) score += 5;

    // Puntuación por popularidad (si existe)
    if (product.popularity) score += product.popularity * 0.1;

    // Puntuación por disponibilidad
    if (product.stock > 0) score += 2;

    // Normalizar puntuación
    return Math.min(score / 20, 1);
  }

  // Búsqueda principal
  async search(searchQuery: SearchQuery): Promise<{
    results: SearchResult[];
    total: number;
    suggestions: string[];
    corrections: string[];
    queryAnalysis: any;
  }> {
    const config = await this.loadConfig();
    const { query, filters = {}, page = 1, limit = config.maxResults } = searchQuery;

    // Obtener diccionario de palabras para corrección
    const allProducts = await Product.find({}, 'name description category brand sku originalPartCode');
    const dictionary = new Set<string>();
    
    allProducts.forEach(product => {
      const words = [
        ...(product.name?.toString() || '').toLowerCase().split(/\s+/) || [],
        ...(product.description?.toString() || '').toLowerCase().split(/\s+/) || [],
        ...(product.category?.toString() || '').toLowerCase().split(/\s+/) || [],
        ...(product.brand?.toString() || '').toLowerCase().split(/\s+/) || [],
        ...(product.sku?.toString() || '').toLowerCase().split(/\s+/) || [],
        ...(product.originalPartCode?.toString() || '').toLowerCase().split(/\s+/) || []
      ];
      words.forEach(word => dictionary.add(word));
    });

    // Corregir errores tipográficos
    const corrections = this.correctTypos(query, Array.from(dictionary));
    
    // Generar sinónimos
    const synonyms = this.generateSynonyms(query);
    
    // Combinar todas las variaciones de consulta
    const allQueries = [...new Set([...corrections, ...synonyms])];
    
    // Analizar intención de la consulta
    const queryAnalysis = this.analyzeQueryIntent(query);

    // Construir filtros de MongoDB
    const mongoFilters: any = {};

    // Filtros de disponibilidad
    if (filters.availability !== undefined) {
      mongoFilters.stock = filters.availability ? { $gt: 0 } : 0;
    }

    // Filtros de precio
    if (filters.priceRange) {
      mongoFilters.price = {
        $gte: filters.priceRange.min,
        $lte: filters.priceRange.max
      };
    }

    // Filtros de categoría
    if (filters.category && filters.category.length > 0) {
      mongoFilters.category = { $in: filters.category };
    }

    // Filtros de marca
    if (filters.brand && filters.brand.length > 0) {
      mongoFilters.brand = { $in: filters.brand };
    }

    // Filtros de subcategoría
    if (filters.subcategory && filters.subcategory.length > 0) {
      mongoFilters.subcategory = { $in: filters.subcategory };
    }

    // Filtros de código de parte original
    if (filters.originalPartCode && filters.originalPartCode.length > 0) {
      mongoFilters.originalPartCode = { $in: filters.originalPartCode };
    }

    // Construir consulta de texto
    const textQueries = allQueries.map(q => ({
      $or: config.searchableFields.map(field => ({
        [field]: { $regex: q, $options: 'i' }
      }))
    }));

    // Ejecutar búsqueda
    const searchFilter = {
      ...mongoFilters,
      $or: textQueries
    };

    const products = await Product.find(searchFilter)
      .sort({ popularity: -1, name: 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Procesar resultados
    const results: SearchResult[] = [];
    const suggestions: string[] = [];

    for (const product of products) {
      const matchedFields: string[] = [];
      
      // Determinar campos coincidentes
      for (const field of config.searchableFields) {
        const fieldValue = (product as any)[field];
        if (fieldValue && allQueries.some(q => 
          fieldValue.toString().toLowerCase().includes(q.toLowerCase())
        )) {
          matchedFields.push(field);
        }
      }

      // Calcular puntuación de relevancia
      const relevanceScore = this.calculateRelevanceScore(product, query, matchedFields);

      // Filtrar por puntuación mínima
      if (relevanceScore >= config.minRelevanceScore) {
        results.push({
          product,
          relevanceScore,
          matchedFields,
          corrections: corrections.filter(c => c !== query),
          suggestions: []
        });
      }
    }

    // Ordenar por relevancia
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Generar sugerencias
    if (results.length === 0) {
      const popularProducts = await Product.find({ popularity: { $gt: 0 } })
        .sort({ popularity: -1 })
        .limit(5);
      
      suggestions.push(...popularProducts.map(p => p.name?.toString() || ''));
    }

    // Obtener total de resultados
    const total = await Product.countDocuments(searchFilter);

    return {
      results,
      total,
      suggestions,
      corrections: corrections.filter(c => c !== query),
      queryAnalysis
    };
  }

  // Autocompletado
  async autocomplete(query: string): Promise<string[]> {
    const config = await this.loadConfig();
    if (!config.autocompleteEnabled || query.length < config.autocompleteMinLength) {
      return [];
    }

    const suggestions = await Product.aggregate([
      {
        $search: {
          autocomplete: {
            query: query,
            path: "name",
            fuzzy: {
              maxEdits: config.maxEditDistance
            }
          }
        }
      },
      {
        $limit: config.autocompleteMaxSuggestions
      },
      {
        $project: {
          name: 1,
          _id: 0
        }
      }
    ]);

    return suggestions.map(s => s.name);
  }

  // Actualizar configuración de búsqueda
  async updateConfig(newConfig: Partial<ISearchConfig>, userId: string, userName: string, userEmail: string): Promise<ISearchConfig> {
    const config = await this.loadConfig();
    
    const updatedConfig = await SearchConfig.findByIdAndUpdate(
      config._id,
      {
        ...newConfig,
        updatedBy: {
          _id: userId,
          name: userName,
          email: userEmail
        }
      },
      { new: true }
    );

    this.config = updatedConfig;
    return updatedConfig!;
  }

  // Obtener configuración actual
  async getConfig(): Promise<ISearchConfig> {
    return await this.loadConfig();
  }
}

export default new SearchService(); 