import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Filter, 
  Grid, 
  List, 
  ChevronLeft, 
  Star, 
  ShoppingCart,
  Car,
  Wrench,
  Zap,
  Shield,
  Settings,
  Gauge,
  Fuel,
  Cpu,
  Wind,
  Circle
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../config/api';
import { getBrandsByVehicleType } from '../data/vehicleBrands';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vehicleType?: string;
  subcategory: string;
  brand: string;
  stock: number;
  popularity: number;
  sku: string;
  specifications: Record<string, any>;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryProductsProps {
  products: Product[];
  category: string;
  subcategories: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CategoryProducts: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  console.log('🚀 CategoryProducts component mounted with category:', category);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el icono según la categoría
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    switch (name) {
      case 'motor':
      case 'engine':
        return <Settings className="w-8 h-8" />;
      case 'frenos':
      case 'brakes':
        return <Circle className="w-8 h-8" />;
      case 'eléctrico':
      case 'electrical':
        return <Zap className="w-8 h-8" />;
      case 'refrigeración':
      case 'cooling':
        return <Wind className="w-8 h-8" />;
      case 'transmisión':
      case 'transmission':
        return <Gauge className="w-8 h-8" />;
      case 'combustible':
      case 'fuel':
        return <Fuel className="w-8 h-8" />;
      case 'dirección':
      case 'steering':
        return <Car className="w-8 h-8" />;
      case 'escape':
      case 'exhaust':
        return <Cpu className="w-8 h-8" />;
      case 'accesorios':
      case 'accessories':
        return <Package className="w-8 h-8" />;
      default:
        return <Wrench className="w-8 h-8" />;
    }
  };

  // Función para obtener el color del icono según la categoría
  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    switch (name) {
      case 'motor':
      case 'engine':
        return 'text-red-600 bg-red-100';
      case 'frenos':
      case 'brakes':
        return 'text-orange-600 bg-orange-100';
      case 'eléctrico':
      case 'electrical':
        return 'text-yellow-600 bg-yellow-100';
      case 'refrigeración':
      case 'cooling':
        return 'text-blue-600 bg-blue-100';
      case 'transmisión':
      case 'transmission':
        return 'text-purple-600 bg-purple-100';
      case 'combustible':
      case 'fuel':
        return 'text-green-600 bg-green-100';
      case 'dirección':
      case 'steering':
        return 'text-indigo-600 bg-indigo-100';
      case 'escape':
      case 'exhaust':
        return 'text-gray-600 bg-gray-100';
      case 'accesorios':
      case 'accessories':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-[#FFC300] bg-[#FFC300]/20';
    }
  };
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    vehicleType: '',
    brand: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'popularity',
    sortOrder: 'desc'
  });
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log('🔄 useEffect triggered - category:', category);
    console.log('🔄 Current filters:', filters);
    console.log('🔄 Current pagination:', pagination);
    if (category) {
      console.log('✅ Category exists, calling fetchProducts');
      fetchProducts();
    } else {
      console.log('❌ No category found in params');
    }
  }, [category, pagination.page, filters]);

  // Actualizar marcas disponibles cuando cambie el tipo de vehículo
  useEffect(() => {
    const fetchBrands = async () => {
      if (filters.vehicleType && filters.vehicleType.trim() !== '') {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/products/brands/vehicle-type/${filters.vehicleType}`);
          const data = await response.json();
          
          if (data.success) {
            setAvailableBrands(data.data);
            console.log('🔍 Marcas disponibles para', filters.vehicleType, ':', data.data);
            
            // Limpiar filtro de marca si no está disponible en el nuevo tipo de vehículo
            if (filters.brand && !data.data.includes(filters.brand)) {
              setFilters(prev => ({ ...prev, brand: '' }));
            }
          } else {
            // Fallback a datos estáticos
            const brands = getBrandsByVehicleType(filters.vehicleType);
            setAvailableBrands(brands);
            console.log('🔄 Usando marcas estáticas para', filters.vehicleType, ':', brands);
          }
        } catch (error) {
          console.error('Error obteniendo marcas:', error);
          // Fallback a datos estáticos
          const brands = getBrandsByVehicleType(filters.vehicleType);
          setAvailableBrands(brands);
          console.log('🔄 Usando marcas estáticas para', filters.vehicleType, ':', brands);
        }
      } else {
        // Si no hay tipo de vehículo seleccionado, obtener todas las marcas de la base de datos
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/products/brands`);
          const data = await response.json();
          
          if (data.success) {
            const allBrands = data.data.map((brand: any) => brand.name || brand._id).filter(Boolean);
            setAvailableBrands(allBrands);
            console.log('🔍 Todas las marcas disponibles:', allBrands);
          } else {
            setAvailableBrands([]);
          }
        } catch (error) {
          console.error('Error obteniendo todas las marcas:', error);
          setAvailableBrands([]);
        }
      }
    };

    fetchBrands();
  }, [filters.vehicleType]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de manera más explícita
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      // Agregar filtros solo si tienen valor
      if (filters.vehicleType && filters.vehicleType.trim() !== '') {
        params.append('vehicleType', filters.vehicleType);
        console.log('🔍 Agregando filtro vehicleType:', filters.vehicleType);
      }
      if (filters.brand && filters.brand.trim() !== '') {
        params.append('brand', filters.brand);
        console.log('🔍 Agregando filtro brand:', filters.brand);
      }
      if (filters.subcategory && filters.subcategory.trim() !== '') {
        params.append('subcategory', filters.subcategory);
        console.log('🔍 Agregando filtro subcategory:', filters.subcategory);
      }
      if (filters.minPrice && filters.minPrice.trim() !== '' && filters.minPrice !== '0') {
        params.append('minPrice', filters.minPrice);
        console.log('🔍 Agregando filtro minPrice:', filters.minPrice);
      }
      if (filters.maxPrice && filters.maxPrice.trim() !== '' && filters.maxPrice !== '1000000') {
        params.append('maxPrice', filters.maxPrice);
        console.log('🔍 Agregando filtro maxPrice:', filters.maxPrice);
      }
      
      console.log('🔍 Filtros actuales:', filters);
      console.log('🔍 Parámetros construidos:', params.toString());

      const url = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/products/category/${category}?${params}`;
      console.log('🔍 Cargando productos desde:', url);
      console.log('📋 Categoría:', category);
      console.log('📋 Parámetros:', params.toString());

      // Agregar timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Respuesta del servidor:', data);
      
      if (data.success) {
        console.log('✅ Productos cargados:', data.data.products?.length || 0);
        console.log('📄 Datos completos:', data.data);
        setProducts(data.data.products || []);
        setPagination(data.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
        setSubcategories(data.data.subcategories || []);
      } else {
        console.error('❌ Error en respuesta:', data.message);
        setError(data.message || 'Error al cargar los productos');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      if (error.name === 'AbortError') {
        setError('Tiempo de espera agotado. Verifica que el servidor esté ejecutándose.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('No se pudo conectar al servidor. Verifica que el backend esté ejecutándose en el puerto 3001.');
      } else {
        setError(`Error de conexión: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/categories')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(category || '')}`}>
                {getCategoryIcon(category || '')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#333333] capitalize">
                  {category}
                </h1>
                <p className="text-gray-600">
                  {pagination.total} productos disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] border border-[#FFC300] rounded-lg hover:bg-[#FFB800] transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Vehículo
                  </label>
                  <select
                    value={filters.vehicleType}
                    onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="automovil">Automóviles</option>
                    <option value="motocicleta">Motocicletas</option>
                    <option value="camion">Camiones</option>
                    <option value="maquinaria_industrial">Maquinaria Industrial</option>
                    <option value="maquinaria_agricola">Maquinaria Agrícola</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  >
                    <option value="">
                      Todas las marcas
                    </option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand.toLowerCase()}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategoría
                  </label>
                  <select
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  >
                    <option value="">Todas las subcategorías</option>
                    {subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio mínimo
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio máximo
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="1000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Productos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {console.log('🎨 Renderizando productos:', products.length, products)}
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`px-3 py-2 rounded-lg ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros o busca en otra categoría.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts; 