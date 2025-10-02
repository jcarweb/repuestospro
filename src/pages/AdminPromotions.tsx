import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import PromotionForm from '../components/PromotionForm';
import { API_BASE_URL } from '../../config/api';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Store,
  Tag,
  DollarSign,
  Percent,
  ShoppingCart,
  FileText
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  store: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  customText?: string;
  products: Product[];
  categories?: Category[];
  store: Store;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  ribbonText: string;
  ribbonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOriginalPrice: boolean;
  showDiscountAmount: boolean;
  maxUses?: number;
  currentUses: number;
  createdAt: string;
  updatedAt: string;
}

interface PromotionStats {
  totalPromotions: number;
  activePromotions: number;
  inactivePromotions: number;
  expiringSoon: number;
  byType: {
    percentage: number;
    fixed: number;
    buy_x_get_y: number;
    custom: number;
  };
}

const AdminPromotions: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  
  // Cargar promociones
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStore !== 'all') params.append('store', selectedStore);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedStatus !== 'all') {
        params.append('isActive', selectedStatus === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""""""""""/api/promotions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('🔍 Debug - Promociones cargadas:', data);
      
      if (data.success) {
        setPromotions(data.data);
        console.log('🔍 Debug - Estado de promociones actualizado:', data.data.map((p: Promotion) => ({ id: p._id, name: p.name, isActive: p.isActive })));
      }
    } catch (error) {
      console.error('Error cargando promociones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tiendas (solo para admin)
  const fetchStores = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions/stores/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStores(data.data);
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    }
  };

  // Cargar productos
  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.role === 'admin' && selectedStore !== 'all') {
        params.append('storeId', selectedStore);
      }

      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions/products/available?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions/categories/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions/stats/overview', {
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
      fetchPromotions();
      fetchStores();
      fetchProducts();
      fetchCategories();
      fetchStats();
    }
  }, [user, token, searchTerm, selectedStore, selectedType, selectedStatus]);

  // Crear promoción
  const handleCreatePromotion = async (formData: any) => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions', {
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
        fetchPromotions();
        fetchStats();
        alert(t('adminPromotions.messages.promotionCreated'));
      } else {
        alert(data.message || t('adminPromotions.errors.creatingPromotion'));
      }
    } catch (error) {
      console.error('Error creando promoción:', error);
      alert(t('adminPromotions.errors.connection'));
    }
  };

  // Editar promoción
  const handleEditPromotion = async (formData: any) => {
    if (!selectedPromotion) return;

    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions/${selectedPromotion._id}`, {
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
        setSelectedPromotion(null);
        fetchPromotions();
        fetchStats();
        alert(t('adminPromotions.messages.promotionUpdated'));
      } else {
        alert(data.message || t('adminPromotions.errors.updatingPromotion'));
      }
    } catch (error) {
      console.error('Error actualizando promoción:', error);
      alert(t('adminPromotions.errors.connection'));
    }
  };

  // Cambiar estado de promoción (activar/desactivar)
  const handleToggleStatus = async (promotionId: string) => {
    try {
      console.log('🔍 Debug - Toggle status para promoción:', promotionId);
      
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions/${promotionId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('🔍 Debug - Respuesta del toggle:', data);
      
      if (data.success) {
        fetchPromotions();
        fetchStats();
        alert(t('adminPromotions.messages.statusUpdated'));
      } else {
        alert(data.message || t('adminPromotions.errors.updatingStatus'));
      }
    } catch (error) {
      console.error('Error cambiando estado de promoción:', error);
      alert(t('adminPromotions.errors.connection'));
    }
  };

  // Eliminar promoción
  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm(t('adminPromotions.confirm.delete'))) {
      return;
    }

    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPromotions();
        fetchStats();
        alert(t('adminPromotions.messages.promotionDeleted'));
      } else {
        alert(data.message || t('adminPromotions.errors.deletingPromotion'));
      }
    } catch (error) {
      console.error('Error eliminando promoción:', error);
      alert(t('adminPromotions.errors.connection'));
    }
  };

  // Ver detalles de promoción
  const handleViewPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowViewModal(true);
  };

  // Obtener icono de tipo de promoción
  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'buy_x_get_y': return <ShoppingCart className="w-4 h-4" />;
      case 'custom': return <FileText className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  // Obtener texto de tipo de promoción
  const getPromotionTypeText = (type: string) => {
    switch (type) {
      case 'percentage': return t('adminPromotions.promotionTypes.percentage');
      case 'fixed': return t('adminPromotions.promotionTypes.fixed');
      case 'buy_x_get_y': return t('adminPromotions.promotionTypes.buyXGetY');
      case 'custom': return t('adminPromotions.promotionTypes.custom');
      default: return type;
    }
  };

  // Verificar si la promoción está vigente
  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    return promotion.isActive && now >= startDate && now <= endDate;
  };

  // Obtener el estado de visualización de la promoción
  const getPromotionStatus = (promotion: Promotion) => {
    if (!promotion.isActive) {
      return { text: t('adminPromotions.status.inactive'), class: 'bg-red-100 text-red-800' };
    }
    
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (now < startDate) {
      return { text: t('adminPromotions.status.pending'), class: 'bg-yellow-100 text-yellow-800' };
    } else if (now > endDate) {
      return { text: t('adminPromotions.status.expired'), class: 'bg-gray-100 text-gray-800' };
    } else {
      return { text: t('adminPromotions.status.vigent'), class: 'bg-green-100 text-green-800' };
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'store_manager')) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminPromotions.accessDenied.title')}</h2>
          <p className="text-gray-600">{t('adminPromotions.accessDenied.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('adminPromotions.title')}</h1>
        <p className="text-gray-600 mt-2">{t('adminPromotions.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
                             <Gift className="w-8 h-8 text-[#FFC300]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminPromotions.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPromotions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminPromotions.stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePromotions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminPromotions.stats.inactive')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactivePromotions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminPromotions.stats.expiringSoon')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminPromotions.stats.stores')}</p>
                <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
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
            placeholder={t('adminPromotions.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          />
        </div>
        
        {user.role === 'admin' && (
                  <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
            <option value="all">{t('adminPromotions.allStores')}</option>
            {stores.map(store => (
              <option key={store._id} value={store._id}>{store.name}</option>
            ))}
          </select>
        )}

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminPromotions.allTypes')}</option>
          <option value="percentage">{t('adminPromotions.promotionTypes.percentage')}</option>
          <option value="fixed">{t('adminPromotions.promotionTypes.fixed')}</option>
          <option value="buy_x_get_y">{t('adminPromotions.promotionTypes.buyXGetY')}</option>
          <option value="custom">{t('adminPromotions.promotionTypes.custom')}</option>
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminPromotions.allStatuses')}</option>
          <option value="active">{t('adminPromotions.status.active')}</option>
          <option value="inactive">{t('adminPromotions.status.inactive')}</option>
        </select>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-white px-4 py-2 rounded-lg hover:bg-[#E6B000] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('adminPromotions.newPromotion')}
        </button>
      </div>

      {/* Lista de promociones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('adminPromotions.loading')}</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('adminPromotions.noPromotions')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('adminPromotions.createFirst')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {promotions.map(promotion => (
              <div key={promotion._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getPromotionTypeIcon(promotion.type)}
                      <div>
                        <h3 className="font-medium text-gray-900">{promotion.name}</h3>
                        <p className="text-sm text-gray-500">{promotion.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            {getPromotionTypeText(promotion.type)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {promotion.store.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {promotion.products.length} {t('adminPromotions.products')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {(() => {
                      const status = getPromotionStatus(promotion);
                      return (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.class}`}>
                          {status.text}
                        </span>
                      );
                    })()}
                    
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleViewPromotion(promotion)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title={t('adminPromotions.actions.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedPromotion(promotion);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title={t('adminPromotions.actions.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(promotion._id)}
                        className={`p-1 rounded ${
                          promotion.isActive 
                            ? 'text-orange-600 hover:text-orange-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={promotion.isActive ? t('adminPromotions.actions.deactivate') : t('adminPromotions.actions.activate')}
                      >
                        {promotion.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeletePromotion(promotion._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title={t('adminPromotions.actions.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear promoción - Aquí iría el formulario completo */}
      {showCreateModal && token && (
        <PromotionForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePromotion}
          token={token}
        />
      )}

      {/* Modal para editar promoción */}
      {showEditModal && selectedPromotion && token && (
        <PromotionForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPromotion(null);
          }}
          onSubmit={handleEditPromotion}
          promotion={selectedPromotion}
          isEditing={true}
          token={token}
        />
      )}

      {/* Modal para ver detalles de promoción */}
      {showViewModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#FFC300]">{t('adminPromotions.modals.view.title')}</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPromotion(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#FFC300]">{t('adminPromotions.modals.view.generalInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.name')}</label>
                      <p className="text-gray-900">{selectedPromotion.name}</p>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.type')}</label>
                      <div className="flex items-center space-x-2">
                        {getPromotionTypeIcon(selectedPromotion.type)}
                        <span className="text-gray-900">{getPromotionTypeText(selectedPromotion.type)}</span>
                      </div>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.status')}</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedPromotion.isActive
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPromotion.isActive ? t('adminPromotions.status.active') : t('adminPromotions.status.inactive')}
                    </span>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.store')}</label>
                      <p className="text-gray-900">{selectedPromotion.store.name}</p>
                  </div>
                </div>
                <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.description')}</label>
                    <p className="text-gray-900">{selectedPromotion.description}</p>
                </div>
              </div>

              {/* Configuración de descuento */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#FFC300]">{t('adminPromotions.modals.view.discountConfig')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPromotion.type === 'percentage' && (
                    <div>
                                              <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.discountPercentage')}</label>
                      <p className="text-gray-900">{selectedPromotion.discountPercentage}%</p>
                    </div>
                  )}
                  {selectedPromotion.type === 'fixed' && (
                    <div>
                                              <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.discountAmount')}</label>
                      <p className="text-gray-900">${selectedPromotion.discountAmount}</p>
                    </div>
                  )}
                  {selectedPromotion.type === 'buy_x_get_y' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.buyQuantity')}</label>
                        <p className="text-gray-900">{selectedPromotion.buyQuantity} {t('adminPromotions.modals.view.units')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.getQuantity')}</label>
                        <p className="text-gray-900">{selectedPromotion.getQuantity} {t('adminPromotions.modals.view.units')}</p>
                      </div>
                    </>
                  )}
                  {selectedPromotion.type === 'custom' && (
                    <div>
                                              <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.customText')}</label>
                      <p className="text-gray-900">{selectedPromotion.customText}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#FFC300]">{t('adminPromotions.modals.view.dates')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.startDate')}</label>
                    <p className="text-gray-900">
                      {new Date(selectedPromotion.startDate).toLocaleDateString()} {t('adminPromotions.modals.view.at')} {selectedPromotion.startTime}
                    </p>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.endDate')}</label>
                    <p className="text-gray-900">
                      {new Date(selectedPromotion.endDate).toLocaleDateString()} {t('adminPromotions.modals.view.at')} {selectedPromotion.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('adminPromotions.modals.view.products')} ({selectedPromotion.products.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPromotion.products.map((product) => (
                    <div key={product._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">${product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración visual */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('adminPromotions.modals.view.visualConfig')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.ribbonText')}</label>
                    <p className="text-gray-900">{selectedPromotion.ribbonText}</p>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.ribbonPosition')}</label>
                    <p className="text-gray-900">{selectedPromotion.ribbonPosition}</p>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.showOriginalPrice')}</label>
                      <p className="text-gray-900">{selectedPromotion.showOriginalPrice ? t('adminPromotions.modals.view.yes') : t('adminPromotions.modals.view.no')}</p>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.showDiscountAmount')}</label>
                      <p className="text-gray-900">{selectedPromotion.showDiscountAmount ? t('adminPromotions.modals.view.yes') : t('adminPromotions.modals.view.no')}</p>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('adminPromotions.modals.view.additionalInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.createdBy')}</label>
                    <p className="text-gray-900">{selectedPromotion.createdBy.name}</p>
                  </div>
                  <div>
                                          <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.createdAt')}</label>
                    <p className="text-gray-900">{new Date(selectedPromotion.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedPromotion.maxUses && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('adminPromotions.modals.view.usageLimit')}</label>
                      <p className="text-gray-900">{selectedPromotion.currentUses} / {selectedPromotion.maxUses}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPromotion(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                {t('adminPromotions.modals.view.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions; 