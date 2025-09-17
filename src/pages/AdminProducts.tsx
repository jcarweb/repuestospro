import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  Download, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileText,
  BarChart3,
  Store
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  city: string;
  state: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  subcategory?: string;
  sku: string;
  originalPartCode?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  tags: string[];
  specifications: Record<string, any>;
  store: Store;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  productsByCategory: Array<{
    _id: string;
    count: number;
    avgPrice: number;
  }>;
  productsByBrand: Array<{
    _id: string;
    count: number;
  }>;
}

const AdminProducts: React.FC = () => {
  const { user, token } = useAuth();
  const { t, tWithParams } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    subcategory: '',
    sku: '',
    originalPartCode: '',
    stock: '',
    isFeatured: false,
    tags: '',
    specifications: '',
    images: '',
    storeId: ''
  });
  
  // Estados para importación
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Cargar tiendas
  const fetchStores = async () => {
    try {
      const response = await fetch('API_BASE_URL/stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStores(data.data.stores || data.data);
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    }
  };

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        status: selectedStatus
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (selectedStore !== 'all') {
        params.append('storeId', selectedStore);
      }

      const response = await fetch(`API_BASE_URL/products/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        setTotalProducts(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('API_BASE_URL/products/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchStores();
      fetchProducts();
      fetchStats();
    }
  }, [user, token, currentPage, searchTerm, selectedCategory, selectedStatus, selectedStore]);

  // Crear producto
  const handleCreateProduct = async () => {
    try {
      const response = await fetch('API_BASE_URL/products/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          name: '', description: '', price: '', category: '', brand: '', subcategory: '',
          sku: '', originalPartCode: '', stock: '', isFeatured: false, tags: '', specifications: '', images: '', storeId: ''
        });
        fetchProducts();
        fetchStats();
        alert(t('adminProducts.messages.productCreated'));
      } else {
        alert(data.message || t('adminProducts.errors.creatingProduct'));
      }
    } catch (error) {
      console.error('Error creando producto:', error);
      alert(t('adminProducts.errors.connection'));
    }
  };

  // Actualizar producto
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await fetch(`API_BASE_URL/products/admin/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        setSelectedProduct(null);
        fetchProducts();
        alert(t('adminProducts.messages.productUpdated'));
      } else {
        alert(data.message || t('adminProducts.errors.updatingProduct'));
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert(t('adminProducts.errors.connection'));
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(t('adminProducts.confirm.delete'));
    if (!confirmed) return;

    try {
      const response = await fetch(`API_BASE_URL/products/admin/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchProducts();
        fetchStats();
        alert(t('adminProducts.messages.productDeactivated'));
      } else {
        alert(data.message || t('adminProducts.errors.deactivatingProduct'));
      }
    } catch (error) {
      console.error('Error desactivando producto:', error);
      alert(t('adminProducts.errors.connection'));
    }
  };

  // Importar productos desde CSV
  const handleImportCSV = async () => {
    if (!csvFile) {
      alert(t('adminProducts.errors.selectCSV'));
      return;
    }

    if (!formData.storeId) {
      alert(t('adminProducts.errors.selectStore'));
      return;
    }

    try {
      setImporting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('csvFile', csvFile);
      formDataToSend.append('storeId', formData.storeId);

      const response = await fetch('API_BASE_URL/products/admin/import-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.success) {
        setImportResult(data.data);
        setCsvFile(null);
        fetchProducts();
        fetchStats();
        alert(tWithParams('adminProducts.messages.importSuccess', { successCount: data.data.successCount.toString() }));
      } else {
        alert(data.message || t('adminProducts.errors.importingProducts'));
      }
    } catch (error) {
      console.error('Error importando productos:', error);
      alert(t('adminProducts.errors.connection'));
    } finally {
      setImporting(false);
    }
  };

  // Abrir modal de edición
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      brand: product.brand || '',
      subcategory: product.subcategory || '',
      sku: product.sku,
      originalPartCode: product.originalPartCode || '',
      stock: product.stock.toString(),
      isFeatured: product.isFeatured,
      tags: product.tags.join(', '),
      specifications: JSON.stringify(product.specifications, null, 2),
      images: product.images.join(', '),
      storeId: product.store._id
    });
    setShowEditModal(true);
  };

  // Abrir modal de visualización
  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminProducts.access.denied')}</h2>
          <p className="text-gray-600">{t('adminProducts.access.noPermissions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#FFC300]">{t('adminProducts.title')}</h1>
        <p className="text-gray-600 dark:text-white mt-2">{t('adminProducts.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminProducts.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminProducts.stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.activeProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminProducts.stats.featured')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.featuredProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminProducts.stats.lowStock')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.lowStockProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <X className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminProducts.stats.outOfStock')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.outOfStockProducts}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('adminProducts.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminProducts.allCategories')}</option>
          {stats?.productsByCategory.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat._id} ({cat.count})</option>
          ))}
        </select>

        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminProducts.allStores')}</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>{store.name} - {store.city}</option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminProducts.allStatuses')}</option>
          <option value="active">{t('adminProducts.active')}</option>
          <option value="inactive">{t('adminProducts.inactive')}</option>
        </select>
        
        <button 
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors font-semibold"
        >
          <Upload className="w-5 h-5" />
          {t('adminProducts.importCSV')}
        </button>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          {t('adminProducts.createProduct')}
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#555555]">
            <thead className="bg-gray-50 dark:bg-[#444444]">
              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.store')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.sku')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.stock')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    {t('adminProducts.table.actions')}
                  </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#333333] divide-y divide-gray-200 dark:divide-[#555555]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">{t('adminProducts.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                    {t('adminProducts.noProducts')}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-[#444444]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.images.length > 0 ? (
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={product.images[0]} 
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Store className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.store.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{product.store.city}, {product.store.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock === 0 
                          ? 'bg-red-100 text-red-800' 
                          : product.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? t('adminProducts.status.active') : t('adminProducts.status.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openViewModal(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title={t('adminProducts.actions.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(product)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title={t('adminProducts.actions.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title={t('adminProducts.actions.deactivate')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('adminProducts.pagination.previous')}
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('adminProducts.pagination.next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                                     {tWithParams('adminProducts.pagination.showing', { start: (((currentPage - 1) * 20) + 1).toString(), end: Math.min(currentPage * 20, totalProducts).toString(), total: totalProducts.toString() })}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear producto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-[#333333]">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('adminProducts.modals.create.title')}</h3>
              <div className="space-y-4">
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                >
                  <option value="">{t('select_store')}</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>{store.name} - {store.city}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={t('adminProducts.modals.productName')}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <textarea
                  placeholder={t('adminProducts.modals.description')}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  rows={3}
                />
                <input
                  type="number"
                  placeholder={t('adminProducts.modals.price')}
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <input
                  type="text"
                  placeholder={t('adminProducts.modals.category')}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <input
                  type="text"
                  placeholder={t('adminProducts.modals.sku')}
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <input
                  type="number"
                  placeholder={t('adminProducts.modals.stock')}
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="h-4 w-4 text-[#FFC300] focus:ring-[#FFC300] border-gray-300 dark:border-[#555555] rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-white">{t('adminProducts.modals.featured')}</label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-[#555555] text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-[#666666]"
                >
                  {t('adminProducts.modals.cancel')}
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] font-semibold"
                >
                  {t('adminProducts.modals.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar producto */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-[#333333]">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('edit_product')}</h3>
              <div className="space-y-4">
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                >
                  <option value="">{t('select_store')}</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>{store.name} - {store.city}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={t('product_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <textarea
                  placeholder={t('description')}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  rows={3}
                />
                <input
                  type="number"
                  placeholder={t('price')}
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <input
                  type="text"
                  placeholder={t('category')}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <input
                  type="text"
                  placeholder={t('sku')}
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <input
                  type="number"
                  placeholder={t('stock')}
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="h-4 w-4 text-[#FFC300] focus:ring-[#FFC300] border-gray-300 dark:border-[#555555] rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-white">{t('featured_product')}</label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-[#555555] text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-[#666666]"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleUpdateProduct}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] font-semibold"
                >
                  {t('update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para importar CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-[#333333]">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('import_products_from_csv')}</h3>
              <div className="space-y-4">
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                >
                  <option value="">{t('select_store')}</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>{store.name} - {store.city}</option>
                  ))}
                </select>
                <div className="border-2 border-dashed border-gray-300 dark:border-[#555555] rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-white">
                      {csvFile ? csvFile.name : t('click_to_select_csv_file')}
                    </p>
                  </label>
                </div>
                <div className="text-sm text-gray-600 dark:text-white">
                  <p className="font-medium">{t('required_format')}:</p>
                  <p className="break-all overflow-wrap-anywhere">{t('csv_format_requirement')}</p>
                </div>
                {importResult && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                             {tWithParams('adminProducts.modals.importCompleted', { successCount: importResult.successCount.toString(), errorCount: importResult.errorCount.toString() })}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-[#555555] text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-[#666666]"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleImportCSV}
                  disabled={!csvFile || !formData.storeId || importing}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] disabled:opacity-50 font-semibold"
                >
                  {importing ? t('importing') : t('import')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-[#333333]">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('product_details')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('name')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('description')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('store')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.store.name} - {selectedProduct.store.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('price')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">${selectedProduct.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('category')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('sku')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('stock')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.stock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('status')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.isActive ? t('active') : t('inactive')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-white">{t('featured')}:</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedProduct.isFeatured ? t('yes') : t('no')}</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] font-semibold"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 