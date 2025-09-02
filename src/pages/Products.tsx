import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  ShoppingCart, 
  Heart,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  category: string;
  subcategory: string;
  stock: number;
  rating?: number;
  reviews?: number;
  isOnSale?: boolean;
  discountPercentage?: number;
  popularity?: number;
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

const Products: React.FC = () => {
  const { t } = useLanguage();
  const { forceUpdate } = useLanguageChange();
  
  // Estados principales
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(20);
  
  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedBrand !== 'all' && { brand: selectedBrand }),
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max })
      });

      const response = await fetch(`http://localhost:5000/api/products?${params}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Productos cargados:', data.data.products);
        console.log('Primer producto:', data.data.products[0]);
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        setTotalProducts(data.data.pagination.total);
      } else {
        setError('Error al cargar los productos');
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // Cargar marcas únicas
  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/brands');
      const data = await response.json();
      
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Error cargando marcas:', error);
    }
  };

  // Efectos
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy, sortOrder]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1);
    if (key === 'category') setSelectedCategory(value);
    if (key === 'brand') setSelectedBrand(value);
    if (key === 'sortBy') setSortBy(value);
    if (key === 'sortOrder') setSortOrder(value);
  };

  const handlePriceRangeChange = (key: string, value: string) => {
    setCurrentPage(1);
    setPriceRange(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('popularity');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Función para obtener la URL correcta de la imagen del producto
  const getProductImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) {
      return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    }
    
    // Si la URL ya es completa (http/https), usarla tal como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Si es una URL relativa, construir la URL completa
    if (imageUrl.startsWith('/')) {
      return `http://localhost:5000${imageUrl}`;
    }
    
    // Si no tiene protocolo, asumir que es relativa al backend
    return `http://localhost:5000/${imageUrl}`;
  };

  // Renderizado de productos
  const renderProduct = (product: Product) => (
    <div key={product._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Imagen del producto */}
      <div className="relative">
        <img
          src={getProductImageUrl(product.image)}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-xl"
          onLoad={() => console.log('Imagen cargada exitosamente:', product.name)}
          onError={(e) => {
            console.error('Error cargando imagen para:', product.name, 'URL:', getProductImageUrl(product.image));
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isOnSale && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
              Sin Stock
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
            <ShoppingCart className="w-4 h-4 text-gray-400 hover:text-blue-500" />
          </button>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs text-gray-500 capitalize">
            {product.brand}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 capitalize">
            {product.subcategory}
          </span>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Precio */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-[#FFC300]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">
              {product.popularity || 0}
            </span>
          </div>
        </div>

        {/* Stock y acciones */}
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full ${
            product.stock > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </span>
          
          <Link 
            to={`/product/${product._id}`}
            className="flex items-center space-x-1 text-[#FFC300] hover:text-[#E6B800]"
          >
            <span>Ver</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  // Renderizado de productos en modo lista
  const renderProductList = (product: Product) => (
    <div key={product._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4">
      <div className="flex items-center space-x-4">
        {/* Imagen */}
        <img
          src={getProductImageUrl(product.image)}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/100x100?text=Sin+Imagen';
          }}
        />
        
        {/* Información */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Marca: {product.brand}</span>
            <span>Categoría: {product.subcategory}</span>
            <span>Stock: {product.stock}</span>
          </div>
        </div>
        
        {/* Precio y acciones */}
        <div className="text-right">
          <div className="text-xl font-bold text-[#FFC300] mb-2">
            {formatPrice(product.price)}
          </div>
          <Link 
            to={`/product/${product._id}`}
            className="inline-flex items-center px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFC300] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#333333]">
                Todos los Productos
              </h1>
              <p className="text-gray-600 mt-1">
                {totalProducts} productos disponibles
              </p>
            </div>
            
            {/* Controles de vista */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#FFC300] text-[#333333] p-2 rounded-md hover:bg-[#E6B800] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filtros laterales */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#FFC300] hover:text-[#E6B800]"
                  >
                    Limpiar
                  </button>
                </div>

                {/* Categorías */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Categorías</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        checked={selectedCategory === 'all'}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Todas</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category._id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.name}
                          checked={selectedCategory === category.name}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Marcas */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Marcas</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        value="all"
                        checked={selectedBrand === 'all'}
                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Todas</span>
                    </label>
                    {brands.slice(0, 10).map((brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="radio"
                          name="brand"
                          value={brand}
                          checked={selectedBrand === brand}
                          onChange={(e) => handleFilterChange('brand', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rango de precios */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Rango de Precios</h4>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Precio mínimo"
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Precio máximo"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Ordenamiento */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Ordenar por</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="popularity">Popularidad</option>
                    <option value="price">Precio</option>
                    <option value="name">Nombre</option>
                    <option value="createdAt">Más recientes</option>
                  </select>
                </div>

                {/* Orden */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Orden</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={sortOrder === 'desc'}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Descendente</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={sortOrder === 'asc'}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Ascendente</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de productos */}
          <div className="flex-1">
            {/* Debug info - temporal para diagnosticar */}
            {products.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Debug Info:</h4>
                <p className="text-sm text-blue-700">
                  Productos cargados: {products.length} | 
                  Primer producto: {products[0]?.name} | 
                  Imagen del primer producto: {products[0]?.image ? 'Sí' : 'No'} | 
                  URL: {products[0]?.image || 'Vacío'}
                </p>
              </div>
            )}
            
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <X className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar productos</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600">Intenta ajustar los filtros o la búsqueda</p>
              </div>
            ) : (
              <>
                {/* Grid/List de productos */}
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
                }>
                  {products.map(viewMode === 'grid' ? renderProduct : renderProductList)}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 rounded-lg border ${
                                currentPage === page
                                  ? 'bg-[#FFC300] text-[#333333] border-[#FFC300]'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 3 ||
                          page === currentPage + 3
                        ) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
