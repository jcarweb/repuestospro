import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

      const response = await fetch(`http://localhost:5000/api/stores?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStores(data.data.stores);
        setTotalPages(data.data.pagination.totalPages);
        setTotalStores(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stores/stats', {
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
    }
  }, [user, token, currentPage, searchTerm, selectedCity, selectedState, selectedStatus]);

  // Crear tienda
  const handleCreateStore = async () => {
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

      const response = await fetch('http://localhost:5000/api/stores', {
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
        fetchStores();
        fetchStats();
        alert('Tienda creada exitosamente');
      } else {
        alert(data.message || 'Error creando tienda');
      }
    } catch (error) {
      console.error('Error creando tienda:', error);
      alert('Error de conexión');
    }
  };

  // Actualizar tienda
  const handleUpdateStore = async () => {
    if (!selectedStore) return;
    
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

      const response = await fetch(`http://localhost:5000/api/stores/${selectedStore._id}`, {
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
        alert('Tienda actualizada exitosamente');
      } else {
        alert(data.message || 'Error actualizando tienda');
      }
    } catch (error) {
      console.error('Error actualizando tienda:', error);
      alert('Error de conexión');
    }
  };

  // Desactivar tienda
  const handleDeactivateStore = async (storeId: string) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas desactivar esta tienda?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/stores/${storeId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchStores();
        fetchStats();
        alert('Tienda desactivada exitosamente');
      } else {
        alert(data.message || 'Error desactivando tienda');
      }
    } catch (error) {
      console.error('Error desactivando tienda:', error);
      alert('Error de conexión');
    }
  };

  // Agregar manager
  const handleAddManager = async () => {
    if (!selectedStore || !newManagerEmail) return;

    try {
      const response = await fetch(`http://localhost:5000/api/stores/${selectedStore._id}/managers`, {
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
        alert('Manager agregado exitosamente');
      } else {
        alert(data.message || 'Error agregando manager');
      }
    } catch (error) {
      console.error('Error agregando manager:', error);
      alert('Error de conexión');
    }
  };

  // Remover manager
  const handleRemoveManager = async (managerId: string) => {
    if (!selectedStore) return;

    const confirmed = window.confirm('¿Estás seguro de que deseas remover este manager?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/stores/${selectedStore._id}/managers`, {
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
        alert('Manager removido exitosamente');
      } else {
        alert(data.message || 'Error removiendo manager');
      }
    } catch (error) {
      console.error('Error removiendo manager:', error);
      alert('Error de conexión');
    }
  };

  // Abrir modal de edición
  const openEditModal = (store: Store) => {
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
      latitude: store.coordinates.latitude.toString(),
      longitude: store.coordinates.longitude.toString(),
      currency: store.settings.currency,
      taxRate: store.settings.taxRate.toString(),
      deliveryRadius: store.settings.deliveryRadius.toString(),
      minimumOrder: store.settings.minimumOrder.toString(),
      autoAcceptOrders: store.settings.autoAcceptOrders
    });
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Tiendas</h1>
        <p className="text-gray-600 mt-2">Administra las tiendas del sistema</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ciudades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.storesByCity.length}</p>
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
            placeholder="Buscar tiendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las ciudades</option>
          {stats?.storesByCity.map((city) => (
            <option key={city._id} value={city._id}>{city._id} ({city.count})</option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          {stats?.storesByState.map((state) => (
            <option key={state._id} value={state._id}>{state._id} ({state.count})</option>
          ))}
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
          Crear Tienda
        </button>
      </div>

      {/* Tabla de tiendas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tienda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propietario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Managers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Cargando tiendas...</span>
                    </div>
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron tiendas
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store._id} className="hover:bg-gray-50">
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
                          <div className="text-sm font-medium text-gray-900">{store.name}</div>
                          <div className="text-sm text-gray-500">{store.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{store.city}, {store.state}</div>
                          <div className="text-sm text-gray-500">{store.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          {store.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {store.email}
                        </div>
                        {store.website && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Globe className="w-4 h-4 text-gray-400 mr-2" />
                            {store.website}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{store.owner.name}</div>
                        <div className="text-gray-500">{store.owner.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{store.managers.length} managers</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        store.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openViewModal(store)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(store)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openManagersModal(store)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Gestionar managers"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeactivateStore(store._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Desactivar"
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
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(currentPage * 20, totalStores)}</span> de{' '}
                  <span className="font-medium">{totalStores}</span> resultados
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nueva Tienda</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la tienda"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Estado"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Código postal"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="Sitio web (opcional)"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateStore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar tienda */}
      {showEditModal && selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Tienda</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la tienda"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Estado"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Código postal"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="Sitio web (opcional)"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {showViewModal && selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Tienda</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre:</label>
                  <p className="text-sm text-gray-900">{selectedStore.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Descripción:</label>
                  <p className="text-sm text-gray-900">{selectedStore.description || 'Sin descripción'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Dirección:</label>
                  <p className="text-sm text-gray-900">{selectedStore.address}</p>
                  <p className="text-sm text-gray-500">{selectedStore.city}, {selectedStore.state} {selectedStore.zipCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contacto:</label>
                  <p className="text-sm text-gray-900">{selectedStore.phone}</p>
                  <p className="text-sm text-gray-900">{selectedStore.email}</p>
                  {selectedStore.website && (
                    <p className="text-sm text-blue-600">{selectedStore.website}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Propietario:</label>
                  <p className="text-sm text-gray-900">{selectedStore.owner.name}</p>
                  <p className="text-sm text-gray-500">{selectedStore.owner.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Managers:</label>
                  <p className="text-sm text-gray-900">{selectedStore.managers.length} managers</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado:</label>
                  <p className="text-sm text-gray-900">{selectedStore.isActive ? 'Activa' : 'Inactiva'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Configuración:</label>
                  <p className="text-sm text-gray-900">Moneda: {selectedStore.settings.currency}</p>
                  <p className="text-sm text-gray-900">IVA: {selectedStore.settings.taxRate}%</p>
                  <p className="text-sm text-gray-900">Radio de entrega: {selectedStore.settings.deliveryRadius} km</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para gestionar managers */}
      {showManagersModal && selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gestionar Managers - {selectedStore.name}</h3>
              
              {/* Agregar manager */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Agregar Manager</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Email del usuario"
                    value={newManagerEmail}
                    onChange={(e) => setNewManagerEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddManager}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Lista de managers */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Managers Actuales</h4>
                <div className="space-y-2">
                  {selectedStore.managers.map((manager) => (
                    <div key={manager._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                        <p className="text-sm text-gray-500">{manager.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveManager(manager._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remover manager"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {selectedStore.managers.length === 0 && (
                    <p className="text-sm text-gray-500">No hay managers asignados</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowManagersModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
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
