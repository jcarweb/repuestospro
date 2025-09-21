import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  DollarSign, 
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
  Percent,
  BarChart3,
  Smartphone,
  Monitor,
  MapPin,
  Users,
  Target,
  TrendingUp,
  Star,
  Zap,
  Crown,
  Award,
  Gift,
  Settings,
  Save,
  X
} from 'lucide-react';

interface AdvertisingPlan {
  _id: string;
  name: string;
  description: string;
  type: 'basic' | 'premium' | 'enterprise' | 'custom';
  category: 'banner' | 'popup' | 'video' | 'native' | 'search' | 'social';
  
  // Precios y costos
  pricing: {
    basePrice: number;
    currency: string;
    billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    setupFee?: number;
    minimumSpend: number;
    maximumSpend?: number;
  };
  
  // Características del plan
  features: {
    maxImpressions: number;
    maxClicks: number;
    maxConversions: number;
    targetingOptions: string[];
    analyticsLevel: 'basic' | 'advanced' | 'premium';
    supportLevel: 'email' | 'phone' | 'dedicated';
    customDesign: boolean;
    priority: number;
    geoTargeting: boolean;
    deviceTargeting: boolean;
    timeTargeting: boolean;
    audienceTargeting: boolean;
  };
  
  // Configuración de display
  displaySettings: {
    allowedTypes: string[];
    allowedPositions: string[];
    allowedSizes: string[];
    maxDuration: number; // en días
    minDuration: number; // en días
  };
  
  // Restricciones
  restrictions: {
    minStoreRating: number;
    minStoreAge: number; // en días
    requiredApproval: boolean;
    maxActiveCampaigns: number;
    blacklistedCategories: string[];
  };
  
