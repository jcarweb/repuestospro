import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Package,
  DollarSign,
  Star,
  Eye,
  ShoppingCart,
  MessageSquare,
  RefreshCcw,
  AlertCircle,
  XCircle,
  CheckCircle,
  Truck,
  Clock,
  Tag,
  BarChart3,
  TrendingUp,
  TrendingDown,
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
}

interface ProductSpecification {
  name: string;
  value: string;
}

interface PriceHistory {
  date: string;
  price: number;
  change: number;
}

const SellerPrices: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterPriceRange, setFilterPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
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

  const priceRanges = [
    { value: 'all', label: 'Todos los precios' },
    { value: '0-50', label: '$0 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200+', label: '$200+' },
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
          stock: 30,
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
          stock: 15,
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
        },
      ];

      setProducts(mockProducts);
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
    
    let matchesPrice = true;
    if (filterPriceRange !== 'all') {
      const [min, max] = filterPriceRange.split('-').map(Number);
      if (max) {
        matchesPrice = product.price >= min && product.price <= max;
      } else {
        matchesPrice = product.price >= min;
      }
    }
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'stock':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    
    // Simulate fetching price history
    const mockPriceHistory: PriceHistory[] = [
      { date: '2023-10-01', price: 30.00, change: 0 },
      { date: '2023-10-15', price: 28.00, change: -2.00 },
      { date: '2023-10-20', price: 25.00, change: -3.00 },
    ];
    setPriceHistory(mockPriceHistory);
  };

  const handleCreateQuote = (product: Product) => {
    // Lógica para crear cotización
    alert(`Cotización creada para ${product.name}`);
  };

  const handleSendToChat = (product: Product) => {
    // Lógica para enviar por chat
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
          <h1 className="text-3xl font-bold text-gray-900">Consulta de Precios</h1>
          <p className="text-gray-600 mt-2">Busca productos y consulta precios en tiempo real</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button
            onClick={fetchProducts}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium mb-2">Rango de Precio</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(e.target.value)}
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
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
                <option value="name">Nombre</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="rating">Calificación</option>
                <option value="stock">Stock</option>
              </select>
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

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map(product => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleProductClick(product)}
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
        ))}
      </div>

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
                  
                  {/* Información del proveedor */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Proveedor</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Proveedor:</span>
                        <span className="text-sm text-gray-900">{selectedProduct.supplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tiempo de entrega:</span>
                        <span className="text-sm text-gray-900">{selectedProduct.leadTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Garantía:</span>
                        <span className="text-sm text-gray-900">{selectedProduct.warranty}</span>
                      </div>
                    </div>
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

                  {/* Historial de precios */}
                  {priceHistory.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Historial de Precios</h3>
                      <div className="space-y-2">
                        {priceHistory.map((entry, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900">${entry.price.toFixed(2)}</span>
                              {entry.change !== 0 && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  entry.change > 0 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {entry.change > 0 ? '+' : ''}{entry.change.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

export default SellerPrices;
