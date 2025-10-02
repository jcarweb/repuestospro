import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import PromotionForm from '../components/PromotionForm';

import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Star,
  DollarSign,
  Percent,
  Package,
  Users,
  ShoppingCart,
  X,
  Crown
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  sku: string;
  category: {
    _id: string;
    name: string;
  };
  isActive: boolean;
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
  store: {
    _id: string;
    name: string;
  };
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
  expiredPromotions: number;
  upcomingPromotions: number;
  totalUses: number;
  averageDiscount: number;
  topPerformingPromotion?: {
    name: string;
    uses: number;
  };
}

const StoreManagerPromotions: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const { activeStore } = useActiveStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados principales
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [limit] = useState(20);
  
  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  
  // Estados de acciones
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado para verificar acceso a promociones
  const [promotionsAccess, setPromotionsAccess] = useState<{
    hasAccess: boolean;
    reason?: string;
    subscription?: any;
    requiresUpgrade?: boolean;
  } | null>(null);

  // Detectar acción desde URL
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateModal(true);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

    // Cargar promociones
  const loadPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si hay token válido
      if (!token) {
        setError('Debes iniciar sesión para ver las promociones');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      console.log('🔍 Cargando promociones con parámetros:', params.toString());

      const response = await fetch(`/api/promotions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔍 Error en respuesta:', errorData);
        
        if (response.status === 401) {
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (response.status === 403) {
          setError('No tienes permisos para ver las promociones de esta tienda.');
        } else if (response.status === 404) {
          setError('No se encontraron promociones para esta tienda.');
        } else {
          setError(errorData.message || 'Error al cargar promociones. Verifica tu conexión.');
        }
        return;
      }

      const data = await response.json();
      console.log('🔍 Datos recibidos:', data);
      
      // Verificar si la respuesta tiene el formato esperado
      if (data.success === false) {
        setError(data.message || 'Error al cargar promociones');
        return;
      }
      
      // Manejar diferentes formatos de respuesta
      const promotionsData = data.promotions || data.data || [];
      const totalPagesData = data.totalPages || 1;
      const totalData = data.total || promotionsData.length;
      
      console.log('🔍 Promociones procesadas:', {
        count: promotionsData.length,
        totalPages: totalPagesData,
        total: totalData,
        isArray: Array.isArray(promotionsData)
      });
      
      setPromotions(promotionsData);
      setTotalPages(totalPagesData);
      setTotalPromotions(totalData);
    } catch (err) {
      console.error('Error cargando promociones:', err);
      setError('Error de conexión. Verifica que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

    // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await fetch('/api/promotions/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

    // Verificar acceso a promociones
  const checkPromotionsAccess = async () => {
    if (!activeStore) return;

    try {
      const response = await fetch(`/api/promotions/check-access?storeId=${activeStore._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromotionsAccess(data);
      }
    } catch (error) {
      console.error('Error verificando acceso a promociones:', error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (activeStore) {
      loadPromotions();
      loadStats();
      checkPromotionsAccess();
    }
  }, [activeStore, currentPage, searchTerm, selectedType, selectedStatus, sortBy, sortOrder]);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Manejar filtros
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'type':
        setSelectedType(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'sortOrder':
        setSortOrder(value);
        break;
    }
    setCurrentPage(1);
  };

  // Manejar activar/desactivar promoción
  const handleToggleStatus = async (promotionId: string, currentStatus: boolean) => {
    try {
      setActionLoading(promotionId);
      
      const response = await fetch(`/api/promotions/${promotionId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadPromotions();
        await loadStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  };

  // Manejar crear promoción
  const handleCreatePromotion = async (data: any) => {
    try {
      setFormLoading(true);
      console.log('🔍 Creando promoción con datos:', data);
      
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log('🔍 Respuesta de creación:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('🔍 Promoción creada exitosamente:', responseData);
        
        console.log('🔍 Recargando promociones...');
        await loadPromotions();
        console.log('🔍 Recargando estadísticas...');
        await loadStats();
        
        setShowCreateModal(false);
        console.log('🔍 Modal cerrado, promoción creada y lista actualizada');
      } else {
        const errorData = await response.json();
        console.error('🔍 Error al crear promoción:', errorData);
        throw new Error(errorData.message || 'Error al crear promoción');
      }
    } catch (err) {
      console.error('🔍 Error en handleCreatePromotion:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  // Manejar editar promoción
  const handleEditPromotion = async (data: any) => {
    if (!selectedPromotion) return;

    try {
      setFormLoading(true);
      
      const response = await fetch(`/api/promotions/${selectedPromotion._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadPromotions();
        await loadStats();
        setShowEditModal(false);
        setSelectedPromotion(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar promoción');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  // Manejar eliminar promoción
  const handleDeletePromotion = async (promotionId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      return;
    }

    try {
      setActionLoading(promotionId);
      
      const response = await fetch(`/api/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadPromotions();
        await loadStats();
      } else {
        throw new Error('Error al eliminar promoción');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActionLoading(null);
    }
  };

  // Obtener texto del tipo de promoción
  const getPromotionTypeText = (type: string) => {
    switch (type) {
      case 'percentage': return 'Porcentaje';
      case 'fixed': return 'Monto fijo';
      case 'buy_x_get_y': return 'Compra X, obtén Y';
      case 'custom': return 'Personalizado';
      default: return type;
    }
  };

  // Obtener texto del descuento
  const getDiscountText = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.discountPercentage}%`;
      case 'fixed':
        return `$${promotion.discountAmount}`;
      case 'buy_x_get_y':
        return `${promotion.buyQuantity}x${promotion.getQuantity}`;
      case 'custom':
        return promotion.customText || 'Personalizado';
      default:
        return 'N/A';
    }
  };

  // Verificar si la promoción está activa
  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    return promotion.isActive && now >= startDate && now <= endDate;
  };

  // Verificar si la promoción está expirada
  const isPromotionExpired = (promotion: Promotion) => {
    const now = new Date();
    const endDate = new Date(promotion.endDate);
    return now > endDate;
  };

  // Verificar si la promoción está próxima
  const isPromotionUpcoming = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    return now < startDate;
  };

  if (!activeStore) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('promotions.noActiveStore.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('promotions.noActiveStore.description')}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de restricción si no hay acceso
  if (promotionsAccess && !promotionsAccess.hasAccess) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Crown className="h-12 w-12 text-purple-500 dark:text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('promotions.premium.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {promotionsAccess.reason || t('promotions.premium.description')}
          </p>
          
          {promotionsAccess.requiresUpgrade && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                {t('promotions.premium.upgradeTitle')}
              </h3>
              <p className="text-purple-700 dark:text-purple-300 mb-4">
                {t('promotions.premium.upgradeDescription')}
              </p>
                             <button
                 onClick={() => {
                   console.log('🔄 Botón "Ver Planes Disponibles" clickeado');
                   setShowUpgradeModal(true);
                 }}
                 className="bg-racing-500 hover:bg-racing-600 text-white px-6 py-2 rounded-lg transition-colors shadow-sm"
               >
                 {t('promotions.premium.viewPlans')}
               </button>
            </div>
          )}
        </div>

        {/* Modal de Upgrade */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('promotions.premium.modal.title')}</h2>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <Crown className="h-12 w-12 text-purple-500 dark:text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('promotions.premium.modal.subtitle')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('promotions.premium.modal.description')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">{t('promotions.premium.modal.proPlan.title')}</h4>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>✅ {t('promotions.premium.modal.proPlan.feature1')}</li>
                      <li>✅ {t('promotions.premium.modal.proPlan.feature2')}</li>
                      <li>✅ {t('promotions.premium.modal.proPlan.feature3')}</li>
                      <li>✅ {t('promotions.premium.modal.proPlan.feature4')}</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">{t('promotions.premium.modal.elitePlan.title')}</h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>✅ {t('promotions.premium.modal.elitePlan.feature1')}</li>
                      <li>✅ {t('promotions.premium.modal.elitePlan.feature2')}</li>
                      <li>✅ {t('promotions.premium.modal.elitePlan.feature3')}</li>
                      <li>✅ {t('promotions.premium.modal.elitePlan.feature4')}</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {user?.role === 'admin' ? (
                                         <button
                       onClick={() => {
                         setShowUpgradeModal(false);
                         navigate('/admin/monetization');
                       }}
                       className="w-full bg-racing-500 hover:bg-racing-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                     >
                       {t('promotions.premium.modal.managePlans')}
                     </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {t('promotions.premium.modal.contactAdmin')}
                      </p>
                                             <button
                         onClick={() => setShowUpgradeModal(false)}
                         className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                       >
                         {t('promotions.premium.modal.understood')}
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('promotions.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {t('promotions.subtitle').replace('{storeName}', activeStore.name)}
          </p>
        </div>
                 <button
           onClick={() => setShowCreateModal(true)}
           className="bg-racing-500 hover:bg-racing-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
         >
           <Plus className="h-5 w-5" />
           {t('promotions.newPromotion')}
         </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('promotions.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPromotions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('promotions.stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePromotions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('promotions.stats.upcoming')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingPromotions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('promotions.stats.expired')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expiredPromotions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder={t('promotions.search.placeholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t('promotions.filters.allTypes')}</option>
              <option value="percentage">{t('promotions.filters.percentage')}</option>
              <option value="fixed">{t('promotions.filters.fixed')}</option>
              <option value="buy_x_get_y">{t('promotions.filters.buyXGetY')}</option>
              <option value="custom">{t('promotions.filters.custom')}</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t('promotions.filters.allStatuses')}</option>
              <option value="active">{t('promotions.filters.active')}</option>
              <option value="inactive">{t('promotions.filters.inactive')}</option>
              <option value="expired">{t('promotions.filters.expired')}</option>
              <option value="upcoming">{t('promotions.filters.upcoming')}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="createdAt">{t('promotions.filters.sortBy.createdAt')}</option>
              <option value="name">{t('promotions.filters.sortBy.name')}</option>
              <option value="startDate">{t('promotions.filters.sortBy.startDate')}</option>
              <option value="endDate">{t('promotions.filters.sortBy.endDate')}</option>
              <option value="currentUses">{t('promotions.filters.sortBy.uses')}</option>
            </select>

            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de promociones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">{t('promotions.loading')}</p>
          </div>
                          ) : error ? (
           <div className="p-8 text-center">
             <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-4" />
             <p className="text-red-600 dark:text-red-400">{error}</p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
               {error.includes('sesión') || error.includes('autenticado')
                 ? '💡 Inicia sesión para acceder a las promociones de tu tienda'
                 : error.includes('permisos')
                 ? '💡 Verifica que tengas permisos para gestionar promociones'
                 : '💡 Verifica tu conexión e intenta nuevamente'
               }
             </p>
             {!error.includes('sesión') && !error.includes('autenticado') && (
               <button
                 onClick={loadPromotions}
                 className="mt-4 bg-racing-500 hover:bg-racing-600 text-white px-4 py-2 rounded-lg transition-colors"
               >
                 {t('promotions.retry')}
               </button>
             )}
           </div>
                          ) : promotions.length === 0 ? (
           <div className="p-8 text-center">
             <Tag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
               {t('promotions.noPromotions.title')}
             </h3>
             <p className="text-gray-600 dark:text-gray-300 mb-4">
               {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                 ? t('promotions.noPromotions.filtered')
                 : t('promotions.noPromotions.empty')}
             </p>
             {!searchTerm && selectedType === 'all' && selectedStatus === 'all' && (
               <button
                 onClick={() => setShowCreateModal(true)}
                 className="bg-racing-500 hover:bg-racing-600 text-white px-4 py-2 rounded-lg transition-colors"
               >
                 {t('promotions.createFirst')}
               </button>
             )}
           </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('promotions.table.promotion')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('promotions.table.type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('promotions.table.dates')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('promotions.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('promotions.table.uses')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('promotions.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {promotions.map((promotion) => (
                    <tr key={promotion._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {promotion.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {promotion.description}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                            {t('promotions.table.createdBy').replace('{name}', promotion.createdBy.name)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {getPromotionTypeText(promotion.type)}
                          </span>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">
                            {getDiscountText(promotion)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <div>{t('promotions.table.startDate')}: {new Date(promotion.startDate).toLocaleDateString()}</div>
                          <div>{t('promotions.table.endDate')}: {new Date(promotion.endDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isPromotionActive(promotion) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('promotions.status.active')}
                          </span>
                        ) : isPromotionExpired(promotion) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            {t('promotions.status.expired')}
                          </span>
                        ) : isPromotionUpcoming(promotion) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('promotions.status.upcoming')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {t('promotions.status.inactive')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                          {promotion.currentUses}
                          {promotion.maxUses && (
                            <span className="text-gray-500 dark:text-gray-400">/ {promotion.maxUses}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPromotion(promotion);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            title={t('promotions.actions.viewDetails')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPromotion(promotion);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                            title={t('promotions.actions.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(promotion._id, promotion.isActive)}
                            disabled={actionLoading === promotion._id}
                            className={`transition-colors ${
                              promotion.isActive 
                                ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300' 
                                : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                            }`}
                            title={promotion.isActive ? t('promotions.actions.deactivate') : t('promotions.actions.activate')}
                          >
                            {actionLoading === promotion._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : promotion.isActive ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeletePromotion(promotion._id)}
                            disabled={actionLoading === promotion._id}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                            title={t('promotions.actions.delete')}
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('promotions.pagination.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('promotions.pagination.next')}
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {t('promotions.pagination.showing').replace('{start}', ((currentPage - 1) * limit + 1).toString()).replace('{end}', Math.min(currentPage * limit, totalPromotions).toString()).replace('{total}', totalPromotions.toString())}
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('promotions.pagination.previous')}
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('promotions.pagination.next')}
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <PromotionForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePromotion}
        isEditing={false}
        isLoading={formLoading}
      />

      <PromotionForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPromotion(null);
        }}
        onSubmit={handleEditPromotion}
        initialData={selectedPromotion}
        isEditing={true}
        isLoading={formLoading}
      />

      {showViewModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('promotions.modal.view.title')}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-sm text-gray-900">{selectedPromotion.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="text-sm text-gray-900">{getPromotionTypeText(selectedPromotion.type)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-sm text-gray-900">{selectedPromotion.description}</p>
                  </div>
                </div>
              </div>

              {/* Detalles del descuento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Descuento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descuento</label>
                    <p className="text-sm text-gray-900">{getDiscountText(selectedPromotion)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usos</label>
                    <p className="text-sm text-gray-900">
                      {selectedPromotion.currentUses}
                      {selectedPromotion.maxUses && ` / ${selectedPromotion.maxUses}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inicio</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedPromotion.startDate).toLocaleDateString()} {selectedPromotion.startTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fin</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedPromotion.endDate).toLocaleDateString()} {selectedPromotion.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos ({selectedPromotion.products.length})</h3>
                <div className="max-h-40 overflow-y-auto">
                  {selectedPromotion.products.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {product.image && (
                          <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">${product.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texto del Ribbon</label>
                    <p className="text-sm text-gray-900">{selectedPromotion.ribbonText}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Posición</label>
                    <p className="text-sm text-gray-900">{selectedPromotion.ribbonPosition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mostrar Precio Original</label>
                    <p className="text-sm text-gray-900">{selectedPromotion.showOriginalPrice ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mostrar Monto de Descuento</label>
                    <p className="text-sm text-gray-900">{selectedPromotion.showDiscountAmount ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t">
                             <button
                 onClick={() => setShowViewModal(false)}
                 className="px-4 py-2 bg-racing-500 hover:bg-racing-600 text-white rounded-lg transition-colors"
               >
                 Cerrar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerPromotions;
