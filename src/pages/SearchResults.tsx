import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, X, Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface SearchResult {
  product: any;
  relevanceScore: number;
  matchedFields: string[];
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: [] as string[],
    brand: [] as string[],
    priceRange: { min: 0, max: 10000 },
    availability: true
  });

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
      setQuery(location.state.query || '');
    } else {
      // Si no hay resultados en el state, redirigir a la página principal
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleToggleFavorite = (product: any) => {
    if (isInFavorites(product._id)) {
      removeFromFavorites(product._id);
    } else {
      addToFavorites(product);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    // Aquí se aplicarían los filtros a los resultados
    // Por ahora solo cerramos el panel de filtros
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      brand: [],
      priceRange: { min: 0, max: 10000 },
      availability: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto mb-4"></div>
          <p className="text-[#333333]">Buscando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de resultados */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">
                Resultados de búsqueda
              </h1>
              <p className="text-gray-600 mt-1">
                {results.length} productos encontrados
                {query && ` para "${query}"`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>
              
              {/* Volver */}
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Panel de filtros */}
          {showFilters && (
            <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#333333]">Filtros</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categorías</h4>
                <div className="space-y-2">
                  {Array.from(new Set(results.map(r => r.product.category))).map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('category', [...filters.category, category]);
                          } else {
                            handleFilterChange('category', filters.category.filter(c => c !== category));
                          }
                        }}
                        className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Marcas */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Marcas</h4>
                <div className="space-y-2">
                  {Array.from(new Set(results.map(r => r.product.brand))).map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brand.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('brand', [...filters.brand, brand]);
                          } else {
                            handleFilterChange('brand', filters.brand.filter(b => b !== brand));
                          }
                        }}
                        className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
                      />
                      <span className="ml-2 text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rango de precios */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Rango de precios</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Mínimo</label>
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Máximo</label>
                    <input
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.checked)}
                    className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Solo disponibles</span>
                </label>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={applyFilters}
                  className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors font-semibold"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Lista de resultados */}
          <div className="flex-1">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600 mb-6">
                  Intenta con otros términos de búsqueda o ajusta los filtros
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors font-semibold"
                >
                  Volver al inicio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Imagen del producto */}
                    <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                      {result.product.image ? (
                        <img
                          src={result.product.image}
                          alt={result.product.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="text-4xl">🚗</div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[#333333] line-clamp-2">
                          {result.product.name}
                        </h3>
                        <button
                          onClick={() => handleToggleFavorite(result.product)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Heart 
                            className={`w-5 h-5 ${isInFavorites(result.product._id) ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {result.product.description}
                      </p>

                      {/* Campos coincidentes */}
                      {result.matchedFields.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Coincidencias:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.matchedFields.map((field, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Precio y relevancia */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-[#333333]">
                          ${result.product.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          {Math.round(result.relevanceScore * 100)}% relevante
                        </span>
                      </div>

                      {/* Botón de agregar al carrito */}
                      <button
                        onClick={() => handleAddToCart(result.product)}
                        className="w-full py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors font-semibold flex items-center justify-center"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
