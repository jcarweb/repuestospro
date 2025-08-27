import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Truck,
  Users,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Plus,
  Search,
  RefreshCw,
  BarChart3,
  Activity,
  Package,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

interface Delivery {
  _id: string;
  orderId: any;
  storeId: any;
  customerId: any;
  riderId?: any;
  riderType: 'internal' | 'external';
  riderName: string;
  riderPhone: string;
  status: 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    storeName: string;
  };
  deliveryLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    customerName: string;
    customerPhone: string;
  };
  deliveryFee: number;
  riderPayment: number;
  platformFee: number;
  trackingCode: string;
  trackingUrl: string;
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface Rider {
  _id: string;
  type: 'internal' | 'external';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  availability: {
    isOnline: boolean;
    isAvailable: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
      timestamp: string;
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
  vehicle: {
    type: 'motorcycle' | 'bicycle' | 'car';
    plate?: string;
    model?: string;
  };
}

interface DeliveryStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  assignedDeliveries: number;
  inTransitDeliveries: number;
  deliveredDeliveries: number;
  cancelledDeliveries: number;
  internalDeliveries: number;
  externalDeliveries: number;
  totalRevenue: number;
  totalRiderPayments: number;
  totalPlatformFees: number;
  averageDeliveryTime: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeRate: number;
}

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Estados principales
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riderTypeFilter, setRiderTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estados de visualización
  const [selectedView, setSelectedView] = useState<'deliveries' | 'riders' | 'stats'>('deliveries');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [deliveriesRes, ridersRes, statsRes] = await Promise.all([
        fetch('/api/delivery', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/riders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/delivery/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        setDeliveries(deliveriesData.data || []);
      }

      if (ridersRes.ok) {
        const ridersData = await ridersRes.json();
        setRiders(ridersData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

    } catch (err) {
      setError('Error cargando datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      case 'picked_up': return 'bg-orange-100 text-orange-800';
      case 'in_transit': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <UserCheck className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRiderStatusColor = (rider: Rider) => {
    if (!rider.availability.isOnline) return 'bg-gray-100 text-gray-800';
    if (!rider.availability.isAvailable) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (statusFilter && delivery.status !== statusFilter) return false;
    if (riderTypeFilter && delivery.riderType !== riderTypeFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        delivery.trackingCode.toLowerCase().includes(search) ||
        delivery.riderName.toLowerCase().includes(search) ||
        delivery.pickupLocation.storeName.toLowerCase().includes(search) ||
        delivery.deliveryLocation.customerName.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const filteredRiders = riders.filter(rider => {
    if (riderTypeFilter && rider.type !== riderTypeFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        `${rider.firstName} ${rider.lastName}`.toLowerCase().includes(search) ||
        rider.email.toLowerCase().includes(search) ||
        rider.phone.includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando dashboard de delivery...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="ml-2 text-red-800">Error: {error}</span>
          </div>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Delivery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestión de deliveries y riders con lógica mixta
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Actualizar</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <Filter className="h-4 w-4" />
            <span className="ml-2">Filtros</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium mb-2">Tipo de Rider</label>
              <select
                value={riderTypeFilter}
                onChange={(e) => setRiderTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="internal">Interno</option>
                <option value="external">Externo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Búsqueda</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por tracking, rider, tienda, cliente..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Navegación de vistas */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'deliveries', label: 'Deliveries', icon: Truck },
          { id: 'riders', label: 'Riders', icon: Users },
          { id: 'stats', label: 'Estadísticas', icon: BarChart3 }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              selectedView === view.id
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <view.icon className="h-4 w-4 mr-2" />
            {view.label}
          </button>
        ))}
      </div>

      {/* Vista de Deliveries */}
      {selectedView === 'deliveries' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Deliveries ({filteredDeliveries.length})</h3>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="h-4 w-4" />
                <span className="ml-2">Nuevo Delivery</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium">Tracking</th>
                    <th className="text-left py-3 px-4 font-medium">Rider</th>
                    <th className="text-left py-3 px-4 font-medium">Tienda</th>
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-right py-3 px-4 font-medium">Tarifa</th>
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery._id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{delivery.trackingCode}</p>
                          <p className="text-sm text-gray-500">{formatDate(delivery.createdAt)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{delivery.riderName}</p>
                          <p className="text-sm text-gray-500 capitalize">{delivery.riderType}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{delivery.pickupLocation.storeName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{delivery.deliveryLocation.customerName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {getStatusIcon(delivery.status)}
                          <span className="ml-1 capitalize">{delivery.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="font-medium">{formatCurrency(delivery.deliveryFee)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Riders */}
      {selectedView === 'riders' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Riders ({filteredRiders.length})</h3>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="h-4 w-4" />
                <span className="ml-2">Nuevo Rider</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRiders.map((rider) => (
                <div key={rider._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{rider.firstName} {rider.lastName}</h4>
                      <p className="text-sm text-gray-500">{rider.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiderStatusColor(rider)}`}>
                      {rider.availability.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="capitalize">{rider.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vehículo:</span>
                      <span className="capitalize">{rider.vehicle.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calificación:</span>
                      <span>{rider.rating.average.toFixed(1)} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entregas:</span>
                      <span>{rider.stats.completedDeliveries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ganancias:</span>
                      <span>{formatCurrency(rider.stats.totalEarnings)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Estadísticas */}
      {selectedView === 'stats' && stats && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDeliveries}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageDeliveryTime} min
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">A Tiempo</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.onTimeRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Estado de Deliveries</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Pendientes:</span>
                  <span className="font-medium">{stats.pendingDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Asignados:</span>
                  <span className="font-medium">{stats.assignedDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span>En tránsito:</span>
                  <span className="font-medium">{stats.inTransitDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entregados:</span>
                  <span className="font-medium">{stats.deliveredDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelados:</span>
                  <span className="font-medium">{stats.cancelledDeliveries}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución de Riders</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Riders Internos:</span>
                  <span className="font-medium">{stats.internalDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Riders Externos:</span>
                  <span className="font-medium">{stats.externalDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pagos a Riders:</span>
                  <span className="font-medium">{formatCurrency(stats.totalRiderPayments)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisión Plataforma:</span>
                  <span className="font-medium">{formatCurrency(stats.totalPlatformFees)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
