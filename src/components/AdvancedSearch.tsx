import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  product: any;
  relevanceScore: number;
  matchedFields: string[];
}

interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
    suggestions: string[];
    corrections: string[];
    queryAnalysis: any;
  };
}

interface AdvancedSearchProps {
  onSearch?: (results: SearchResult[]) => void;
  placeholder?: string;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onSearch, 
  placeholder = "Buscar repuestos, marcas, modelos...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [corrections, setCorrections] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: [] as string[],
    brand: [] as string[],
    subcategory: [] as string[],
    priceRange: { min: 0, max: 10000 },
    availability: true,
    originalPartCode: [] as string[]
  });
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce para autocompletado
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedQuery(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Obtener sugerencias de autocompletado
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/search/autocomplete?query=${encodeURIComponent(searchQuery)}`);
      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
    }
  };

  const performSearch = useCallback(async (searchQuery: string, searchFilters = filters) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/search/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          filters: searchFilters,
          page: 1,
          limit: 20
        }),
      });

      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.results);
        setCorrections(data.data.corrections);
        onSearch?.(data.data.results);
        
        // Si hay correcciones, mostrar sugerencia
        if (data.data.corrections.length > 0) {
          console.log('Correcciones sugeridas:', data.data.corrections);
        }
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, onSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  const handleCorrectionClick = (correction: string) => {
    setQuery(correction);
    performSearch(correction);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setCorrections([]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Barra de búsqueda principal */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-lg"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Botón de filtros avanzados */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
        >
          <Filter className="w-5 h-5" />
        </button>
      </form>

      {/* Sugerencias de autocompletado */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-900"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Correcciones sugeridas */}
      {corrections.length > 0 && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              ¿Quisiste decir?
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {corrections.map((correction, index) => (
              <button
                key={index}
                onClick={() => handleCorrectionClick(correction)}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
              >
                {correction}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Filtro de marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <select
                value={filters.brand[0] || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">Todas las marcas</option>
                <option value="toyota" className="text-gray-900">Toyota</option>
                <option value="honda" className="text-gray-900">Honda</option>
                <option value="ford" className="text-gray-900">Ford</option>
                <option value="chevrolet" className="text-gray-900">Chevrolet</option>
                <option value="nissan" className="text-gray-900">Nissan</option>
                <option value="bmw" className="text-gray-900">BMW</option>
                <option value="mercedes" className="text-gray-900">Mercedes</option>
                <option value="audi" className="text-gray-900">Audi</option>
                <option value="volkswagen" className="text-gray-900">Volkswagen</option>
                <option value="hyundai" className="text-gray-900">Hyundai</option>
                <option value="kia" className="text-gray-900">Kia</option>
              </select>
            </div>

            {/* Filtro de categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={filters.category[0] || ''}
                onChange={(e) => handleFilterChange('category', e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">Todas las categorías</option>
                <option value="motor" className="text-gray-900">Motor</option>
                <option value="frenos" className="text-gray-900">Frenos</option>
                <option value="suspension" className="text-gray-900">Suspensión</option>
                <option value="electrico" className="text-gray-900">Eléctrico</option>
                <option value="transmision" className="text-gray-900">Transmisión</option>
                <option value="refrigeracion" className="text-gray-900">Refrigeración</option>
                <option value="combustible" className="text-gray-900">Combustible</option>
                <option value="escape" className="text-gray-900">Escape</option>
                <option value="direccion" className="text-gray-900">Dirección</option>
                <option value="iluminacion" className="text-gray-900">Iluminación</option>
                <option value="accesorios" className="text-gray-900">Accesorios</option>
              </select>
            </div>

            {/* Filtro de subcategoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategoría
              </label>
              <select
                value={filters.subcategory?.[0] || ''}
                onChange={(e) => handleFilterChange('subcategory', e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">Todas las subcategorías</option>
                <option value="pastillas" className="text-gray-900">Pastillas de Freno</option>
                <option value="discos" className="text-gray-900">Discos de Freno</option>
                <option value="aceite" className="text-gray-900">Aceite de Motor</option>
                <option value="filtros" className="text-gray-900">Filtros</option>
                <option value="bujias" className="text-gray-900">Bujías</option>
                <option value="amortiguadores" className="text-gray-900">Amortiguadores</option>
                <option value="baterias" className="text-gray-900">Baterías</option>
                <option value="bombillas" className="text-gray-900">Bombillas</option>
                <option value="correas" className="text-gray-900">Correas</option>
                <option value="embragues" className="text-gray-900">Embragues</option>
                <option value="radiadores" className="text-gray-900">Radiadores</option>
                <option value="bombas" className="text-gray-900">Bombas</option>
              </select>
            </div>

            {/* Filtro de código de parte original */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Original
              </label>
              <input
                type="text"
                placeholder="Ej: TOY-MO-1234-2020"
                value={filters.originalPartCode?.[0] || ''}
                onChange={(e) => handleFilterChange('originalPartCode', e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            {/* Filtro de precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de precio
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: parseInt(e.target.value) || 0
                  })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: parseInt(e.target.value) || 10000
                  })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Filtro de disponibilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disponibilidad
              </label>
              <select
                value={filters.availability ? 'available' : 'all'}
                onChange={(e) => handleFilterChange('availability', e.target.value === 'available')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all" className="text-gray-900">Todos los productos</option>
                <option value="available" className="text-gray-900">Solo disponibles</option>
              </select>
            </div>
          </div>

          {/* Botón de búsqueda con filtros */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => performSearch(query)}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados ({searchResults.length})
            </h3>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Búsqueda inteligente</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/product/${result.product._id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {result.product.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {result.product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ${result.product.price}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(result.relevanceScore * 100)}% relevante
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 