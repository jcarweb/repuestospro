import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign,
  User,
  Store,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Calendar,
  Navigation,
  Star,
  FileText,
  Bell,
  Download,
  Share2
} from 'lucide-react';
import { getMockDeliveryOrders, getMockDeliveryOrdersByStatus } from '../data/mockDeliveryOrders';
import type { DeliveryOrder } from '../data/mockDeliveryOrders';

const DeliveryOrders: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Estados
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadOrders();
  }, []);

  // Filtrar órdenes cuando cambien los filtros
  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders = getMockDeliveryOrders();
      setOrders(mockOrders);
    } catch (err) {
      setError(t('deliveryOrders.error'));
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.trackingCode.toLowerCase().includes(term) ||
        order.customerId.name.toLowerCase().includes(term) ||
        order.storeId.name.toLowerCase().includes(term) ||
        order.orderId.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-racing-100 text-racing-800 dark:bg-racing-900 dark:text-racing-300';
      case 'assigned': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300';
      case 'accepted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'picked_up': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'in_transit': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-alert-100 text-alert-800 dark:bg-alert-900 dark:text-alert-300';
      case 'failed': return 'bg-carbon-100 text-carbon-800 dark:bg-carbon-900 dark:text-carbon-300';
      default: return 'bg-carbon-100 text-carbon-800 dark:bg-carbon-900 dark:text-carbon-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <Package className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'picked_up': return <Truck className="h-4 w-4" />;
      case 'in_transit': return <Navigation className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending': return t('deliveryOrders.status.pending');
      case 'assigned': return t('deliveryOrders.status.assigned');
      case 'accepted': return t('deliveryOrders.status.accepted');
      case 'picked_up': return t('deliveryOrders.status.pickedUp');
      case 'in_transit': return t('deliveryOrders.status.inTransit');
      case 'delivered': return t('deliveryOrders.status.delivered');
      case 'cancelled': return t('deliveryOrders.status.cancelled');
      case 'failed': return t('deliveryOrders.status.failed');
      default: return status;
    }
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

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Aquí se haría la llamada al API para actualizar el estado
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      
      // Simular actualización
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Código', 'Cliente', 'Estado', 'Entrega Estimada', 'Ganancias', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.trackingCode,
        order.customerId.name,
        getStatusTranslation(order.status),
        order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        order.riderPayment.toFixed(2),
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_delivery_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const exportToExcel = () => {
    // Para Excel necesitaríamos una librería como xlsx
    // Por ahora exportamos como CSV con extensión .xlsx
    exportToCSV();
  };

  const exportToPDF = () => {
    // Para PDF necesitaríamos una librería como jsPDF
    // Por ahora mostramos un mensaje
    alert('Funcionalidad de PDF en desarrollo');
    setShowExportModal(false);
  };

  const shareViaEmail = (recipient: string, message: string) => {
    const subject = 'Pedidos de Delivery - PiezasYA';
    const body = `${message}\n\nResumen de pedidos:\n${filteredOrders.map(order => 
      `- ${order.trackingCode}: ${order.customerId.name} (${getStatusTranslation(order.status)})`
    ).join('\n')}`;
    
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    setShowShareModal(false);
  };

  const shareViaWhatsApp = (message: string) => {
    const text = `${message}\n\nResumen de pedidos:\n${filteredOrders.map(order => 
      `- ${order.trackingCode}: ${order.customerId.name} (${getStatusTranslation(order.status)})`
    ).join('\n')}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareModal(false);
  };

  const shareViaLink = () => {
    const link = `${window.location.origin}/delivery/orders`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Enlace copiado al portapapeles');
    });
    setShowShareModal(false);
  };

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => ['pending', 'assigned'].includes(o.status)).length;
    const inProgress = orders.filter(o => ['accepted', 'picked_up', 'in_transit'].includes(o.status)).length;
    const completed = orders.filter(o => o.status === 'delivered').length;
    
    return { total, pending, inProgress, completed };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">{t('deliveryOrders.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="ml-2 text-red-800 dark:text-red-200">{error}</span>
          </div>
          <button
            onClick={loadOrders}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('deliveryOrders.refresh')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-onix-900 dark:text-snow-500">
            {t('deliveryOrders.title')}
          </h1>
          <p className="text-carbon-600 dark:text-carbon-400 mt-2">
            {t('deliveryOrders.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#000000] transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('deliveryOrders.export.export') || 'Exportar'}
          </button>
          <button 
            onClick={handleShare}
            className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t('deliveryOrders.share.share') || 'Compartir'}
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                {t('deliveryOrders.stats.total')}
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                {orders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
          <div className="flex items-center">
            <div className="p-2 bg-racing-100 dark:bg-racing-900 rounded-lg">
              <Clock className="h-6 w-6 text-racing-600 dark:text-racing-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                {t('deliveryOrders.stats.pending')}
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                {orders.filter(o => ['pending', 'assigned'].includes(o.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                {t('deliveryOrders.stats.inProgress')}
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                {orders.filter(o => ['accepted', 'picked_up', 'in_transit'].includes(o.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                {t('deliveryOrders.stats.completed')}
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carbon-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t('deliveryOrders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
            />
          </div>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
        >
          <option value="all">{t('deliveryOrders.filters.allStatuses')}</option>
          <option value="pending">{t('deliveryOrders.filters.pending')}</option>
          <option value="assigned">{t('deliveryOrders.filters.assigned')}</option>
          <option value="accepted">{t('deliveryOrders.filters.accepted')}</option>
          <option value="picked_up">{t('deliveryOrders.filters.pickedUp')}</option>
          <option value="in_transit">{t('deliveryOrders.filters.inTransit')}</option>
          <option value="delivered">{t('deliveryOrders.filters.delivered')}</option>
          <option value="cancelled">{t('deliveryOrders.filters.cancelled')}</option>
        </select>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('deliveryOrders.refresh')}
        </button>
      </div>

      {/* Lista de pedidos */}
      <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-carbon-200 dark:divide-carbon-700">
            <thead className="bg-carbon-50 dark:bg-carbon-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                  {t('deliveryOrders.table.order')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                  {t('deliveryOrders.table.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                  {t('deliveryOrders.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                  {t('deliveryOrders.table.estimatedDelivery')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                  {t('deliveryOrders.table.earnings')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                  {t('deliveryOrders.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-snow-500 dark:bg-carbon-800 divide-y divide-carbon-200 dark:divide-carbon-700">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-carbon-50 dark:hover:bg-carbon-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-onix-900 dark:text-snow-500">
                        #{order.trackingCode}
                      </div>
                      <div className="text-sm text-carbon-500 dark:text-carbon-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-onix-900 dark:text-snow-500">
                        {order.customerId.name}
                      </div>
                      <div className="text-sm text-carbon-500 dark:text-carbon-400">
                        {order.customerId.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">
                        {order.status === 'pending' ? t('deliveryOrders.status.pending') :
                         order.status === 'assigned' ? t('deliveryOrders.status.assigned') :
                         order.status === 'accepted' ? t('deliveryOrders.status.accepted') :
                         order.status === 'picked_up' ? t('deliveryOrders.status.pickedUp') :
                         order.status === 'in_transit' ? t('deliveryOrders.status.inTransit') :
                         order.status === 'delivered' ? t('deliveryOrders.status.delivered') :
                         order.status === 'cancelled' ? t('deliveryOrders.status.cancelled') :
                         order.status === 'failed' ? t('deliveryOrders.status.failed') : order.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-onix-900 dark:text-snow-500">
                    {order.estimatedDeliveryTime ? 
                      new Date(order.estimatedDeliveryTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 
                      'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-racing-600 dark:text-racing-400">
                    ${order.riderPayment.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCall(order.customerId.phone)}
                      className="text-racing-600 hover:text-racing-900 dark:text-racing-400 dark:hover:text-racing-300 mr-3"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCall(order.storeId.phone)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <Store className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('deliveryOrders.orderDetails')} - #{selectedOrder.trackingCode}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información básica */}
              <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-2">
                        {selectedOrder.status === 'pending' ? t('deliveryOrders.status.pending') :
                         selectedOrder.status === 'assigned' ? t('deliveryOrders.status.assigned') :
                         selectedOrder.status === 'accepted' ? t('deliveryOrders.status.accepted') :
                         selectedOrder.status === 'picked_up' ? t('deliveryOrders.status.pickedUp') :
                         selectedOrder.status === 'in_transit' ? t('deliveryOrders.status.inTransit') :
                         selectedOrder.status === 'delivered' ? t('deliveryOrders.status.delivered') :
                         selectedOrder.status === 'cancelled' ? t('deliveryOrders.status.cancelled') :
                         selectedOrder.status === 'failed' ? t('deliveryOrders.status.failed') : selectedOrder.status}
                      </span>
                    </span>
                  </div>
                  <div className="text-sm text-carbon-500 dark:text-carbon-400">
                    {t('deliveryOrders.order.trackingCode')}: {selectedOrder.trackingCode}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-carbon-500 dark:text-carbon-400">{t('deliveryOrders.order.estimatedPickup')}</p>
                    <p className="text-onix-900 dark:text-snow-500 font-medium">
                      {selectedOrder.estimatedPickupTime ? formatTime(selectedOrder.estimatedPickupTime) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-carbon-500 dark:text-carbon-400">{t('deliveryOrders.order.estimatedDelivery')}</p>
                    <p className="text-onix-900 dark:text-snow-500 font-medium">
                      {selectedOrder.estimatedDeliveryTime ? formatTime(selectedOrder.estimatedDeliveryTime) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t('deliveryOrders.order.customer')}
                </h4>
                <div className="space-y-2">
                  <p className="text-onix-900 dark:text-snow-500 font-medium">{selectedOrder.customerId.name}</p>
                  <p className="text-carbon-600 dark:text-carbon-300">{selectedOrder.customerId.email}</p>
                  <p className="text-carbon-600 dark:text-carbon-300">📞 {selectedOrder.customerId.phone}</p>
                  <p className="text-carbon-600 dark:text-carbon-300">📍 {selectedOrder.deliveryLocation.address}</p>
                  {selectedOrder.deliveryLocation.instructions && (
                    <div className="mt-2 p-2 bg-snow-500 dark:bg-carbon-600 rounded border-l-4 border-primary-500">
                      <p className="text-sm text-carbon-700 dark:text-carbon-300">
                        <strong>{t('deliveryOrders.order.instructions')}:</strong> {selectedOrder.deliveryLocation.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="bg-racing-50 dark:bg-racing-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  {t('deliveryOrders.order.store')}
                </h4>
                <div className="space-y-2">
                  <p className="text-onix-900 dark:text-snow-500 font-medium">{selectedOrder.storeId.name}</p>
                  <p className="text-carbon-600 dark:text-carbon-300">📍 {selectedOrder.storeId.address}</p>
                  <p className="text-carbon-600 dark:text-carbon-300">📞 {selectedOrder.storeId.phone}</p>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-4">
                <h4 className="font-semibold text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  {t('deliveryOrders.order.products')}
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-snow-500 dark:bg-carbon-600 rounded">
                      <div>
                        <p className="text-onix-900 dark:text-snow-500 font-medium">{item.productId.name}</p>
                        <p className="text-sm text-carbon-500 dark:text-carbon-400">SKU: {item.productId.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-onix-900 dark:text-snow-500 font-medium">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-carbon-500 dark:text-carbon-400">
                          {t('deliveryOrders.order.total')}: ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de entrega */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  {t('deliveryOrders.order.deliveryInfo')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-carbon-500 dark:text-carbon-400">{t('deliveryOrders.order.deliveryFee')}</p>
                    <p className="text-onix-900 dark:text-snow-500 font-medium">${selectedOrder.deliveryFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-carbon-500 dark:text-carbon-400">{t('deliveryOrders.order.riderPayment')}</p>
                    <p className="text-racing-600 dark:text-racing-400 font-medium">${selectedOrder.riderPayment.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => handleCall(selectedOrder.customerId.phone)}
                  className="flex-1 px-4 py-3 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t('deliveryOrders.actions.callCustomer')}
                </button>
                <button
                  onClick={() => handleCall(selectedOrder.storeId.phone)}
                  className="flex-1 px-4 py-3 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t('deliveryOrders.actions.callStore')}
                </button>
                <button
                  onClick={() => {
                    // Abrir navegación en Google Maps hacia el cliente
                    const address = encodeURIComponent(selectedOrder.deliveryLocation.address);
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
                    window.open(url, '_blank');
                  }}
                  className="flex-1 px-4 py-3 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('deliveryOrders.actions.startNavigation')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportar */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#444444] rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('deliveryOrders.export.title') || 'Exportar Pedidos'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('deliveryOrders.export.format') || 'Formato'}
                </label>
                <div className="space-y-2">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors text-left"
                  >
                    {t('deliveryOrders.export.csv') || 'CSV'}
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#000000] transition-colors text-left"
                  >
                    {t('deliveryOrders.export.excel') || 'Excel'}
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#D63031] transition-colors text-left"
                  >
                    {t('deliveryOrders.export.pdf') || 'PDF'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('deliveryOrders.export.cancel') || 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#444444] rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('deliveryOrders.share.title') || 'Compartir Pedidos'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('deliveryOrders.share.method') || 'Método'}
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const recipient = prompt('Email del destinatario:');
                      const message = prompt('Mensaje:') || 'Resumen de pedidos de delivery';
                      if (recipient) shareViaEmail(recipient, message);
                    }}
                    className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors text-left"
                  >
                    📧 {t('deliveryOrders.share.email') || 'Email'}
                  </button>
                  <button
                    onClick={() => {
                      const message = prompt('Mensaje:') || 'Resumen de pedidos de delivery';
                      shareViaWhatsApp(message);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
                  >
                    📱 {t('deliveryOrders.share.whatsapp') || 'WhatsApp'}
                  </button>
                  <button
                    onClick={shareViaLink}
                    className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#000000] transition-colors text-left"
                  >
                    🔗 {t('deliveryOrders.share.link') || 'Enlace'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('deliveryOrders.share.cancel') || 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrders;
