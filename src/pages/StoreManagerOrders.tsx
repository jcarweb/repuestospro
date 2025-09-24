import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Download,
  Printer,
  MessageSquare,
  Star,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      sku: string;
      price: number;
      image?: string;
    };
    quantity: number;
    total: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'transfer' | 'crypto';
  shippingMethod: 'pickup' | 'delivery' | 'express';
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  notes?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
  assignedDelivery?: {
    _id: string;
    name: string;
    phone: string;
  };
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  thisWeekOrders: number;
  thisMonthOrders: number;
}

const StoreManagerOrders: React.FC = () => {
  const { user, token } = useAuth();
  const { activeStore } = useActiveStore();
  const { t } = useLanguage();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (activeStore?._id) {
      fetchOrders();
      fetchStats();
    }
  }, [activeStore]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (activeStore?._id) {
      fetchOrders();
    }
  }, [searchTerm, statusFilter, paymentFilter, dateFilter]);

  const fetchOrders = async () => {
    if (!activeStore?._id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('storeId', activeStore._id);
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (dateFilter !== 'all') params.append('dateRange', dateFilter);

      const response = await fetch(`http://localhost:5000/api/orders/store-manager?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!activeStore?._id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/store-manager/stats/${activeStore._id}`, {
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        fetchStats();
        alert('Estado de la orden actualizado exitosamente');
      } else {
        alert(data.message || 'Error actualizando la orden');
      }
    } catch (error) {
      console.error('Error actualizando orden:', error);
      alert('Error de conexión');
    }
  };

  const handleAssignDelivery = async (orderId: string, deliveryId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/assign-delivery`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deliveryId })
      });

      const data = await response.json();
      if (data.success) {
        fetchOrders();
        alert('Delivery asignado exitosamente');
      } else {
        alert(data.message || 'Error asignando delivery');
      }
    } catch (error) {
      console.error('Error asignando delivery:', error);
      alert('Error de conexión');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'returned': return <ArrowUpDown className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-gray-600 mt-2">
          Administra los pedidos de {activeStore?.name || 'tu tienda'}
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por número de orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
            <option value="returned">Devuelto</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          >
            <option value="all">Todos los pagos</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Pedidos</h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchOrders}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowUpdateModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Actualizar estado"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles de orden */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Detalles de la Orden #{selectedOrder.orderNumber}</h2>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información del cliente */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información del Cliente</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span>{selectedOrder.customer.address}</span>
                  </div>
                </div>
              </div>

              {/* Información de la orden */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Información de la Orden</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pago:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método de Pago:</span>
                    <span className="capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span className="capitalize">{selectedOrder.shippingMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items de la orden */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Items de la Orden</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {item.product.sku}</div>
                      <div className="text-sm text-gray-500">Cantidad: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.total)}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(item.product.price)} c/u</div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            {selectedOrder.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Notas</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>{selectedOrder.notes}</p>
                </div>
              </div>
            )}

            {/* Delivery asignado */}
            {selectedOrder.assignedDelivery && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Delivery Asignado</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedOrder.assignedDelivery.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.assignedDelivery.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de actualización de estado */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Actualizar Estado</h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado
                </label>
                <select
                  onChange={(e) => {
                    const newStatus = e.target.value as Order['status'];
                    handleUpdateOrderStatus(selectedOrder._id, newStatus);
                    setShowUpdateModal(false);
                    setSelectedOrder(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="returned">Devuelto</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerOrders;