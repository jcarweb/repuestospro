import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Store, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import FreeStoreLocationMap from '../components/FreeStoreLocationMap';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/userService';
import type { User } from '../types';
import { API_BASE_URL } from '../config/api';
import { userService, User } from '../services/userService';

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
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  managers: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
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
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  storesByCity: Array<{
    _id: string;
    count: number;
  }>;
  storesByState: Array<{
    _id: string;
    count: number;
  }>;
}

const AdminStores: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Venezuela',
    phone: '',
    email: '',
    website: '',
    logo: '',
    banner: '',
    latitude: '',
    longitude: '',
    currency: 'USD',
    taxRate: '16.0',
    deliveryRadius: '10',
    minimumOrder: '0',
    autoAcceptOrders: false
  });

  // Estados para gestión de managers
  const [newManagerEmail, setNewManagerEmail] = useState('');
  
  // Estados para usuarios disponibles
  const [availableOwners, setAvailableOwners] = useState<User[]>([]);
  const [availableManagers, setAvailableManagers] = useState<User[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  
  // Estado para coordenadas del mapa
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  // Función para manejar la selección de ubicación del mapa
  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setSelectedCoordinates(location);
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      address: location.address
    }));
  };

  // Cargar tiendas
  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm
      });
      
      if (selectedCity !== 'all') {
        params.append('city', selectedCity);
      }

      if (selectedState !== 'all') {
        params.append('state', selectedState);
      }

      if (selectedStatus !== 'all') {
        params.append('isActive', selectedStatus === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`${API_BASE_URL}/stores?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('🏪 Stores data:', data);
      
      if (data.success) {
        // Manejar tanto la estructura nueva (con paginación) como la antigua (sin paginación)
        if (data.data && data.data.stores) {
          setStores(data.data.stores);
          if (data.data.pagination) {
            setTotalPages(data.data.pagination.totalPages);
            setTotalStores(data.data.pagination.total);
          } else {
            setTotalPages(1);
            setTotalStores(data.data.stores.length);
          }
        } else if (data.data && Array.isArray(data.data)) {
          // Estructura alternativa donde data.data es directamente el array
          setStores(data.data);
          setTotalPages(1);
          setTotalStores(data.data.length);
        } else {
          console.error('Estructura de datos inesperada:', data);
          setStores([]);
          setTotalPages(0);
          setTotalStores(0);
        }
      } else {
        console.error('Error en respuesta:', data);
        setStores([]);
        setTotalPages(0);
        setTotalStores(0);
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar usuarios disponibles
  const loadAvailableUsers = async () => {
    try {
      const [ownersResponse, managersResponse] = await Promise.all([
        userService.getStoreOwners(),
        userService.getStoreManagers()
      ]);

      if (ownersResponse.success && ownersResponse.data) {
        setAvailableOwners(ownersResponse.data);
      }

      if (managersResponse.success && managersResponse.data) {
        setAvailableManagers(managersResponse.data);
      }
    } catch (error) {
      console.error('Error cargando usuarios disponibles:', error);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stores/stats`, {
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
      fetchStats();
      loadAvailableUsers();
    }
  }, [user, token, currentPage, searchTerm, selectedCity, selectedState, selectedStatus]);

  // Crear tienda
  const handleCreateStore = async () => {
    // Validar que se haya seleccionado una ubicación
    if (!selectedCoordinates) {
      alert(t('adminStores.errors.locationRequired'));
      return;
    }
    
    // Validar campos obligatorios
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone || !formData.email) {
      alert(t('adminStores.errors.requiredFields'));
      return;
    }

    // Validar que se haya seleccionado un propietario
    if (!selectedOwner) {
      alert('Por favor selecciona un propietario para la tienda');
      return;
    }
    try {
      const storeData = {
        ...formData,
        owner: selectedOwner,
        managers: selectedManagers,
        coordinates: {
          latitude: Number(formData.latitude) || 0,
          longitude: Number(formData.longitude) || 0
        },
        settings: {
          currency: formData.currency,
          taxRate: Number(formData.taxRate),
          deliveryRadius: Number(formData.deliveryRadius),
          minimumOrder: Number(formData.minimumOrder),
          autoAcceptOrders: formData.autoAcceptOrders
        }
      };

      const response = await fetch(`${API_BASE_URL}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          name: '', description: '', address: '', city: '', state: '', zipCode: '',
          country: 'Venezuela', phone: '', email: '', website: '', logo: '', banner: '',
          latitude: '', longitude: '', currency: 'USD', taxRate: '16.0',
          deliveryRadius: '10', minimumOrder: '0', autoAcceptOrders: false
        });
        setSelectedCoordinates(null);
        setSelectedOwner('');
        setSelectedManagers([]);
        fetchStores();
        fetchStats();
        alert(t('adminStores.messages.storeCreated'));
      } else {
        alert(data.message || t('adminStores.errors.createStore'));
      }
    } catch (error) {
      console.error('Error creando tienda:', error);
      alert(t('adminStores.errors.connection'));
    }
  };

     // Actualizar tienda
   const handleUpdateStore = async () => {
     if (!selectedStore) return;
     
     // Validar campos obligatorios
     if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone || !formData.email) {
       alert(t('adminStores.errors.requiredFields'));
       return;
     }
     
     try {
       const storeData = {
         ...formData,
         coordinates: {
           latitude: Number(formData.latitude) || 0,
           longitude: Number(formData.longitude) || 0
         },
         settings: {
           currency: formData.currency,
           taxRate: Number(formData.taxRate),
           deliveryRadius: Number(formData.deliveryRadius),
           minimumOrder: Number(formData.minimumOrder),
           autoAcceptOrders: formData.autoAcceptOrders
         }
       };

      const response = await fetch(`${API_BASE_URL}/stores/${selectedStore._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        setSelectedStore(null);
        fetchStores();
        alert(t('adminStores.messages.storeUpdated'));
      } else {
        alert(data.message || t('adminStores.errors.updateStore'));
      }
    } catch (error) {
      console.error('Error actualizando tienda:', error);
      alert(t('adminStores.errors.connection'));
    }
  };

  // Toggle estado de tienda (activar/desactivar)
  const handleToggleStoreStatus = async (storeId: string) => {
    const store = stores.find(s => s._id === storeId);
    const action = store?.isActive ? 'desactivar' : 'activar';
    const confirmed = window.confirm(`¿Estás seguro de que quieres ${action} esta tienda?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchStores();
        fetchStats();
        alert(data.message || `Tienda ${action}da exitosamente`);
      } else {
        alert(data.message || `Error al ${action} la tienda`);
      }
    } catch (error) {
      console.error(`Error ${action}ando tienda:`, error);
      alert('Error de conexión');
    }
  };

  // Desactivar tienda (método anterior mantenido por compatibilidad)
  const handleDeactivateStore = async (storeId: string) => {
    const confirmed = window.confirm(t('adminStores.confirmations.deactivate'));
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchStores();
        fetchStats();
        alert(t('adminStores.messages.storeDeactivated'));
      } else {
        alert(data.message || t('adminStores.errors.deactivateStore'));
      }
    } catch (error) {
      console.error('Error desactivando tienda:', error);
      alert(t('adminStores.errors.connection'));
    }
  };

  // Agregar manager
  const handleAddManager = async () => {
    if (!selectedStore || !newManagerEmail) return;

    try {
      const response = await fetch(`${API_BASE_URL}/stores/${selectedStore._id}/managers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ managerEmail: newManagerEmail })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewManagerEmail('');
        fetchStores();
        alert(t('adminStores.messages.managerAdded'));
      } else {
        alert(data.message || t('adminStores.errors.addManager'));
      }
    } catch (error) {
      console.error('Error agregando manager:', error);
      alert(t('adminStores.errors.connection'));
    }
  };

  // Remover manager
  const handleRemoveManager = async (managerId: string) => {
    if (!selectedStore) return;

    const confirmed = window.confirm(t('adminStores.confirmations.removeManager'));
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/stores/${selectedStore._id}/managers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ managerId })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchStores();
        alert(t('adminStores.messages.managerRemoved'));
      } else {
        alert(data.message || t('adminStores.errors.removeManager'));
      }
    } catch (error) {
      console.error('Error removiendo manager:', error);
      alert(t('adminStores.errors.connection'));
    }
  };

     // Abrir modal de edición
   const openEditModal = (store: Store) => {
     console.log('Abriendo modal de edición para tienda:', store.name);
     console.log('Coordenadas de la tienda:', store.coordinates);
     setSelectedStore(store);
     setFormData({
       name: store.name,
       description: store.description || '',
       address: store.address,
       city: store.city,
       state: store.state,
       zipCode: store.zipCode,
       country: store.country,
       phone: store.phone,
       email: store.email,
       website: store.website || '',
       logo: store.logo || '',
       banner: store.banner || '',
       latitude: store.coordinates?.latitude?.toString() || '0',
       longitude: store.coordinates?.longitude?.toString() || '0',
       currency: store.settings?.currency || 'USD',
       taxRate: (store.settings?.taxRate || 0).toString(),
       deliveryRadius: (store.settings?.deliveryRadius || 0).toString(),
       minimumOrder: (store.settings?.minimumOrder || 0).toString(),
       autoAcceptOrders: store.settings?.autoAcceptOrders || false
     });
           // Configurar las coordenadas iniciales para el mapa - Validar que existan
      if (store.coordinates && 
          typeof store.coordinates.latitude === 'number' && 
          typeof store.coordinates.longitude === 'number' &&
          !isNaN(store.coordinates.latitude) && 
          !isNaN(store.coordinates.longitude)) {
        setSelectedCoordinates({
          latitude: store.coordinates.latitude,
          longitude: store.coordinates.longitude,
          address: store.address
        });
      } else {
        setSelectedCoordinates(null);
      }
     setShowEditModal(true);
   };

  // Abrir modal de visualización
  const openViewModal = (store: Store) => {
    setSelectedStore(store);
    setShowViewModal(true);
  };

  // Abrir modal de managers
  const openManagersModal = (store: Store) => {
    setSelectedStore(store);
    setShowManagersModal(true);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminStores.access.denied')}</h2>
          <p className="text-gray-600">{t('adminStores.access.noPermissions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('adminStores.title')}</h1>
        <p className="text-gray-600 mt-2">{t('adminStores.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminStores.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.totalStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminStores.stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.activeStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminStores.stats.inactive')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.inactiveStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminStores.stats.cities')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#FFC300]">{stats.storesByCity.length}</p>
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
            placeholder={t('adminStores.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('adminStores.filters.allCities')}</option>
          {stats?.storesByCity.map((city) => (
            <option key={city._id} value={city._id}>{city._id} ({city.count})</option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('adminStores.filters.allStates')}</option>
          {stats?.storesByState.map((state) => (
            <option key={state._id} value={state._id}>{state._id} ({state.count})</option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('adminStores.filters.allStatuses')}</option>
          <option value="active">{t('adminStores.filters.active')}</option>
          <option value="inactive">{t('adminStores.filters.inactive')}</option>
        </select>
        
                 <button 
           onClick={() => setShowCreateModal(true)}
           className="flex items-center gap-2 bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors font-semibold"
         >
           <Plus className="w-5 h-5" />
           {t('adminStores.createStore')}
         </button>
      </div>

      {/* Tabla de tiendas */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#555555]">
            <thead className="bg-gray-50 dark:bg-[#444444]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminStores.table.headers.store')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminStores.table.headers.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminStores.table.headers.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminStores.table.headers.owner')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminStores.table.headers.managers')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminStores.table.headers.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminStores.table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#333333] divide-y divide-gray-200 dark:divide-[#555555]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">{t('adminStores.table.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : !stores || stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                    {t('adminStores.table.noData')}
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-[#444444]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {store.logo ? (
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={store.logo} 
                              alt={store.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Store className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{store.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{store.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">{store.city}, {store.state}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{store.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          {store.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {store.email}
                        </div>
                        {store.website && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                            <Globe className="w-4 h-4 text-gray-400 mr-2" />
                            {store.website}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>
                        <div className="font-medium">{store.owner?.name || 'Sin propietario'}</div>
                        <div className="text-gray-500 dark:text-gray-300">{store.owner?.email || 'Sin email'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">{store.managers?.length || 0} {t('adminStores.table.managersCount')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        store.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.isActive ? t('adminStores.status.active') : t('adminStores.status.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openViewModal(store)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title={t('adminStores.actions.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(store)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title={t('adminStores.actions.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openManagersModal(store)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title={t('adminStores.actions.manageManagers')}
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStoreStatus(store._id)}
                          className={`p-1 rounded ${
                            store.isActive 
                              ? 'text-orange-600 hover:text-orange-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={store.isActive ? 'Desactivar tienda' : 'Activar tienda'}
                        >
                          {store.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleDeactivateStore(store._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title={t('adminStores.actions.deactivate')}
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
                {t('adminStores.pagination.previous')}
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('adminStores.pagination.next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('adminStores.pagination.showing')} <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> {t('adminStores.pagination.to')}{' '}
                  <span className="font-medium">{Math.min(currentPage * 20, totalStores)}</span> {t('adminStores.pagination.of')}{' '}
                  <span className="font-medium">{totalStores}</span> {t('adminStores.pagination.results')}
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

             {/* Modal para crear tienda */}
       {showCreateModal && (
         <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
           <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-[#333333] max-h-[90vh] overflow-y-auto">
             <div className="mt-3">
               <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('adminStores.modals.create.title')}</h3>
              
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.storeName')}</label>
                  <input
                    type="text"
                    placeholder={t('adminStores.form.storeNamePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.email')}</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.description')}</label>
                  <textarea
                    placeholder={t('adminStores.form.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Selección de propietario y gestores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Propietario de la tienda *
                  </label>
                  <select
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  >
                    <option value="">Selecciona un propietario</option>
                    {availableOwners.map((owner) => (
                      <option key={owner._id} value={owner._id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Gestores de la tienda (opcional)
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-[#555555] rounded-md p-2">
                    {availableManagers.map((manager) => (
                      <label key={manager._id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedManagers.includes(manager._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedManagers([...selectedManagers, manager._id]);
                            } else {
                              setSelectedManagers(selectedManagers.filter(id => id !== manager._id));
                            }
                          }}
                          className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
                        />
                        <span className="text-sm text-gray-700 dark:text-white">
                          {manager.name} ({manager.email})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

                             {/* Mapa de ubicación */}
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">{t('adminStores.form.location')}</label>
                 <div className="border border-gray-300 dark:border-[#555555] rounded-md p-4">
                   <FreeStoreLocationMap
                     onLocationSelect={handleLocationSelect}
                     height="300px"
                   />
                 </div>
                 {selectedCoordinates && (
                   <div className="mt-2 p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded text-sm">
                     <span className="font-medium dark:text-white">{t('adminStores.form.locationSelected')}</span> <span className="dark:text-green-200">{selectedCoordinates.address}</span>
                   </div>
                 )}
               </div>

                                             {/* Información de ubicación */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.address')}</label>
                    <input
                      type="text"
                      placeholder={t('adminStores.form.addressPlaceholder')}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.city')}</label>
                    <input
                      type="text"
                      placeholder={t('adminStores.form.cityPlaceholder')}
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.state')}</label>
                    <input
                      type="text"
                      placeholder={t('adminStores.form.statePlaceholder')}
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.zipCode')}</label>
                    <input
                      type="text"
                      placeholder={t('adminStores.form.zipCodePlaceholder')}
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

               {/* Información de contacto */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                   <input
                     type="tel"
                     placeholder="Teléfono"
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Sitio web (opcional)</label>
                   <input
                     type="url"
                     placeholder="Sitio web (opcional)"
                     value={formData.website}
                     onChange={(e) => setFormData({...formData, website: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
               </div>
                             <div className="flex justify-end space-x-3 mt-6">
                 <button
                   onClick={() => {
                     setShowCreateModal(false);
                     setSelectedCoordinates(null);
                     setSelectedOwner('');
                     setSelectedManagers([]);
                     setFormData({
                       name: '', description: '', address: '', city: '', state: '', zipCode: '',
                       country: 'Venezuela', phone: '', email: '', website: '', logo: '', banner: '',
                       latitude: '', longitude: '', currency: 'USD', taxRate: '16.0',
                       deliveryRadius: '10', minimumOrder: '0', autoAcceptOrders: false
                     });
                   }}
                   className="px-4 py-2 bg-gray-300 dark:bg-[#555555] text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-[#666666]"
                 >
                   {t('adminStores.form.cancel')}
                 </button>
                 <button
                   onClick={handleCreateStore}
                   className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] font-semibold"
                 >
                   {t('adminStores.form.create')}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

                     {/* Modal para editar tienda */}
        {showEditModal && selectedStore && (
          <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-[#333333] max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('adminStores.modals.edit.title')}</h3>
               
               {/* Información básica */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">{t('adminStores.form.storeName')}</label>
                   <input
                     type="text"
                     placeholder={t('adminStores.form.storeNamePlaceholder')}
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">{t('adminStores.form.email')}</label>
                   <input
                     type="email"
                     placeholder="Email"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                   />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">{t('adminStores.form.description')}</label>
                   <textarea
                     placeholder={t('adminStores.form.descriptionPlaceholder')}
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                     rows={3}
                   />
                 </div>
               </div>

               {/* Mapa de ubicación */}
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.location')}</label>
                 <div className="border border-gray-300 rounded-md p-4">
                                       <FreeStoreLocationMap
                      onLocationSelect={handleLocationSelect}
                      initialLocation={(selectedStore.coordinates && 
                        typeof selectedStore.coordinates.latitude === 'number' && 
                        typeof selectedStore.coordinates.longitude === 'number' &&
                        !isNaN(selectedStore.coordinates.latitude) && 
                        !isNaN(selectedStore.coordinates.longitude)) 
                        ? selectedStore.coordinates 
                        : undefined}
                      height="300px"
                    />
                 </div>
                 {selectedCoordinates && (
                   <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                     <span className="font-medium">{t('adminStores.form.locationSelected')}</span> {selectedCoordinates.address}
                   </div>
                 )}
               </div>

               {/* Información de ubicación */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.address')}</label>
                   <input
                     type="text"
                     placeholder={t('adminStores.form.addressPlaceholder')}
                     value={formData.address}
                     onChange={(e) => setFormData({...formData, address: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.city')}</label>
                   <input
                     type="text"
                     placeholder={t('adminStores.form.cityPlaceholder')}
                     value={formData.city}
                     onChange={(e) => setFormData({...formData, city: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.state')}</label>
                   <input
                     type="text"
                     placeholder={t('adminStores.form.statePlaceholder')}
                     value={formData.state}
                     onChange={(e) => setFormData({...formData, state: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStores.form.zipCode')}</label>
                   <input
                     type="text"
                     placeholder={t('adminStores.form.zipCodePlaceholder')}
                     value={formData.zipCode}
                     onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
               </div>

               {/* Información de contacto */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                   <input
                     type="tel"
                     placeholder="Teléfono"
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Sitio web (opcional)</label>
                   <input
                     type="url"
                     placeholder="Sitio web (opcional)"
                     value={formData.website}
                     onChange={(e) => setFormData({...formData, website: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
               </div>

                               <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCoordinates(null);
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-[#555555] text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-[#666666]"
                  >
                    {t('adminStores.form.cancel')}
                  </button>
                  <button
                    onClick={handleUpdateStore}
                    className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] font-semibold"
                  >
                    {t('adminStores.form.update')}
                  </button>
                </div>
             </div>
           </div>
         </div>
       )}

             {/* Modal para ver detalles */}
       {showViewModal && selectedStore && (
         <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-[#333333]">
             <div className="mt-3">
               <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('adminStores.modals.view.title')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.name')}</label>
                  <p className="text-sm text-gray-900">{selectedStore.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.description')}</label>
                  <p className="text-sm text-gray-900">{selectedStore.description || t('adminStores.details.noDescription')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.address')}</label>
                  <p className="text-sm text-gray-900">{selectedStore.address}</p>
                  <p className="text-sm text-gray-500">{selectedStore.city}, {selectedStore.state} {selectedStore.zipCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.contact')}</label>
                  <p className="text-sm text-gray-900">{selectedStore.phone}</p>
                  <p className="text-sm text-gray-900">{selectedStore.email}</p>
                  {selectedStore.website && (
                    <p className="text-sm text-blue-600">{selectedStore.website}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.owner')}</label>
                  <p className="text-sm text-gray-900">{selectedStore.owner?.name || 'Sin propietario'}</p>
                  <p className="text-sm text-gray-500">{selectedStore.owner?.email || 'Sin email'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.managers')}</label>
                  <p className="text-sm text-gray-900">{selectedStore.managers?.length || 0} {t('adminStores.table.managersCount')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.status')}</label>
                  <p className="text-sm text-gray-900">{selectedStore.isActive ? t('adminStores.status.active') : t('adminStores.status.inactive')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminStores.details.settings')}</label>
                  <p className="text-sm text-gray-900">{t('adminStores.details.currency')} {selectedStore.settings?.currency || 'USD'}</p>
                  <p className="text-sm text-gray-900">{t('adminStores.details.taxRate')} {selectedStore.settings?.taxRate || 0}%</p>
                  <p className="text-sm text-gray-900">{t('adminStores.details.deliveryRadius')} {selectedStore.settings?.deliveryRadius || 0} {t('adminStores.details.km')}</p>
                </div>
              </div>
                             <div className="flex justify-end mt-6">
                 <button
                   onClick={() => setShowViewModal(false)}
                   className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] font-semibold"
                 >
                   {t('adminStores.form.close')}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

             {/* Modal para gestionar managers */}
       {showManagersModal && selectedStore && (
         <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-[#333333]">
             <div className="mt-3">
               <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFC300] mb-4">{t('adminStores.modals.managers.title')} - {selectedStore.name}</h3>
              
              {/* Agregar manager */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('adminStores.managers.addManager')}</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder={t('adminStores.managers.userEmail')}
                    value={newManagerEmail}
                    onChange={(e) => setNewManagerEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddManager}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {t('adminStores.managers.add')}
                  </button>
                </div>
              </div>

              {/* Lista de managers */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('adminStores.managers.currentManagers')}</h4>
                <div className="space-y-2">
                  {selectedStore.managers?.map((manager) => (
                    <div key={manager._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                        <p className="text-sm text-gray-500">{manager.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveManager(manager._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title={t('adminStores.managers.remove')}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(selectedStore.managers?.length || 0) === 0 && (
                    <p className="text-sm text-gray-500">{t('adminStores.managers.noManagers')}</p>
                  )}
                </div>
              </div>

                             <div className="flex justify-end mt-6">
                 <button
                   onClick={() => setShowManagersModal(false)}
                   className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-md hover:bg-[#E6B800] font-semibold"
                 >
                   {t('adminStores.form.close')}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
