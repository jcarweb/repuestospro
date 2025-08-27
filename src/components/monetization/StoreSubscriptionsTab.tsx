import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  CreditCard,
  Star,
  Crown,
  Check,
  Users,
  Store,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import api from '../../config/api';

interface StoreSubscription {
  _id: string;
  store: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  subscription?: {
    _id: string;
    name: string;
    type: 'basic' | 'pro' | 'elite';
    price: number;
    features: string[];
  };
  subscriptionStatus: 'active' | 'inactive' | 'expired' | 'pending';
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  _id: string;
  name: string;
  type: 'basic' | 'pro' | 'elite';
  price: number;
  features: string[];
}

const StoreSubscriptionsTab: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [storeSubscriptions, setStoreSubscriptions] = useState<StoreSubscription[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreSubscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  useEffect(() => {
    fetchStoreSubscriptions();
    fetchSubscriptions();
  }, []);

  const fetchStoreSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/store-subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Datos recibidos de suscripciones:', data);
        setStoreSubscriptions(data.storeSubscriptions || []);
      } else {
        console.error('❌ Error en respuesta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching store subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/monetization/subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleAssignSubscription = async (storeId: string, subscriptionId: string, status: string, expiresAt?: string) => {
    try {
      // Validar que se haya seleccionado un plan si el estado es activo
      if (status === 'active' && !subscriptionId) {
        alert('Debe seleccionar un plan de suscripción para activar la tienda');
        return;
      }

      // Procesar la fecha de expiración para evitar problemas de zona horaria
      let processedExpiresAt = null;
      if (expiresAt) {
        // Crear fecha en zona horaria local y convertir a ISO string
        const [year, month, day] = expiresAt.split('-');
        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        // Ajustar para que se guarde como medianoche en la zona horaria local
        processedExpiresAt = localDate.toISOString();
      }

      const requestBody: any = {
        status,
        expiresAt: processedExpiresAt
      };

      // Solo incluir subscriptionId si se seleccionó un plan
      if (subscriptionId) {
        requestBody.subscriptionId = subscriptionId;
      }

      console.log('📅 Enviando fecha al backend:', {
        original: expiresAt,
        processed: processedExpiresAt,
        requestBody
      });

      const response = await fetch(`/api/admin/store-subscriptions/${storeId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setShowAssignModal(false);
        setSelectedStore(null);
        fetchStoreSubscriptions();
        alert('Suscripción asignada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al asignar suscripción');
      }
    } catch (error) {
      console.error('Error assigning subscription:', error);
      alert('Error al asignar suscripción');
    }
  };

  const handleUpdateStatus = async (storeId: string, status: string) => {
    const store = storeSubscriptions.find(s => s._id === storeId);
    const statusLabels = {
      'active': 'activar',
      'inactive': 'desactivar',
      'expired': 'marcar como expirado',
      'pending': 'marcar como pendiente'
    };
    
    const confirmMessage = `¿Está seguro de que desea ${statusLabels[status as keyof typeof statusLabels]} la suscripción de ${store?.store.name}?`;
    
    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/admin/store-subscriptions/${storeId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });

        if (response.ok) {
          fetchStoreSubscriptions();
          alert('Estado actualizado exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Error al actualizar estado');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Error al actualizar estado');
      }
    }
  };

  const handleCleanTestData = async () => {
    const confirmMessage = '¿Está seguro de que desea eliminar todos los datos de prueba? Esta acción no se puede deshacer.';
    
    if (confirm(confirmMessage)) {
      try {
        const response = await fetch('/api/admin/clean-test-data', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          alert(`Datos de prueba eliminados exitosamente.\nTiendas eliminadas: ${data.deletedStores}\nProductos eliminados: ${data.deletedProducts}`);
          fetchStoreSubscriptions();
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Error al limpiar datos de prueba');
        }
      } catch (error) {
        console.error('Error cleaning test data:', error);
        alert('Error al limpiar datos de prueba');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'basic':
        return <Users className="h-4 w-4" />;
      case 'pro':
        return <Star className="h-4 w-4" />;
      case 'elite':
        return <Crown className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Función para manejar fechas sin problemas de zona horaria
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      console.log('📅 Formateando fecha:', dateString);
      
      // Extraer solo la parte de la fecha (YYYY-MM-DD)
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      
      // Crear fecha usando el constructor que maneja zona horaria local
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        console.error('📅 Fecha inválida después de parseo:', { year, month, day });
        return 'Fecha inválida';
      }
      
      const formatted = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      console.log('📅 Fecha formateada:', { original: dateString, parsed: { year, month, day }, result: formatted });
      return formatted;
    } catch (error) {
      console.error('Error formateando fecha:', dateString, error);
      return 'Fecha inválida';
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      console.log('📅 Formateando fecha para input:', dateString);
      
      // Extraer solo la parte de la fecha (YYYY-MM-DD)
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      
      // Crear fecha usando el constructor que maneja zona horaria local
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        console.error('📅 Fecha inválida para input:', { year, month, day });
        return '';
      }
      
      // Formatear como YYYY-MM-DD para el input
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      
      const result = `${yearStr}-${monthStr}-${dayStr}`;
      console.log('📅 Fecha para input:', { original: dateString, result });
      return result;
    } catch (error) {
      console.error('Error formateando fecha para input:', dateString, error);
      return '';
    }
  };

  const filteredStoreSubscriptions = storeSubscriptions.filter(store => {
    const matchesSearch = store.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.store.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || store.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || store.subscription?.type === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suscripciones de Tiendas
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestiona las suscripciones de todas las tiendas
          </p>
        </div>
                                   <div className="flex gap-2">
            <button
              onClick={fetchStoreSubscriptions}
                              className="bg-racing-500 hover:bg-racing-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar tiendas..."
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
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="expired">Expirado</option>
              <option value="pending">Pendiente</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
            >
              <option value="all">Todos los planes</option>
              <option value="basic">Básico</option>
              <option value="pro">Pro</option>
              <option value="elite">Élite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Cargando suscripciones...</p>
          </div>
        ) : filteredStoreSubscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay tiendas
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || statusFilter !== 'all' || planFilter !== 'all'
                ? 'No se encontraron tiendas con los filtros aplicados'
                : 'No hay tiendas registradas'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#444444]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tienda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plan Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expiración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#333333] divide-y divide-gray-200 dark:divide-[#555555]">
                {filteredStoreSubscriptions.map((store) => (
                  <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-[#444444]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {store.store.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {store.store.email}
                        </div>
                        {store.store.phone && (
                          <div className="text-xs text-gray-400 dark:text-gray-400">
                            {store.store.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {store.subscription ? (
                        <div className="flex items-center">
                          {getPlanIcon(store.subscription.type)}
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">
                            {store.subscription.name}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">
                            ${store.subscription.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          Sin plan asignado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.subscriptionStatus)}`}>
                        {getStatusIcon(store.subscriptionStatus)}
                        <span className="ml-1 capitalize">
                          {store.subscriptionStatus}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {store.subscriptionExpiresAt ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(store.subscriptionExpiresAt)}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-300">
                          Sin fecha de expiración
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStore(store);
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Asignar/Editar suscripción"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(store._id, 'active')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Activar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(store._id, 'inactive')}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                          title="Desactivar"
                        >
                          <AlertTriangle className="h-4 w-4" />
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

             {/* Modal de Asignación */}
       {showAssignModal && selectedStore && selectedStore.store && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#333333] rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#555555]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Asignar Suscripción
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStore(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
                         <div className="p-6">
               <div className="mb-4">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                   {selectedStore.store?.name || 'Tienda sin nombre'}
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300">
                   {selectedStore.store?.email || 'Sin email'}
                 </p>
               </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan de Suscripción
                  </label>
                  <select
                    id="subscriptionId"
                    defaultValue={selectedStore.subscription?._id || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
                  >
                    <option value="">Sin plan</option>
                    {subscriptions.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name} - ${sub.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    id="status"
                    defaultValue={selectedStore.subscriptionStatus}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="expired">Expirado</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Expiración (opcional)
                  </label>
                  <input
                    type="date"
                    id="expiresAt"
                    min={new Date().toISOString().split('T')[0]}
                    defaultValue={formatDateForInput(selectedStore.subscriptionExpiresAt || '')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStore(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-[#555555] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#444444] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const subscriptionId = (document.getElementById('subscriptionId') as HTMLSelectElement).value;
                    const status = (document.getElementById('status') as HTMLSelectElement).value;
                    const expiresAt = (document.getElementById('expiresAt') as HTMLInputElement).value;
                    
                    // Validaciones adicionales
                    if (status === 'active' && !subscriptionId) {
                      alert('Debe seleccionar un plan de suscripción para activar la tienda');
                      return;
                    }
                    
                    if (expiresAt && new Date(expiresAt) < new Date()) {
                      alert('La fecha de expiración no puede ser en el pasado');
                      return;
                    }
                    
                                         const confirmMessage = subscriptionId 
                       ? `¿Está seguro de que desea asignar el plan seleccionado a ${selectedStore.store?.name || 'esta tienda'}?`
                       : `¿Está seguro de que desea remover el plan de suscripción de ${selectedStore.store?.name || 'esta tienda'}?`;
                    
                                         if (confirm(confirmMessage)) {
                       handleAssignSubscription(
                         selectedStore.store?._id || selectedStore._id,
                         subscriptionId,
                         status,
                         expiresAt || undefined
                       );
                     }
                  }}
                  className="px-4 py-2 bg-racing-500 text-white rounded-lg hover:bg-racing-600 transition-colors"
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSubscriptionsTab;
