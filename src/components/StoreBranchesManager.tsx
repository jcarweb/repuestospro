import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AdminCard, AdminButton, AdminTable } from './ui';
import BranchForm from './BranchForm';
import BusinessHoursForm from './BusinessHoursForm';
import { API_BASE_URL } from '../../config/api';
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
  isMainStore: boolean;
  // Referencias a las divisiones administrativas
  stateRef?: string;
  municipalityRef?: string;
  parishRef?: string;
  // Redes sociales
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
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
  const { userStores, loading: contextLoading, refreshStores } = useActiveStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showBusinessHoursForm, setShowBusinessHoursForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [storeStats, setStoreStats] = useState<{ [key: string]: StoreStats }>({});

  // Usar las tiendas del contexto en lugar de hacer una llamada separada
  useEffect(() => {
    console.log('StoreBranchesManager: useEffect triggered');
    console.log('StoreBranchesManager: contextLoading:', contextLoading);
    console.log('StoreBranchesManager: userStores.length:', userStores.length);
    
    if (!contextLoading && userStores.length > 0) {
      console.log('StoreBranchesManager: Usando tiendas del contexto');
      setStores(userStores);
      // Cargar estadísticas para cada tienda
      loadStoreStats(userStores);
      setLoading(false);
    } else if (!contextLoading && userStores.length === 0) {
      console.log('StoreBranchesManager: No hay tiendas en el contexto');
      setStores([]);
      setLoading(false);
    } else if (contextLoading) {
      console.log('StoreBranchesManager: Contexto aún cargando...');
      setLoading(true);
    }
  }, [contextLoading, userStores, token]);

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

  const handleCreateBranch = async (formData: any) => {
    try {
      console.log('handleCreateBranch recibió:', formData);
      setActionLoading(true);
      
      console.log('Enviando request con token:', token ? 'Token presente' : 'Sin token');
      const response = await fetch('API_BASE_URL/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          country: 'Venezuela',
          coordinates: formData.coordinates || { latitude: 0, longitude: 0 },
          // Agregar el nombre del estado basado en stateRef
          state: formData.stateRef ? 'Estado seleccionado' : '',
          businessHours: {
            monday: { open: '08:00', close: '18:00', isOpen: true },
            tuesday: { open: '08:00', close: '18:00', isOpen: true },
            wednesday: { open: '08:00', close: '18:00', isOpen: true },
            thursday: { open: '08:00', close: '18:00', isOpen: true },
            friday: { open: '08:00', close: '18:00', isOpen: true },
            saturday: { open: '08:00', close: '14:00', isOpen: true },
            sunday: { open: '08:00', close: '14:00', isOpen: false }
          },
          settings: {
            currency: 'USD',
            taxRate: 16.0,
            deliveryRadius: 10,
            minimumOrder: 0,
            autoAcceptOrders: false
          }
        })
      });

      console.log('Status de la respuesta:', response.status);
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (data.success) {
        console.log('Sucursal creada exitosamente');
        // Usar el contexto para recargar las tiendas
        await refreshStores();
      } else {
        throw new Error(data.message || 'Error creating branch');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBranch = async (formData: any) => {
    if (!editingStore) return;
    
    try {
      setActionLoading(true);
      
      const response = await fetch(`API_BASE_URL/stores/${editingStore._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Usar el contexto para recargar las tiendas
        await refreshStores();
      } else {
        throw new Error(data.message || 'Error updating branch');
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBusinessHours = async (businessHours: any) => {
    if (!selectedStore) return;
    
    try {
      setActionLoading(true);
      
      const response = await fetch(`API_BASE_URL/stores/${selectedStore._id}/business-hours`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ businessHours })
      });

      const data = await response.json();
      
      if (data.success) {
        // Usar el contexto para recargar las tiendas
        await refreshStores();
      } else {
        throw new Error(data.message || 'Error updating business hours');
      }
    } catch (error) {
      console.error('Error updating business hours:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetMainStore = async (storeId: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`API_BASE_URL/stores/${storeId}/set-main`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Usar el contexto para recargar las tiendas
        await refreshStores();
      } else {
        throw new Error(data.message || 'Error setting main store');
      }
    } catch (error) {
      console.error('Error setting main store:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStoreStatus = async (storeId: string, isActive: boolean) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`API_BASE_URL/stores/${storeId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });

      const data = await response.json();
      
      if (data.success) {
        // Usar el contexto para recargar las tiendas
        await refreshStores();
      } else {
        throw new Error(data.message || 'Error toggling store status');
      }
    } catch (error) {
      console.error('Error toggling store status:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`API_BASE_URL/stores/${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Usar el contexto para recargar las tiendas
        await refreshStores();
        setShowDeleteModal(false);
        setSelectedStore(null);
      } else {
        throw new Error(data.message || 'Error deleting store');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageStore = (store: Store) => {
    // Navegar al dashboard de la tienda específica
    navigate(`/store-manager/dashboard?store=${store._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#333333] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFC300] mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white">Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#333333] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-[#FFC300] rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('branches.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('branches.subtitle')}
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminCard>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('branches.totalBranches')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stores.length}</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('branches.status.active')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stores.filter(store => store.isActive).length}
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('branches.status.inactive')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stores.filter(store => !store.isActive).length}
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('branches.status.main')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stores.filter(store => store.isMainStore).length}
                </p>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Lista de tiendas */}
        <AdminCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('branches.totalBranches')} ({stores.length})
            </h2>
            <AdminButton
              onClick={() => setShowBranchForm(true)}
              icon={<Plus className="h-5 w-5" />}
            >
              {t('branches.createBranch')}
            </AdminButton>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('branches.noBranches')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('branches.noBranchesDescription')}
              </p>
              <AdminButton
                onClick={() => setShowBranchForm(true)}
                icon={<Plus className="h-5 w-5" />}
              >
                {t('branches.createFirstBranch')}
              </AdminButton>
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
                   <div key={store._id} className={`border rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-[#333333] ${
                     store.isMainStore 
                       ? 'border-purple-300 dark:border-purple-600 shadow-purple-100 dark:shadow-purple-900/20' 
                       : 'border-gray-200 dark:border-gray-700'
                   }`}>
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{store.name}</h3>
                        {store.isMainStore && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {t('branches.status.main')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          store.isActive 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {store.isActive ? t('branches.status.active') : t('branches.status.inactive')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Indicador de tienda principal más prominente */}
                    {store.isMainStore && (
                      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              {t('branches.status.mainStore')}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              {t('branches.status.mainStoreDescription')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Información básica */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
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
                      <div className="text-center p-2 bg-gray-50 dark:bg-[#444444] rounded">
                        <div className="font-semibold text-gray-900 dark:text-white">{stats.totalProducts}</div>
                        <div className="text-gray-600 dark:text-gray-300">Productos</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-[#444444] rounded">
                        <div className="font-semibold text-gray-900 dark:text-white">{stats.pendingOrders}</div>
                        <div className="text-gray-600 dark:text-gray-300">Pedidos</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-[#444444] rounded">
                        <div className="font-semibold text-gray-900 dark:text-white">${stats.totalSales.toLocaleString()}</div>
                        <div className="text-gray-600 dark:text-gray-300">Ventas</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-[#444444] rounded">
                        <div className="font-semibold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}</div>
                        <div className="text-gray-600 dark:text-gray-300">Rating</div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-2">
                                             <AdminButton
                         onClick={() => handleManageStore(store)}
                         variant="primary"
                         size="sm"
                         className="flex-1"
                       >
                         {t('branches.actions.manage')}
                       </AdminButton>
                      
                      <div className="relative">
                        <AdminButton
                          onClick={() => setSelectedStore(store)}
                          variant="secondary"
                          size="sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </AdminButton>
                        
                        {selectedStore?._id === store._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#333333] rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setEditingStore(store);
                                  setShowBranchForm(true);
                                  setSelectedStore(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444] text-left"
                              >
                                <Edit className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="text-left">{t('branches.actions.edit')}</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedStore(store);
                                  setShowBusinessHoursForm(true);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left"
                              >
                                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="text-left">{t('branches.actions.businessHours')}</span>
                              </button>
                              
                              {!store.isMainStore && (
                                <button
                                  onClick={() => handleSetMainStore(store._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left"
                                >
                                  <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="text-left">{t('branches.actions.setMain')}</span>
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleToggleStoreStatus(store._id, !store.isActive)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444] text-left"
                              >
                                {store.isActive ? (
                                  <>
                                    <PowerOff className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="text-left">{t('branches.actions.deactivate')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="text-left">{t('branches.actions.activate')}</span>
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedStore(store);
                                  setShowDeleteModal(true);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                              >
                                <Trash2 className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="text-left">{t('branches.actions.delete')}</span>
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
        </AdminCard>

                 {/* Botón para continuar al dashboard */}
         <div className="text-center mt-8">
           <AdminButton
             onClick={() => navigate('/store-manager/dashboard')}
             variant="primary"
             size="lg"
           >
             {t('branches.actions.continueToDashboard')}
           </AdminButton>
         </div>
      </div>

      {/* Formulario de sucursales */}
      <BranchForm
        isOpen={showBranchForm}
        onClose={() => {
          setShowBranchForm(false);
          setEditingStore(null);
        }}
        onSubmit={editingStore ? handleEditBranch : handleCreateBranch}
        initialData={editingStore ? {
          name: editingStore.name,
          description: editingStore.description || '',
          address: editingStore.address,
          city: editingStore.city,
          zipCode: editingStore.zipCode,
          phone: editingStore.phone,
          email: editingStore.email,
          website: editingStore.website || '',
          isMainStore: editingStore.isMainStore,
          // Datos de ubicación administrativa
          stateRef: editingStore.stateRef,
          municipalityRef: editingStore.municipalityRef,
          parishRef: editingStore.parishRef,
          // Coordenadas GPS
          coordinates: editingStore.coordinates,
          // Redes sociales
          socialMedia: editingStore.socialMedia
        } : undefined}
        isEditing={!!editingStore}
        hasMainStore={stores.some(store => store.isMainStore)}
      />

      {/* Formulario de horarios de trabajo */}
      <BusinessHoursForm
        isOpen={showBusinessHoursForm}
        onClose={() => {
          setShowBusinessHoursForm(false);
          setSelectedStore(null);
        }}
        onSubmit={handleUpdateBusinessHours}
        initialHours={selectedStore?.businessHours}
        storeName={selectedStore?.name}
      />

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#333333] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('branches.actions.delete')} {t('branches.branch')}
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('branches.confirmDelete')}
              </p>
                             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                 <div className="flex">
                   <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                   <div className="text-sm text-red-700 dark:text-red-300">
                     <p className="font-medium">{t('branches.delete.warning')}</p>
                     <p>{t('branches.delete.willDelete')}</p>
                     <ul className="list-disc list-inside mt-1">
                       <li>{t('branches.delete.products')}</li>
                       <li>{t('branches.delete.orders')}</li>
                       <li>{t('branches.delete.customers')}</li>
                       <li>{t('branches.delete.settings')}</li>
                     </ul>
                     <p className="font-medium mt-2">{t('branches.delete.cannotUndo')}</p>
                   </div>
                 </div>
               </div>
            </div>
            <div className="flex justify-end space-x-3">
              <AdminButton
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStore(null);
                }}
                variant="secondary"
                disabled={actionLoading}
              >
                {t('branches.form.cancel')}
              </AdminButton>
                             <AdminButton
                 onClick={() => handleDeleteStore(selectedStore._id)}
                 variant="danger"
                 disabled={actionLoading}
               >
                 {actionLoading ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
                 ) : (
                   t('branches.delete.permanently')
                 )}
               </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreBranchesManager;
