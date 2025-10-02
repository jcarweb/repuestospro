import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdvertisementForm from '../components/AdvertisementForm';
import { API_BASE_URL } from '../../config/api';
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
  Play
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

interface AdvertisementStats {
  overview: {
    total: number;
    active: number;
    pending: number;
    draft: number;
  };
  displayTypes: Array<{ _id: string; count: number }>;
  platforms: Array<{ _id: string; count: number }>;
  performance: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    avgCTR: number;
  };
  topAdvertisements: Advertisement[];
  statusBreakdown: Array<{ _id: string; count: number }>;
}

const AdminAdvertisements: React.FC = () => {
  const { user, token, hasRole } = useAuth();
  const { t } = useLanguage();
  
  // Verificar si el usuario tiene permisos de admin
  if (!user || !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="text-sm text-gray-500">
            Se requieren permisos de administrador.
          </p>
        </div>
      </div>
    );
  }

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<AdvertisementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDisplayType, setSelectedDisplayType] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  // Log para depurar el renderizado
  console.log('🎨 Renderizando AdminAdvertisements con:', advertisements.length, 'publicidades');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null);
  
  // Cargar publicidades
  const fetchAdvertisements = async () => {
    try {
      console.log('🔄 Iniciando fetchAdvertisements...');
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStore !== 'all') params.append('store', selectedStore);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedDisplayType !== 'all') params.append('displayType', selectedDisplayType);
      if (selectedPlatform !== 'all') params.append('targetPlatform', selectedPlatform);

      console.log('🔍 Cargando publicidades con token:', token ? 'Token presente' : 'Sin token');
      console.log('🔗 URL:', `process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""""""""/api/advertisements/admin?${params}`);
      
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/advertisements/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Respuesta de la API:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📊 Datos recibidos:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Estableciendo publicidades en el estado:', data.data.length);
        setAdvertisements(data.data);
        console.log('✅ Publicidades cargadas:', data.data.length);
      } else {
        console.error('❌ Error en la respuesta:', data.message);
      }
    } catch (error) {
      console.error('❌ Error cargando publicidades:', error);
    } finally {
      setLoading(false);
      console.log('🏁 fetchAdvertisements completado');
    }
  };

  // Cargar tiendas
  const fetchStores = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.data && data.data.stores && Array.isArray(data.data.stores)) {
        setStores(data.data.stores);
      } else {
        console.error('Respuesta inesperada de la API de tiendas:', data);
        setStores([]);
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error);
      setStores([]);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/advertisements/admin/stats', {
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
    console.log('🔍 useEffect triggered:', { 
      user: user ? `User: ${user.name} (${user.role})` : 'No user', 
      token: token ? 'Token present' : 'No token' 
    });
    
    if (user && token) {
      console.log('✅ User and token available, fetching data...');
      fetchAdvertisements();
      fetchStores();
      fetchStats();
    } else {
      console.log('❌ User or token missing:', { user: !!user, token: !!token });
    }
  }, [user, token, searchTerm, selectedStore, selectedStatus, selectedDisplayType, selectedPlatform]);

  // Log para depurar el estado de publicidades
  useEffect(() => {
    console.log('📊 Estado de publicidades actualizado:', advertisements.length, 'publicidades');
    if (advertisements.length > 0) {
      console.log('📋 Primera publicidad:', {
        id: advertisements[0]._id,
        title: advertisements[0].title,
        status: advertisements[0].status
      });
    }
  }, [advertisements]);

  // Cambiar estado de publicidad
  const handleChangeStatus = async (advertisementId: string, newStatus: string, rejectionReason?: string) => {
    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/advertisements/admin/${advertisementId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, rejectionReason })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchAdvertisements();
        fetchStats();
        alert(`Estado de publicidad cambiado a ${newStatus}`);
      } else {
        alert(data.message || 'Error cambiando estado de publicidad');
      }
    } catch (error) {
      console.error('Error cambiando estado de publicidad:', error);
      alert('Error de conexión');
    }
  };

  // Crear publicidad
  const handleCreateAdvertisement = async (formData: any) => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/advertisements/admin', {
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
        fetchAdvertisements();
        fetchStats();
        alert('Publicidad creada exitosamente');
      } else {
        alert(data.message || 'Error creando publicidad');
      }
    } catch (error) {
      console.error('Error creando publicidad:', error);
      alert('Error de conexión');
    }
  };

  // Editar publicidad
  const handleEditAdvertisement = async (formData: any) => {
    if (!selectedAdvertisement) return;

    try {
      console.log('🔍 Editando publicidad:', selectedAdvertisement._id);
      console.log('📊 Datos del formulario:', JSON.stringify(formData, null, 2));
      
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/advertisements/admin/${selectedAdvertisement._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Respuesta de la API:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📋 Datos de respuesta:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Publicidad actualizada exitosamente');
        console.log('🔄 Cerrando modal y actualizando lista...');
        setShowEditModal(false);
        setSelectedAdvertisement(null);
        
        console.log('📊 Recargando publicidades...');
        await fetchAdvertisements();
        console.log('📈 Recargando estadísticas...');
        await fetchStats();
        
        console.log('✅ Todo completado exitosamente');
        alert('Publicidad actualizada exitosamente');
      } else {
        console.error('❌ Error en la respuesta:', data.message);
        alert(data.message || 'Error actualizando publicidad');
      }
    } catch (error) {
      console.error('❌ Error actualizando publicidad:', error);
      alert('Error de conexión');
    }
  };

  // Eliminar publicidad
  const handleDeleteAdvertisement = async (advertisementId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicidad? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/advertisements/admin/${advertisementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchAdvertisements();
        fetchStats();
        alert('Publicidad eliminada exitosamente');
      } else {
        alert(data.message || 'Error eliminando publicidad');
      }
    } catch (error) {
      console.error('Error eliminando publicidad:', error);
      alert('Error de conexión');
    }
  };

  // Ver detalles de publicidad
  const handleViewAdvertisement = (advertisement: Advertisement) => {
    setSelectedAdvertisement(advertisement);
    setShowViewModal(true);
  };

  // Obtener icono de tipo de display
  const getDisplayTypeIcon = (type: string) => {
    switch (type) {
      case 'fullscreen': return <Monitor className="w-4 h-4" />;
      case 'footer': return <BarChart3 className="w-4 h-4" />;
      case 'mid_screen': return <Target className="w-4 h-4" />;
      case 'search_card': return <Search className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  // Obtener texto de tipo de display
  const getDisplayTypeText = (type: string) => {
    switch (type) {
      case 'fullscreen': return 'Pantalla Completa';
      case 'footer': return 'Pie de Página';
      case 'mid_screen': return 'Mitad de Pantalla';
      case 'search_card': return 'Card de Búsqueda';
      default: return type;
    }
  };

  // Obtener icono de plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'android': return <Smartphone className="w-4 h-4" />;
      case 'ios': return <Smartphone className="w-4 h-4" />;
      case 'both': return <Monitor className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  // Obtener el estado de visualización de la publicidad
  const getAdvertisementStatus = (advertisement: Advertisement) => {
    switch (advertisement.status) {
      case 'draft':
        return { text: 'Borrador', class: 'bg-gray-100 text-gray-800' };
      case 'pending':
        return { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { text: 'Aprobada', class: 'bg-blue-100 text-blue-800' };
      case 'rejected':
        return { text: 'Rechazada', class: 'bg-red-100 text-red-800' };
      case 'active':
        return { text: 'Activa', class: 'bg-green-100 text-green-800' };
      case 'paused':
        return { text: 'Pausada', class: 'bg-orange-100 text-orange-800' };
      case 'completed':
        return { text: 'Completada', class: 'bg-purple-100 text-purple-800' };
      default:
        return { text: advertisement.status, class: 'bg-gray-100 text-gray-800' };
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{t('adminAdvertisements.title')}</h1>
                  <p className="text-gray-600 mt-2">{t('adminAdvertisements.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
                             <Megaphone className="w-8 h-8 text-[#FFC300]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <EyeIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Impresiones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.performance.totalImpressions.toLocaleString()}</p>
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
                            placeholder={t('adminAdvertisements.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          />
        </div>
        
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las tiendas</option>
          {Array.isArray(stores) && stores.map(store => (
            <option key={store._id} value={store._id}>{store.name}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
                          <option value="all">{t('adminAdvertisements.filterAll')}</option>
          <option value="draft">Borrador</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
          <option value="active">Activa</option>
          <option value="paused">Pausada</option>
          <option value="completed">Completada</option>
        </select>

        <select
          value={selectedDisplayType}
          onChange={(e) => setSelectedDisplayType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los tipos</option>
          <option value="fullscreen">Pantalla Completa</option>
          <option value="footer">Pie de Página</option>
          <option value="mid_screen">Mitad de Pantalla</option>
          <option value="search_card">Card de Búsqueda</option>
        </select>

        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las plataformas</option>
          <option value="android">Android</option>
          <option value="ios">iOS</option>
          <option value="both">Ambas</option>
        </select>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-white px-4 py-2 rounded-lg hover:bg-[#E6B000] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('adminAdvertisements.newAdvertisement')}
        </button>
      </div>

      {/* Lista de publicidades */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('adminAdvertisements.loading')}</p>
          </div>
        ) : advertisements.length === 0 ? (
          <div className="p-8 text-center">
            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('adminAdvertisements.noAdvertisements')}</p>
            <p className="text-sm text-gray-500 mt-2">Crea tu primera publicidad para empezar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {advertisements.map(advertisement => (
              <div key={advertisement._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getDisplayTypeIcon(advertisement.displayType)}
                      <div>
                        <h3 className="font-medium text-gray-900">{advertisement.title}</h3>
                        <p className="text-sm text-gray-500">{advertisement.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            {getDisplayTypeText(advertisement.displayType)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {advertisement.store.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {getPlatformIcon(advertisement.targetPlatform)}
                            {advertisement.targetPlatform}
                          </span>
                          <span className="text-xs text-gray-400">
                            <EyeIcon className="w-3 h-3 inline mr-1" />
                            {advertisement.tracking.impressions.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            <MousePointer className="w-3 h-3 inline mr-1" />
                            {advertisement.tracking.clicks.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            <Zap className="w-3 h-3 inline mr-1" />
                            {advertisement.tracking.ctr.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {(() => {
                      const status = getAdvertisementStatus(advertisement);
                      return (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.class}`}>
                          {status.text}
                        </span>
                      );
                    })()}
                    
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleViewAdvertisement(advertisement)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (advertisement.status === 'active') {
                            alert('No se puede editar una publicidad activa. Debes pausarla o cambiar su estado primero.');
                            return;
                          }
                          setSelectedAdvertisement(advertisement);
                          setShowEditModal(true);
                        }}
                        className={`p-1 rounded ${
                          advertisement.status === 'active' 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={advertisement.status === 'active' ? 'No se puede editar una publicidad activa' : 'Editar'}
                        disabled={advertisement.status === 'active'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {advertisement.status === 'active' && (
                        <button 
                          onClick={() => handleChangeStatus(advertisement._id, 'paused')}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Pausar publicidad"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {advertisement.status === 'paused' && (
                        <button 
                          onClick={() => handleChangeStatus(advertisement._id, 'active')}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Activar publicidad"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAdvertisement(advertisement._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Eliminar"
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

      {/* Modal para ver detalles de publicidad */}
      {showViewModal && selectedAdvertisement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Detalles de la Publicidad</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAdvertisement(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="text-gray-900">{selectedAdvertisement.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getAdvertisementStatus(selectedAdvertisement).class
                    }`}>
                      {getAdvertisementStatus(selectedAdvertisement).text}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Display</label>
                    <div className="flex items-center space-x-2">
                      {getDisplayTypeIcon(selectedAdvertisement.displayType)}
                      <span>{getDisplayTypeText(selectedAdvertisement.displayType)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plataforma</label>
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(selectedAdvertisement.targetPlatform)}
                      <span>{selectedAdvertisement.targetPlatform}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-900">{selectedAdvertisement.description}</p>
                </div>
              </div>

              {/* Estadísticas de rendimiento */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Estadísticas de Rendimiento</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Impresiones</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAdvertisement.tracking.impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Clicks</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAdvertisement.tracking.clicks.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">CTR</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAdvertisement.tracking.ctr.toFixed(2)}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Conversiones</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAdvertisement.tracking.conversions.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Configuración de horario */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Configuración de Horario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <p className="text-gray-900">
                      {new Date(selectedAdvertisement.schedule.startDate).toLocaleDateString()} a las {selectedAdvertisement.schedule.startTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <p className="text-gray-900">
                      {new Date(selectedAdvertisement.schedule.endDate).toLocaleDateString()} a las {selectedAdvertisement.schedule.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuración de display */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Configuración de Display</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                    <p className="text-gray-900">{selectedAdvertisement.displaySettings.priority}/10</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frecuencia</label>
                    <p className="text-gray-900">{selectedAdvertisement.displaySettings.frequency} vez(es) por usuario</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Impresiones Máximas</label>
                    <p className="text-gray-900">
                      {selectedAdvertisement.displaySettings.maxImpressions === 0 
                        ? 'Sin límite' 
                        : selectedAdvertisement.displaySettings.maxImpressions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Clicks Máximos</label>
                    <p className="text-gray-900">
                      {selectedAdvertisement.displaySettings.maxClicks === 0 
                        ? 'Sin límite' 
                        : selectedAdvertisement.displaySettings.maxClicks.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información Adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Creado por</label>
                    <p className="text-gray-900">{selectedAdvertisement.createdBy.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                    <p className="text-gray-900">{new Date(selectedAdvertisement.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedAdvertisement.approvedBy && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Aprobado por</label>
                        <p className="text-gray-900">{selectedAdvertisement.approvedBy.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Aprobación</label>
                        <p className="text-gray-900">{new Date(selectedAdvertisement.approvedAt!).toLocaleDateString()}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAdvertisement(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear publicidad */}
      {showCreateModal && token && (
        <AdvertisementForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAdvertisement}
          token={token}
        />
      )}

      {/* Modal para editar publicidad */}
      {showEditModal && selectedAdvertisement && token && (
        <AdvertisementForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdvertisement(null);
          }}
          onSubmit={handleEditAdvertisement}
          advertisement={selectedAdvertisement}
          isEditing={true}
          token={token}
        />
      )}
    </div>
  );
};

export default AdminAdvertisements;
