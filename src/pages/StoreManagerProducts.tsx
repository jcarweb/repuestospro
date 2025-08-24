import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Upload, Download, MoreVertical } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import ProductForm from '../components/ProductForm';
import ImportCSVModal from '../components/ImportCSVModal';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand?: string;
  subcategory?: string;
  sku: string;
  originalPartCode?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications: Record<string, any>;
  store: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

const StoreManagerProducts: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(20);
  
  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estados de acciones
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Cargar productos
  const loadProducts = async () => {
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
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedStore !== 'all' && { storeId: selectedStore })
      });

      const response = await fetch(`/api/products/store-manager/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      setProducts(data.data.products);
      setTotalPages(data.data.pagination.totalPages);
      setTotalProducts(data.data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await fetch('/api/products/store-manager/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadProducts();
    loadStats();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, selectedStore, sortBy, sortOrder]);

  // Crear producto
  const handleCreateProduct = async (productData: any) => {
    try {
      setActionLoading('creating');
      
      const response = await fetch('/api/products/store-manager/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear producto');
      }

      setShowCreateModal(false);
      loadProducts();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  };

  // Actualizar producto
  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return;
    
    try {
      setActionLoading('updating');
      
      const response = await fetch(`/api/products/store-manager/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar producto');
      }

      setShowEditModal(false);
      setSelectedProduct(null);
      loadProducts();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      setActionLoading(`deleting-${productId}`);
      
      const response = await fetch(`/api/products/store-manager/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar producto');
      }

      loadProducts();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle estado del producto
  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      setActionLoading(`toggling-${productId}`);
      
      const response = await fetch(`/api/products/store-manager/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      loadProducts();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (product: Product) => {
    if (!product.isActive) return 'bg-alert-100 text-alert-800';
    if (product.stock === 0) return 'bg-alert-100 text-alert-800';
    if (product.stock < 10) return 'bg-racing-100 text-racing-800';
    return 'bg-primary-100 text-primary-800';
  };

  // Función para obtener el texto del estado
  const getStatusText = (product: Product) => {
    if (!product.isActive) return 'Inactivo';
    if (product.stock === 0) return 'Sin Stock';
    if (product.stock < 10) return 'Stock Bajo';
    return 'Activo';
  };

  // Función para formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
        <p className="text-gray-600 mt-2">Administra el catálogo de productos de tu tienda</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-racing-500">{stats.totalProducts}</div>
            <div className="text-sm text-carbon-500">Total Productos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-primary-600">{stats.activeProducts}</div>
            <div className="text-sm text-carbon-500">Activos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-racing-600">{stats.featuredProducts}</div>
            <div className="text-sm text-carbon-500">Destacados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-racing-400">{stats.lowStockProducts}</div>
            <div className="text-sm text-carbon-500">Stock Bajo</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-alert-600">{stats.outOfStockProducts}</div>
            <div className="text-sm text-carbon-500">Sin Stock</div>
          </div>
        </div>
      )}

      {/* Controles superiores */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            <option value="motor">Motor</option>
            <option value="frenos">Frenos</option>
            <option value="suspension">Suspensión</option>
            <option value="transmision">Transmisión</option>
            <option value="electrico">Eléctrico</option>
            <option value="carroceria">Carrocería</option>
            <option value="accesorios">Accesorios</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Fecha de creación</option>
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
            <option value="stock">Stock</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-racing-500 text-white rounded-lg hover:bg-racing-600 transition-colors"
          disabled={actionLoading === 'creating'}
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionLoading === 'creating' ? 'Creando...' : 'Agregar Producto'}
        </button>
        
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          disabled={actionLoading === 'importing'}
        >
          <Upload className="h-4 w-4 mr-2" />
          {actionLoading === 'importing' ? 'Importando...' : 'Importar CSV'}
        </button>
        
        <button className="flex items-center px-4 py-2 bg-carbon-600 text-white rounded-lg hover:bg-carbon-700 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-alert-50 border border-alert-200 rounded-lg">
          <p className="text-alert-600">{error}</p>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.images && product.images.length > 0 ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.images[0]}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        {product.brand && (
                          <div className="text-xs text-gray-400">{product.brand}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{product.category}</div>
                      {product.subcategory && (
                        <div className="text-gray-500">{product.subcategory}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{formatPrice(product.price)}</div>
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-racing-100 text-racing-800">
                        Destacado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{product.stock} unidades</div>
                    {product.originalPartCode && (
                      <div className="text-xs text-gray-500">Código: {product.originalPartCode}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product)}`}>
                      {getStatusText(product)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowViewModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                        className="text-racing-600 hover:text-racing-900"
                        title="Editar"
                        disabled={actionLoading === `updating`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product._id, product.isActive)}
                        className={`${product.isActive ? 'text-racing-600 hover:text-racing-900' : 'text-primary-600 hover:text-primary-900'}`}
                        title={product.isActive ? 'Desactivar' : 'Activar'}
                        disabled={actionLoading === `toggling-${product._id}`}
                      >
                        {product.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-alert-600 hover:text-alert-900"
                        title="Eliminar"
                        disabled={actionLoading === `deleting-${product._id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * limit) + 1} a {Math.min(currentPage * limit, totalProducts)} de {totalProducts} resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                                 <button
                   key={page}
                   onClick={() => setCurrentPage(page)}
                   className={`px-3 py-2 border rounded-md text-sm ${
                     currentPage === page
                       ? 'bg-racing-500 text-white border-racing-500'
                       : 'border-carbon-300 text-carbon-700 hover:bg-carbon-50'
                   }`}
                 >
                   {page}
                 </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Crear Nuevo Producto</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setShowCreateModal(false)}
              isLoading={actionLoading === 'creating'}
            />
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Producto</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ProductForm
              onSubmit={handleUpdateProduct}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedProduct(null);
              }}
              initialData={selectedProduct}
              isEditing={true}
              isLoading={actionLoading === 'updating'}
            />
          </div>
        </div>
      )}

      {/* Modal de vista detallada */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles del Producto</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Imágenes */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Imágenes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.sku}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <p className="mt-1 text-sm text-gray-900">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.stock} unidades</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.brand || 'No especificada'}</p>
                </div>
              </div>
              
              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProduct.description}</p>
              </div>
              
              {/* Estado */}
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct)}`}>
                  {getStatusText(selectedProduct)}
                </span>
                                 {selectedProduct.isFeatured && (
                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-racing-100 text-racing-800">
                     Destacado
                   </span>
                 )}
              </div>
              
              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Creado</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedProduct.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Actualizado</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedProduct.updatedAt)}</p>
                </div>
              </div>
            </div>
                     </div>
         </div>
       )}

       {/* Modal de importación CSV */}
       <ImportCSVModal
         isOpen={showImportModal}
         onClose={() => setShowImportModal(false)}
         onSuccess={() => {
           setShowImportModal(false);
           loadProducts();
           loadStats();
         }}
       />
     </div>
   );
 };

export default StoreManagerProducts;