  // Estado y metadatos
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface PlanStats {
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  totalRevenue: number;
  averagePrice: number;
  mostPopularPlan: string;
  conversionRate: number;
}

const AdminAdvertisingPlans: React.FC = () => {
  const { user, token, hasRole } = useAuth();
  const { t } = useLanguage();
  
  // Verificar permisos de admin
  if (!user || !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
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

  const [plans, setPlans] = useState<AdvertisingPlan[]>([]);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdvertisingPlan | null>(null);

  // Cargar planes de publicidad
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`http://localhost:5000/api/advertising-plans?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando planes de publicidad:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/advertising-plans/stats', {
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
      fetchPlans();
      fetchStats();
    }
  }, [user, token, searchTerm, selectedType, selectedCategory, selectedStatus]);

  // Crear plan
  const handleCreatePlan = async (planData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/advertising-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        fetchPlans();
        fetchStats();
        alert('Plan de publicidad creado exitosamente');
      } else {
        alert(data.message || 'Error creando plan de publicidad');
      }
    } catch (error) {
      console.error('Error creando plan:', error);
      alert('Error de conexión');
    }
  };

  // Editar plan
  const handleEditPlan = async (planData: any) => {
    if (!selectedPlan) return;

    try {
      const response = await fetch(`http://localhost:5000/api/advertising-plans/${selectedPlan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        setSelectedPlan(null);
        fetchPlans();
        fetchStats();
        alert('Plan de publicidad actualizado exitosamente');
      } else {
        alert(data.message || 'Error actualizando plan de publicidad');
      }
    } catch (error) {
      console.error('Error actualizando plan:', error);
      alert('Error de conexión');
    }
  };

  // Eliminar plan
  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/advertising-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPlans();
        fetchStats();
        alert('Plan de publicidad eliminado exitosamente');
      } else {
        alert(data.message || 'Error eliminando plan de publicidad');
      }
    } catch (error) {
      console.error('Error eliminando plan:', error);
      alert('Error de conexión');
    }
  };

  // Toggle estado del plan
  const handleToggleStatus = async (planId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/advertising-plans/${planId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPlans();
        fetchStats();
        alert('Estado del plan actualizado');
      } else {
        alert(data.message || 'Error actualizando estado del plan');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error de conexión');
    }
  };

  // Obtener icono del tipo de plan
  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case 'basic': return <Tag className="w-5 h-5" />;
      case 'premium': return <Star className="w-5 h-5" />;
      case 'enterprise': return <Crown className="w-5 h-5" />;
      case 'custom': return <Settings className="w-5 h-5" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  // Obtener color del tipo de plan
  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'banner': return <BarChart3 className="w-4 h-4" />;
      case 'popup': return <Monitor className="w-4 h-4" />;
      case 'video': return <Zap className="w-4 h-4" />;
      case 'native': return <Target className="w-4 h-4" />;
      case 'search': return <Search className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tarifario de Planes de Publicidad
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona los planes de publicidad disponibles para las tiendas
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Planes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePlans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900">${stats.averagePrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar planes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los tipos</option>
          <option value="basic">Básico</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Empresarial</option>
          <option value="custom">Personalizado</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las categorías</option>
          <option value="banner">Banner</option>
          <option value="popup">Popup</option>
          <option value="video">Video</option>
          <option value="native">Nativo</option>
          <option value="search">Búsqueda</option>
          <option value="social">Social</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-white px-4 py-2 rounded-lg hover:bg-[#E6B000] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Plan
        </button>
      </div>

      {/* Lista de planes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando planes...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay planes de publicidad disponibles</p>
            <p className="text-sm text-gray-500 mt-2">Crea tu primer plan para empezar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {plans.map(plan => (
              <div key={plan._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getPlanTypeIcon(plan.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{plan.name}</h3>
                          {plan.isPopular && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </span>
                          )}
                          {plan.isRecommended && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Award className="w-3 h-3 mr-1" />
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{plan.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-400 flex items-center">
                            {getCategoryIcon(plan.category)}
                            <span className="ml-1 capitalize">{plan.category}</span>
                          </span>
                          <span className="text-xs text-gray-400">
                            ${plan.pricing.basePrice.toLocaleString()}/{plan.pricing.billingCycle}
                          </span>
                          <span className="text-xs text-gray-400">
                            {plan.features.maxImpressions.toLocaleString()} impresiones
                          </span>
                          <span className="text-xs text-gray-400">
                            {plan.features.maxClicks.toLocaleString()} clicks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanTypeColor(plan.type)}`}>
                      {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
                    </span>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(plan._id)}
                        className={`p-1 rounded ${
                          plan.isActive 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={plan.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {plan.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(plan._id)}
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

      {/* Modal para ver detalles del plan */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Detalles del Plan</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPlan(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-gray-900">{selectedPlan.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanTypeColor(selectedPlan.type)}`}>
                      {selectedPlan.type.charAt(0).toUpperCase() + selectedPlan.type.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(selectedPlan.category)}
                      <span className="capitalize">{selectedPlan.category}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedPlan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPlan.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-900">{selectedPlan.description}</p>
                </div>
              </div>

              {/* Precios */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Precios y Costos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Base</label>
                    <p className="text-gray-900">${selectedPlan.pricing.basePrice.toLocaleString()} {selectedPlan.pricing.currency}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ciclo de Facturación</label>
                    <p className="text-gray-900 capitalize">{selectedPlan.pricing.billingCycle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gasto Mínimo</label>
                    <p className="text-gray-900">${selectedPlan.pricing.minimumSpend.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gasto Máximo</label>
                    <p className="text-gray-900">
                      {selectedPlan.pricing.maximumSpend 
                        ? `$${selectedPlan.pricing.maximumSpend.toLocaleString()}` 
                        : 'Sin límite'
                      }
                    </p>
                  </div>
                  {selectedPlan.pricing.setupFee && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cargo de Configuración</label>
                      <p className="text-gray-900">${selectedPlan.pricing.setupFee.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Características */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Características</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Impresiones Máximas</label>
                    <p className="text-gray-900">{selectedPlan.features.maxImpressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Clicks Máximos</label>
                    <p className="text-gray-900">{selectedPlan.features.maxClicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Conversiones Máximas</label>
                    <p className="text-gray-900">{selectedPlan.features.maxConversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel de Analytics</label>
                    <p className="text-gray-900 capitalize">{selectedPlan.features.analyticsLevel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel de Soporte</label>
                    <p className="text-gray-900 capitalize">{selectedPlan.features.supportLevel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diseño Personalizado</label>
                    <p className="text-gray-900">{selectedPlan.features.customDesign ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Opciones de targeting */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Opciones de Targeting</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${selectedPlan.features.geoTargeting ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm">Geolocalización</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${selectedPlan.features.deviceTargeting ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm">Dispositivo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${selectedPlan.features.timeTargeting ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm">Horario</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${selectedPlan.features.audienceTargeting ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm">Audiencia</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPlan(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar plan */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {showCreateModal ? 'Crear Nuevo Plan' : 'Editar Plan'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedPlan(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Formulario del plan */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData.entries());
              
              if (showCreateModal) {
                handleCreatePlan(data);
              } else {
                handleEditPlan(data);
              }
            }}>
              <div className="space-y-6">
                {/* Información básica */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedPlan?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        name="type"
                        defaultValue={selectedPlan?.type || 'basic'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      >
                        <option value="basic">Básico</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Empresarial</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        name="category"
                        defaultValue={selectedPlan?.category || 'banner'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      >
                        <option value="banner">Banner</option>
                        <option value="popup">Popup</option>
                        <option value="video">Video</option>
                        <option value="native">Nativo</option>
                        <option value="search">Búsqueda</option>
                        <option value="social">Social</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        name="isActive"
                        defaultValue={selectedPlan?.isActive ? 'true' : 'false'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="description"
                      defaultValue={selectedPlan?.description || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                      required
                    />
                  </div>
                </div>

                {/* Precios */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Precios y Costos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base</label>
                      <input
                        type="number"
                        name="pricing.basePrice"
                        defaultValue={selectedPlan?.pricing.basePrice || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                      <select
                        name="pricing.currency"
                        defaultValue={selectedPlan?.pricing.currency || 'USD'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="VES">VES</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo de Facturación</label>
                      <select
                        name="pricing.billingCycle"
                        defaultValue={selectedPlan?.pricing.billingCycle || 'monthly'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="yearly">Anual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gasto Mínimo</label>
                      <input
                        type="number"
                        name="pricing.minimumSpend"
                        defaultValue={selectedPlan?.pricing.minimumSpend || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Características</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Impresiones Máximas</label>
                      <input
                        type="number"
                        name="features.maxImpressions"
                        defaultValue={selectedPlan?.features.maxImpressions || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clicks Máximos</label>
                      <input
                        type="number"
                        name="features.maxClicks"
                        defaultValue={selectedPlan?.features.maxClicks || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conversiones Máximas</label>
                      <input
                        type="number"
                        name="features.maxConversions"
                        defaultValue={selectedPlan?.features.maxConversions || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Analytics</label>
                      <select
                        name="features.analyticsLevel"
                        defaultValue={selectedPlan?.features.analyticsLevel || 'basic'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                      >
                        <option value="basic">Básico</option>
                        <option value="advanced">Avanzado</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedPlan(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000]"
                >
                  {showCreateModal ? 'Crear Plan' : 'Actualizar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvertisingPlans;
