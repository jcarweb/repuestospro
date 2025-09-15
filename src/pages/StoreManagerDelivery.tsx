import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Delivery {
  _id: string;
  orderId: string;
  storeId: string;
  customerId: string;
  riderId?: string;
  riderType: 'internal' | 'external';
  riderName: string;
  riderPhone: string;
  status: 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  pickupLocation: {
    address: string;
    storeName: string;
  };
  deliveryLocation: {
    address: string;
    customerName: string;
    customerPhone: string;
  };
  deliveryFee: number;
  riderPayment: number;
  platformFee: number;
  trackingCode: string;
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface Rider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'internal' | 'external';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  availability: {
    isOnline: boolean;
    isAvailable: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
  rating: {
    average: number;
    totalReviews: number;
  };
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    totalEarnings: number;
    averageDeliveryTime: number;
  };
}

const StoreManagerDelivery: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { t } = useLanguage();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'deliveries' | 'riders' | 'stats'>('deliveries');
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riderTypeFilter, setRiderTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (activeStore?._id) {
      loadData();
    }
  }, [activeStore]);

  const loadData = async () => {
    if (!activeStore?._id) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Cargar deliveries de la tienda
      const deliveriesResponse = await fetch(`/api/delivery?storeId=${activeStore._id}`, {
        headers
      });

      if (deliveriesResponse.ok) {
        const deliveriesData = await deliveriesResponse.json();
        setDeliveries(deliveriesData.data || []);
      }

      // Cargar riders disponibles
      const ridersResponse = await fetch('/api/riders', {
        headers
      });

      if (ridersResponse.ok) {
        const ridersData = await ridersResponse.json();
        setRiders(ridersData.data || []);
      }

    } catch (err) {
      console.error('Error cargando datos de delivery:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '⏳',
      assigned: '📋',
      accepted: '✅',
      picked_up: '📦',
      in_transit: '🚚',
      delivered: '🎉',
      cancelled: '❌',
      failed: '💥'
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const getRiderStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending_verification: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-VE');
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (statusFilter && delivery.status !== statusFilter) return false;
    if (riderTypeFilter && delivery.riderType !== riderTypeFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        delivery.trackingCode.toLowerCase().includes(search) ||
        delivery.deliveryLocation.customerName.toLowerCase().includes(search) ||
        delivery.riderName.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const filteredRiders = riders.filter(rider => {
    if (riderTypeFilter && rider.type !== riderTypeFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        rider.firstName.toLowerCase().includes(search) ||
        rider.lastName.toLowerCase().includes(search) ||
        rider.email.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    totalDeliveries: deliveries.length,
    pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
    inTransitDeliveries: deliveries.filter(d => d.status === 'in_transit').length,
    deliveredDeliveries: deliveries.filter(d => d.status === 'delivered').length,
    totalRiders: riders.length,
    activeRiders: riders.filter(r => r.status === 'active').length,
    onlineRiders: riders.filter(r => r.availability.isOnline).length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Delivery</h1>
        <p className="text-gray-600 mt-2">
          Gestiona los deliveries de {activeStore?.name || 'tu tienda'}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="assigned">Asignado</option>
              <option value="accepted">Aceptado</option>
              <option value="picked_up">Recogido</option>
              <option value="in_transit">En tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
              <option value="failed">Fallido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Rider
            </label>
            <select
              value={riderTypeFilter}
              onChange={(e) => setRiderTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos los tipos</option>
              <option value="internal">Interno</option>
              <option value="external">Externo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Código, cliente, rider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

             {/* Leyenda de iconos */}
       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
         <div className="flex items-center space-x-6">
           <div className="flex items-center space-x-2">
             <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden">
               <img 
                 src="/piezasya.png" 
                 alt="PiezasYa" 
                 className="w-full h-full object-contain"
               />
             </div>
             <span className="text-sm text-gray-700">Delivery Interno (Propio)</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
               <span className="text-red-600 text-sm">🏍️</span>
             </div>
             <span className="text-sm text-gray-700">Delivery Externo (Aliado)</span>
           </div>
         </div>
       </div>

       {/* Navegación de vistas */}
       <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveView('deliveries')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === 'deliveries'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Deliveries ({filteredDeliveries.length})
        </button>
        <button
          onClick={() => setActiveView('riders')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === 'riders'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Riders ({filteredRiders.length})
        </button>
        <button
          onClick={() => setActiveView('stats')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === 'stats'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* Vista de Deliveries */}
      {activeView === 'deliveries' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarifa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                                         <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center justify-between">
                         <div>
                           <div className="text-sm font-medium text-gray-900">
                             {delivery.trackingCode}
                           </div>
                           <div className="text-xs text-gray-500">
                             {delivery.riderType === 'internal' ? 'Delivery Interno' : 'Delivery Externo'}
                           </div>
                         </div>
                         <div className="flex-shrink-0">
                           {delivery.riderType === 'internal' ? (
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                               <img 
                                 src="/piezasya.png" 
                                 alt="PiezasYa" 
                                 className="w-full h-full object-contain"
                               />
                             </div>
                           ) : (
                             <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                               <span className="text-red-600 text-lg">🏍️</span>
                             </div>
                           )}
                         </div>
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {delivery.deliveryLocation.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {delivery.deliveryLocation.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {delivery.riderName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {delivery.riderType === 'internal' ? 'Interno' : 'Externo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)} {delivery.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(delivery.deliveryFee)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(delivery.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDeliveries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron deliveries</p>
            </div>
          )}
        </div>
      )}

      {/* Vista de Riders */}
      {activeView === 'riders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRiders.map((rider) => (
                         <div key={rider._id} className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0">
                     {rider.type === 'internal' ? (
                       <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                         <img 
                           src="/piezasya.png" 
                           alt="PiezasYa" 
                           className="w-full h-full object-contain"
                         />
                       </div>
                     ) : (
                       <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                         <span className="text-red-600 text-xl">🏍️</span>
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className="text-lg font-medium text-gray-900">
                       {rider.firstName} {rider.lastName}
                     </h3>
                     <p className="text-sm text-gray-500">{rider.email}</p>
                   </div>
                 </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiderStatusColor(rider.status)}`}>
                  {rider.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium">
                    {rider.type === 'internal' ? 'Interno' : 'Externo'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="font-medium">{rider.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Calificación:</span>
                  <span className="font-medium">⭐ {rider.rating.average}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Entregas:</span>
                  <span className="font-medium">{rider.stats.completedDeliveries}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full ${rider.availability.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-500">
                  {rider.availability.isOnline ? 'En línea' : 'Desconectado'}
                </span>
              </div>
            </div>
          ))}
          {filteredRiders.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No se encontraron riders</p>
            </div>
          )}
        </div>
      )}

      {/* Vista de Estadísticas */}
      {activeView === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Entregados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveredDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Riders Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRiders}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerDelivery;
