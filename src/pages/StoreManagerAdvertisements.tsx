import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { 
  Megaphone, 
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
  BarChart3,
  Smartphone,
  Monitor,
  MapPin,
  Users,
  Target,
  TrendingUp,
  Eye as EyeIcon,
  MousePointer,
  Zap,
  Pause,
  Play,
  Crown,
  ArrowRight
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  navigationUrl?: string;
  store: Store;
  
  // 🚀 Modelo Híbrido - Nivel de Publicidad
  advertisingLevel: 'self_managed' | 'premium_managed';
  templateId?: string;
  
  // Configuración específica por nivel
  selfManagedConfig?: {
    template: 'basic_banner' | 'product_highlight' | 'promotion_card' | 'featured_item';
    colors: {
      primary: string;
      secondary: string;
      text: string;
    };
    duration: number;
    zones: string[];
    productId?: string;
  };
  
  premiumManagedConfig?: {
    campaignType: 'social_media' | 'banner_special' | 'featured_campaign' | 'custom_design';
    requirements: string;
    budget: number;
    targetAudience: string;
    specialFeatures: string[];
  };
  
  displayType: 'fullscreen' | 'footer' | 'mid_screen' | 'search_card';
  targetPlatform: 'android' | 'ios' | 'both';
  targetAudience: {
    userRoles: string[];
    loyaltyLevels: string[];
    locations: string[];
    deviceTypes: string[];
    operatingSystems: string[];
    ageRanges: string[];
    interests: string[];
  };
  schedule: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  displaySettings: {
    maxImpressions: number;
    currentImpressions: number;
    maxClicks: number;
    currentClicks: number;
    frequency: number;
    priority: number;
    isActive: boolean;
  };
  tracking: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpm: number;
    cpc: number;
  };
  analytics: {
    deviceBreakdown: {
      android: number;
      ios: number;
    };
    locationBreakdown: {
      [location: string]: number;
    };
    timeBreakdown: {
      [hour: string]: number;
    };
    userSegmentBreakdown: {
      [segment: string]: number;
    };
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdvertisementTemplate {
  _id: string;
  name: string;
  description: string;
  type: 'basic_banner' | 'product_highlight' | 'promotion_card' | 'featured_item';
  category: 'self_managed' | 'premium_managed';
  previewImage: string;
  defaultColors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  customizableFields: string[];
  zones: string[];
  maxDuration: number;
  minDuration: number;
  pricing: {
    basePrice: number;
    pricePerDay: number;
    currency: string;
  };
  requirements: {
    minImageWidth: number;
    minImageHeight: number;
    maxFileSize: number;
    supportedFormats: string[];
  };
  isActive: boolean;
  isDefault: boolean;
}

interface AdvertisingAccess {
  hasAccess: boolean;
  reason?: string;
  subscription?: {
    name: string;
    type: string;
    price: number;
  };
  requiresUpgrade: boolean;
}

const StoreManagerAdvertisements: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { activeStore } = useActiveStore();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [advertisingAccess, setAdvertisingAccess] = useState<AdvertisingAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [displayTypeFilter, setDisplayTypeFilter] = useState('all');

  useEffect(() => {
    if (activeStore) {
      checkAdvertisingAccess();
      fetchAdvertisements();
    }
  }, [activeStore]);

  const checkAdvertisingAccess = async () => {
    try {
      const response = await fetch(`/api/advertisements/check-access?storeId=${activeStore._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdvertisingAccess(data);
      }
    } catch (error) {
      console.error('Error checking advertising access:', error);
    }
  };

  const fetchAdvertisements = async () => {
    if (!activeStore) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/advertisements?store=${activeStore._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdvertisements(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayTypeIcon = (type: string) => {
    switch (type) {
      case 'fullscreen':
        return <Monitor className="h-4 w-4" />;
      case 'footer':
        return <Smartphone className="h-4 w-4" />;
      case 'mid_screen':
        return <Target className="h-4 w-4" />;
      case 'search_card':
        return <Search className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const filteredAdvertisements = advertisements.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    const matchesDisplayType = displayTypeFilter === 'all' || ad.displayType === displayTypeFilter;
    
    return matchesSearch && matchesStatus && matchesDisplayType;
  });

  // Si no hay acceso a publicidad, mostrar mensaje de restricción
  if (advertisingAccess && !advertisingAccess.hasAccess) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-center text-white">
            <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-2xl font-bold mb-4">
              Acceso a Publicidad Restringido
            </h2>
            <p className="text-lg mb-6 opacity-90">
              {advertisingAccess.reason || 'Esta funcionalidad requiere un plan de suscripción superior.'}
            </p>
            
            {advertisingAccess.subscription && (
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Tu Plan Actual</h3>
                <p className="text-sm opacity-90">
                  {advertisingAccess.subscription.name} - ${advertisingAccess.subscription.price}/mes
                </p>
              </div>
            )}
            
            <button
              onClick={() => window.location.href = '/admin/monetization'}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
            >
              Ver Planes Disponibles
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Publicidad
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Crea y gestiona campañas publicitarias para tu tienda
          </p>
        </div>
        <button
          onClick={() => {/* TODO: Implementar creación de publicidad */}}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Campaña
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar campañas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activa</option>
              <option value="pending">Pendiente</option>
              <option value="paused">Pausada</option>
              <option value="completed">Completada</option>
            </select>

            <select
              value={displayTypeFilter}
              onChange={(e) => setDisplayTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="fullscreen">Pantalla completa</option>
              <option value="footer">Pie de página</option>
              <option value="mid_screen">Medio de pantalla</option>
              <option value="search_card">Tarjeta de búsqueda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Cargando campañas...</p>
          </div>
        ) : filteredAdvertisements.length === 0 ? (
          <div className="p-8 text-center">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay campañas publicitarias
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || statusFilter !== 'all' || displayTypeFilter !== 'all'
                ? 'No se encontraron campañas con los filtros aplicados'
                : 'Crea tu primera campaña publicitaria para comenzar'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#444444]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Campaña
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo de Display
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rendimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#333333] divide-y divide-gray-200 dark:divide-[#555555]">
                {filteredAdvertisements.map((ad) => (
                  <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-[#444444]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ad.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {ad.description}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">
                          Creada: {new Date(ad.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getDisplayTypeIcon(ad.displayType)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                          {ad.displayType.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                        {getStatusIcon(ad.status)}
                        <span className="ml-1 capitalize">
                          {ad.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{ad.tracking.impressions.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <MousePointer className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{ad.tracking.clicks.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Percent className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{(ad.tracking.ctr * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {/* TODO: Implementar vista */}}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* TODO: Implementar edición */}}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* TODO: Implementar eliminación */}}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Eliminar"
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
        )}
      </div>
    </div>
  );
};

export default StoreManagerAdvertisements;
