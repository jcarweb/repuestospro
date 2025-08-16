import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PromotionForm from '../components/PromotionForm';
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

      const response = await fetch(`http://localhost:5000/api/promotions?${params}`, {
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
      const response = await fetch('http://localhost:5000/api/promotions/stores/available', {
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

      const response = await fetch(`http://localhost:5000/api/promotions/products/available?${params}`, {
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
      const response = await fetch('http://localhost:5000/api/promotions/categories/available', {
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
      const response = await fetch('http://localhost:5000/api/promotions/stats/overview', {
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
      const response = await fetch('http://localhost:5000/api/promotions', {
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
        alert('Promoción creada exitosamente');
      } else {
        alert(data.message || 'Error creando promoción');
      }
    } catch (error) {
      console.error('Error creando promoción:', error);
      alert('Error de conexión');
    }
  };

  // Editar promoción
  const handleEditPromotion = async (formData: any) => {
    if (!selectedPromotion) return;

    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${selectedPromotion._id}`, {
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
        alert('Promoción actualizada exitosamente');
      } else {
        alert(data.message || 'Error actualizando promoción');
      }
    } catch (error) {
      console.error('Error actualizando promoción:', error);
      alert('Error de conexión');
    }
  };

  // Cambiar estado de promoción (activar/desactivar)
  const handleToggleStatus = async (promotionId: string) => {
    try {
      console.log('🔍 Debug - Toggle status para promoción:', promotionId);
      
      const response = await fetch(`http://localhost:5000/api/promotions/${promotionId}/toggle`, {
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
        alert('Estado de promoción actualizado exitosamente');
      } else {
        alert(data.message || 'Error actualizando estado de promoción');
      }
    } catch (error) {
      console.error('Error cambiando estado de promoción:', error);
      alert('Error de conexión');
    }
  };

  // Eliminar promoción
  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta promoción? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPromotions();
        fetchStats();
        alert('Promoción eliminada exitosamente');
      } else {
        alert(data.message || 'Error eliminando promoción');
      }
    } catch (error) {
      console.error('Error eliminando promoción:', error);
      alert('Error de conexión');
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
      case 'percentage': return 'Porcentaje';
      case 'fixed': return 'Monto Fijo';
      case 'buy_x_get_y': return 'Compra X Obtén Y';
      case 'custom': return 'Personalizada';
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
      return { text: 'Inactiva', class: 'bg-red-100 text-red-800' };
    }
    
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (now < startDate) {
      return { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' };
    } else if (now > endDate) {
      return { text: 'Expirada', class: 'bg-gray-100 text-gray-800' };
    } else {
      return { text: 'Vigente', class: 'bg-green-100 text-green-800' };
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'store_manager')) {
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Promociones</h1>
        <p className="text-gray-600 mt-2">Administra las promociones y ofertas especiales</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Gift className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPromotions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePromotions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactivePromotions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Por Expirar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tiendas</p>
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
            placeholder="Buscar promociones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {user.role === 'admin' && (
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las tiendas</option>
            {stores.map(store => (
              <option key={store._id} value={store._id}>{store.name}</option>
            ))}
          </select>
        )}

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los tipos</option>
          <option value="percentage">Porcentaje</option>
          <option value="fixed">Monto Fijo</option>
          <option value="buy_x_get_y">Compra X Obtén Y</option>
          <option value="custom">Personalizada</option>
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Promoción
        </button>
      </div>

      {/* Lista de promociones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando promociones...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron promociones</p>
            <p className="text-sm text-gray-500 mt-2">Crea tu primera promoción para empezar</p>
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
                            {promotion.products.length} productos
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
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedPromotion(promotion);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Editar"
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
                        title={promotion.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {promotion.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeletePromotion(promotion._id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Detalles de la Promoción</h2>
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
                <h3 className="text-lg font-semibold mb-3">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-gray-900">{selectedPromotion.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <div className="flex items-center space-x-2">
                      {getPromotionTypeIcon(selectedPromotion.type)}
                      <span>{getPromotionTypeText(selectedPromotion.type)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedPromotion.isActive
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPromotion.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tienda</label>
                    <p className="text-gray-900">{selectedPromotion.store.name}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-900">{selectedPromotion.description}</p>
                </div>
              </div>

              {/* Configuración de descuento */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Configuración de Descuento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPromotion.type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Porcentaje de Descuento</label>
                      <p className="text-gray-900">{selectedPromotion.discountPercentage}%</p>
                    </div>
                  )}
                  {selectedPromotion.type === 'fixed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monto de Descuento</label>
                      <p className="text-gray-900">${selectedPromotion.discountAmount}</p>
                    </div>
                  )}
                  {selectedPromotion.type === 'buy_x_get_y' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Compra</label>
                        <p className="text-gray-900">{selectedPromotion.buyQuantity} unidades</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Obtén</label>
                        <p className="text-gray-900">{selectedPromotion.getQuantity} unidades</p>
                      </div>
                    </>
                  )}
                  {selectedPromotion.type === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Texto Personalizado</label>
                      <p className="text-gray-900">{selectedPromotion.customText}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Fechas de Vigencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <p className="text-gray-900">
                      {new Date(selectedPromotion.startDate).toLocaleDateString()} a las {selectedPromotion.startTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <p className="text-gray-900">
                      {new Date(selectedPromotion.endDate).toLocaleDateString()} a las {selectedPromotion.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Productos ({selectedPromotion.products.length})</h3>
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
                <h3 className="text-lg font-semibold mb-3">Configuración Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texto del Cintillo</label>
                    <p className="text-gray-900">{selectedPromotion.ribbonText}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Posición del Cintillo</label>
                    <p className="text-gray-900">{selectedPromotion.ribbonPosition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mostrar Precio Original</label>
                    <p className="text-gray-900">{selectedPromotion.showOriginalPrice ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mostrar Monto de Descuento</label>
                    <p className="text-gray-900">{selectedPromotion.showDiscountAmount ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información Adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Creado por</label>
                    <p className="text-gray-900">{selectedPromotion.createdBy.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                    <p className="text-gray-900">{new Date(selectedPromotion.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedPromotion.maxUses && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Límite de Usos</label>
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
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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

export default AdminPromotions; 