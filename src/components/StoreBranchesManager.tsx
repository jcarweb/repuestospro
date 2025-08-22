import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Settings,
  Plus,
  Building2,
  Loader2,
  Edit,
  Trash2,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  isActive: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  settings: {
    currency: string;
    taxRate: number;
    deliveryRadius: number;
    minimumOrder: number;
    autoAcceptOrders: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface StoreStats {
  totalProducts: number;
  activePromotions: number;
  pendingOrders: number;
  totalSales: number;
  averageRating: number;
  unreadMessages: number;
}

const StoreBranchesManager: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [storeStats, setStoreStats] = useState<{ [key: string]: StoreStats }>({});

  // Cargar tiendas del usuario
  useEffect(() => {
    const loadUserStores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/stores', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setStores(data.data);
          // Cargar estadísticas para cada tienda
          await loadStoreStats(data.data);
        }
      } catch (error) {
        console.error('Error cargando tiendas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadUserStores();
    }
  }, [token]);

  const loadStoreStats = async (storesList: Store[]) => {
    const stats: { [key: string]: StoreStats } = {};
    
    for (const store of storesList) {
      try {
        // Aquí harías la llamada a la API para obtener estadísticas de la tienda
        // Por ahora usamos datos de ejemplo
        stats[store._id] = {
          totalProducts: Math.floor(Math.random() * 200) + 50,
          activePromotions: Math.floor(Math.random() * 10) + 1,
          pendingOrders: Math.floor(Math.random() * 20) + 1,
          totalSales: Math.random() * 50000 + 5000,
          averageRating: Math.random() * 2 + 3,
          unreadMessages: Math.floor(Math.random() * 10)
        };
      } catch (error) {
        console.error(`Error cargando estadísticas de tienda ${store._id}:`, error);
      }
    }
    
    setStoreStats(stats);
  };

  const handleToggleStoreStatus = async (store: Store) => {
    setSelectedStore(store);
    setShowActivateModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedStore) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/stores/${selectedStore._id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !selectedStore.isActive
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de tiendas
        setStores(stores.map(store => 
          store._id === selectedStore._id 
            ? { ...store, isActive: !store.isActive }
            : store
        ));
      } else {
        alert(data.message || 'Error al cambiar el estado de la tienda');
      }
    } catch (error) {
      console.error('Error cambiando estado de tienda:', error);
      alert('Error al cambiar el estado de la tienda');
    } finally {
      setActionLoading(false);
      setShowActivateModal(false);
      setSelectedStore(null);
    }
  };

  const handleDeleteStore = async (store: Store) => {
    setSelectedStore(store);
    setShowDeleteModal(true);
  };

  const confirmDeleteStore = async () => {
    if (!selectedStore) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/stores/${selectedStore._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Remover la tienda de la lista
        setStores(stores.filter(store => store._id !== selectedStore._id));
        // Remover estadísticas
        const newStats = { ...storeStats };
        delete newStats[selectedStore._id];
        setStoreStats(newStats);
      } else {
        alert(data.message || 'Error al eliminar la tienda');
      }
    } catch (error) {
      console.error('Error eliminando tienda:', error);
      alert('Error al eliminar la tienda');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setSelectedStore(null);
    }
  };

  const handleEditStore = (store: Store) => {
    // Aquí iría la navegación a la página de edición
    console.log('Editar tienda:', store._id);
    // navigate(`/store-manager/edit-store/${store._id}`);
  };

  const handleManageStore = (store: Store) => {
    // Aquí podrías establecer la tienda activa en el contexto
    // y navegar al dashboard
    navigate('/store-manager/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFC300] mx-auto mb-4" />
          <p className="text-[#333333]">Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-[#FFC300] rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Sucursales
          </h1>
          <p className="text-lg text-gray-600">
            Administra tus tiendas y sucursales
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sucursales</p>
                <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.filter(store => store.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.filter(store => !store.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Object.values(storeStats).reduce((sum, stats) => sum + stats.totalSales, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de tiendas */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Tus Sucursales ({stores.length})
            </h2>
            <button
              onClick={() => navigate('/store-setup')}
              className="px-4 py-2 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Nueva Sucursal
            </button>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes sucursales</h3>
              <p className="text-gray-600 mb-6">Comienza creando tu primera sucursal</p>
              <button
                onClick={() => navigate('/store-setup')}
                className="px-6 py-3 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2"
              >
                Crear Primera Sucursal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {stores.map((store) => {
                const stats = storeStats[store._id] || {
                  totalProducts: 0,
                  activePromotions: 0,
                  pendingOrders: 0,
                  totalSales: 0,
                  averageRating: 0,
                  unreadMessages: 0
                };

                return (
                  <div key={store._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{store.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          store.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {store.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Información básica */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{store.address}, {store.city}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{store.email}</span>
                      </div>
                    </div>

                    {/* Estadísticas rápidas */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{stats.totalProducts}</div>
                        <div className="text-gray-600">Productos</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{stats.pendingOrders}</div>
                        <div className="text-gray-600">Pedidos</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">${stats.totalSales.toLocaleString()}</div>
                        <div className="text-gray-600">Ventas</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                        <div className="text-gray-600">Rating</div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleManageStore(store)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Gestionar
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setSelectedStore(store)}
                          className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {selectedStore?._id === store._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditStore(store)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleToggleStoreStatus(store)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {store.isActive ? (
                                  <>
                                    <PowerOff className="h-4 w-4 mr-2" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-4 w-4 mr-2" />
                                    Activar
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteStore(store)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón para continuar al dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/store-manager/dashboard')}
            className="px-6 py-3 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2"
          >
            Continuar al Dashboard
          </button>
        </div>
      </div>

      {/* Modal de confirmación para activar/desactivar */}
      {showActivateModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedStore.isActive ? 'Desactivar' : 'Activar'} Sucursal
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres {selectedStore.isActive ? 'desactivar' : 'activar'} la sucursal "{selectedStore.name}"?
              {selectedStore.isActive && ' Los clientes no podrán realizar pedidos mientras esté desactivada.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowActivateModal(false);
                  setSelectedStore(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedStore.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  selectedStore.isActive ? 'Desactivar' : 'Activar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Eliminar Sucursal
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres eliminar la sucursal "{selectedStore.name}"?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">¡Advertencia!</p>
                    <p>Esta acción eliminará permanentemente:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Todos los productos asociados</li>
                      <li>Historial de pedidos</li>
                      <li>Datos de clientes</li>
                      <li>Configuraciones de la sucursal</li>
                    </ul>
                    <p className="font-medium mt-2">Esta acción no se puede deshacer.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStore(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteStore}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Eliminar Permanentemente'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreBranchesManager;
