import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Star,
  Eye,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Tag,
  BarChart3,
  Grid,
  List,
  SortAsc,
  SortDesc,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  specifications: ProductSpecification[];
  compatibleVehicles: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  supplier?: string;
  leadTime?: string;
  warranty?: string;
  salesCount: number;
  viewsCount: number;
  lastSold?: string;
  tags: string[];
}

interface ProductSpecification {
  name: string;
  value: string;
}

interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  averagePrice: number;
  topSelling: Product[];
  lowStockProducts: Product[];
}

const SellerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const categories = [
    'Motores',
    'Frenos',
    'Suspensión',
    'Transmisión',
    'Eléctrico',
    'Filtros',
    'Aceites',
    'Neumáticos',
    'Accesorios',
    'Herramientas',
  ];

  const brands = [
    'Mann-Filter',
    'Brembo',
    'ACDelco',
    'Bosch',
    'NGK',
    'Denso',
    'Mobil',
    'Castrol',
    'Michelin',
    'Bridgestone',
  ];

  const stockOptions = [
    { value: 'all', label: 'Todos los productos' },
    { value: 'in-stock', label: 'En stock' },
    { value: 'low-stock', label: 'Stock bajo' },
    { value: 'out-of-stock', label: 'Sin stock' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'stock', label: 'Stock' },
    { value: 'rating', label: 'Calificación' },
    { value: 'salesCount', label: 'Ventas' },
    { value: 'viewsCount', label: 'Visualizaciones' },
    { value: 'lastSold', label: 'Última venta' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock products data
      const mockProducts: Product[] = [
        {
          _id: 'prod1',
          name: 'Filtro de Aceite Motor',
          description: 'Filtro de aceite de alta calidad para motores de gasolina',
          price: 25.00,
          originalPrice: 30.00,
          image: '/api/placeholder/200/200',
          category: 'Filtros',
          subcategory: 'Filtros de Aceite',
          brand: 'Mann-Filter',
          stock: 50,
          rating: 4.5,
          reviews: 23,
          specifications: [
            { name: 'Tipo', value: 'Filtro de Aceite' },
            { name: 'Material', value: 'Papel Filtro' },
            { name: 'Compatibilidad', value: 'Toyota Corolla 2015-2020' },
          ],
          compatibleVehicles: ['Toyota Corolla 2015-2020', 'Honda Civic 2016-2021'],
          isOnSale: true,
          discountPercentage: 17,
          supplier: 'Distribuidora Central',
          leadTime: '2-3 días',
          warranty: '12 meses',
          salesCount: 45,
          viewsCount: 120,
          lastSold: '2023-10-26T14:30:00Z',
          tags: ['Popular', 'Descuento'],
        },
        {
          _id: 'prod2',
          name: 'Pastillas de Freno Delanteras',
          description: 'Pastillas de freno cerámicas para mejor rendimiento',
          price: 45.00,
          image: '/api/placeholder/200/200',
          category: 'Frenos',
          subcategory: 'Pastillas de Freno',
          brand: 'Brembo',
          stock: 5,
          rating: 4.8,
          reviews: 45,
          specifications: [
            { name: 'Tipo', value: 'Pastillas Cerámicas' },
            { name: 'Material', value: 'Cerámica' },
            { name: 'Compatibilidad', value: 'Nissan Sentra 2014-2019' },
          ],
          compatibleVehicles: ['Nissan Sentra 2014-2019', 'Mazda 3 2013-2018'],
          supplier: 'Frenos Premium',
          leadTime: '1-2 días',
          warranty: '24 meses',
          salesCount: 32,
          viewsCount: 89,
          lastSold: '2023-10-25T16:20:00Z',
          tags: ['Stock Bajo', 'Premium'],
        },
        {
          _id: 'prod3',
          name: 'Batería 12V 60Ah',
          description: 'Batería de plomo-ácido para vehículos',
          price: 120.00,
          image: '/api/placeholder/200/200',
          category: 'Eléctrico',
          subcategory: 'Baterías',
          brand: 'ACDelco',
          stock: 0,
          rating: 4.3,
          reviews: 67,
          specifications: [
            { name: 'Voltaje', value: '12V' },
            { name: 'Capacidad', value: '60Ah' },
            { name: 'Tipo', value: 'Plomo-Ácido' },
          ],
          compatibleVehicles: ['Chevrolet Aveo 2010-2015', 'Ford Focus 2012-2018'],
          supplier: 'Baterías del Norte',
          leadTime: '3-5 días',
          warranty: '36 meses',
          salesCount: 28,
          viewsCount: 156,
          lastSold: '2023-10-24T10:15:00Z',
          tags: ['Sin Stock', 'Garantía Extendida'],
        },
        {
          _id: 'prod4',
          name: 'Aceite Motor 5W-30',
          description: 'Aceite sintético para motores modernos',
          price: 35.00,
          originalPrice: 40.00,
          image: '/api/placeholder/200/200',
          category: 'Aceites',
          subcategory: 'Aceites de Motor',
          brand: 'Mobil',
          stock: 100,
          rating: 4.6,
          reviews: 89,
          specifications: [
            { name: 'Viscosidad', value: '5W-30' },
            { name: 'Tipo', value: 'Sintético' },
            { name: 'Capacidad', value: '4L' },
          ],
          compatibleVehicles: ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra'],
          isOnSale: true,
          discountPercentage: 12,
          supplier: 'Lubricantes Pro',
          leadTime: '1 día',
          warranty: 'N/A',
          salesCount: 67,
          viewsCount: 234,
          lastSold: '2023-10-26T09:45:00Z',
          tags: ['Más Vendido', 'Descuento'],
        },
      ];

      // Calculate stats
      const total = mockProducts.length;
      const inStock = mockProducts.filter(p => p.stock > 10).length;
      const lowStock = mockProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = mockProducts.filter(p => p.stock === 0).length;
      const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
      const averagePrice = mockProducts.reduce((sum, p) => sum + p.price, 0) / total;
      const topSelling = [...mockProducts].sort((a, b) => b.salesCount - a.salesCount).slice(0, 3);
      const lowStockProducts = mockProducts.filter(p => p.stock > 0 && p.stock <= 10);

      setProducts(mockProducts);
      setStats({
        total,
        inStock,
        lowStock,
        outOfStock,
        totalValue,
        averagePrice,
        topSelling,
        lowStockProducts,
      });
    } catch (err) {
      setError('Error al cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
    
    let matchesStock = true;
    switch (filterStock) {
      case 'in-stock':
        matchesStock = product.stock > 10;
        break;
      case 'low-stock':
        matchesStock = product.stock > 0 && product.stock <= 10;
        break;
      case 'out-of-stock':
        matchesStock = product.stock === 0;
        break;
    }
    
    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'stock':
        aValue = a.stock;
        bValue = b.stock;
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'salesCount':
        aValue = a.salesCount;
        bValue = b.salesCount;
        break;
      case 'viewsCount':
        aValue = a.viewsCount;
        bValue = b.viewsCount;
        break;
      case 'lastSold':
        aValue = new Date(a.lastSold || 0).getTime();
        bValue = new Date(b.lastSold || 0).getTime();
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', color: 'bg-red-100 text-red-800' };
    if (stock <= 10) return { label: 'Stock bajo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'En stock', color: 'bg-green-100 text-green-800' };
  };

  const handleCreateQuote = (product: Product) => {
    alert(`Cotización creada para ${product.name}`);
  };

  const handleSendToChat = (product: Product) => {
    alert(`Producto ${product.name} enviado por chat`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-600 mt-2">Gestiona los productos asignados a tu tienda</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={fetchProducts}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Marca</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
              >
                <option value="all">Todas las marcas</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
              >
                {stockOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ordenar por</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Orden</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    sortOrder === 'asc' 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <SortAsc className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    sortOrder === 'desc' 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <SortDesc className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar productos por nombre, marca o descripción..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Productos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => {
            const stockStatus = getStockStatus(product.stock);
            
            return (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                      
                      <div className="flex items-center mt-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                        {product.discountPercentage && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Stock: {product.stock}
                        </span>
                      </div>

                      <div className="mt-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>

                      <div className="flex items-center mt-3 space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateQuote(product);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Cotizar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendToChat(product);
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.map(product => {
                  const stockStatus = getStockStatus(product.stock);
                  
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand} • {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.salesCount}</div>
                        <div className="text-sm text-gray-500">{product.viewsCount} vistas</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-900">{product.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">({product.reviews})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCreateQuote(product)}
                            className="text-green-600 hover:text-green-900"
                            title="Crear cotización"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendToChat(product)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Enviar por chat"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Producto */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  
                  {/* Estadísticas de ventas */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Estadísticas de Ventas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedProduct.salesCount}</div>
                        <div className="text-sm text-gray-500">Ventas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedProduct.viewsCount}</div>
                        <div className="text-sm text-gray-500">Visualizaciones</div>
                      </div>
                    </div>
                    {selectedProduct.lastSold && (
                      <div className="mt-4 text-center">
                        <div className="text-sm text-gray-500">Última venta:</div>
                        <div className="text-sm text-gray-900">
                          {new Date(selectedProduct.lastSold).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${selectedProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Marca:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProduct.brand}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Categoría:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProduct.category}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Stock:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProduct.stock} unidades</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Calificación:</span>
                      <div className="flex items-center ml-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-900">{selectedProduct.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({selectedProduct.reviews} reseñas)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Especificaciones</h3>
                    <div className="space-y-2">
                      {selectedProduct.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-gray-600">{spec.name}:</span>
                          <span className="text-sm text-gray-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Vehículos Compatibles</h3>
                    <div className="space-y-1">
                      {selectedProduct.compatibleVehicles.map((vehicle, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {vehicle}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleCreateQuote(selectedProduct)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Crear Cotización
                    </button>
                    <button
                      onClick={() => handleSendToChat(selectedProduct)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Enviar por Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
