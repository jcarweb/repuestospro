import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Camera, 
  Edit3, 
  Plus,
  DollarSign,
  MapPin,
  Zap,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Download,
  Share2,
  AlertTriangle,
  Star,
  Phone,
  MessageSquare,
  Navigation,
  Package,
  User,
  Store,
  Camera as CameraIcon,
  PenTool,
  Save,
  Send,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  mockDeliveryOrders, 
  mockDeliveryReports, 
  getTodayStats, 
  getWeeklyStats, 
  issueTypes,
  generateDeliveryReport 
} from '../data/mockDeliveryOrders';
import type { DeliveryOrder } from '../data/mockDeliveryOrders';
import SignatureCapture from '../components/SignatureCapture';
import PhotoCapture from '../components/PhotoCapture';
import CapturedMediaPreview from '../components/CapturedMediaPreview';

interface DeliveryReportData {
  orderId: string;
  status: 'completed' | 'failed' | 'attempted';
  reportType: 'delivery_completed' | 'delivery_failed' | 'delivery_attempted';
  customerSignature?: string;
  deliveryPhoto?: string;
  notes: string;
  issueType?: string;
  issueDescription?: string;
  deliveryTime: number;
  distance: number;
  fuelConsumption: number;
  earnings: number;
  customerRating?: number;
  customerFeedback?: string;
}

const DeliveryReport: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'new-report'>('overview');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<{ type: 'signature' | 'photo'; dataUrl: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState<DeliveryReportData>({
    orderId: '',
    status: 'completed',
    reportType: 'delivery_completed',
    notes: '',
    deliveryTime: 0,
    distance: 0,
    fuelConsumption: 0,
    earnings: 0
  });

  // Estados para firma y foto
  const [signature, setSignature] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');

  // Estados para el formulario de nuevo reporte
  const [newReportOrderId, setNewReportOrderId] = useState<string>('');
  const [newReportStatus, setNewReportStatus] = useState<string>('completed');

  // Estadísticas
  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();

  // Filtrar órdenes
  const filteredOrders = mockDeliveryOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerId.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Obtener órdenes disponibles para reporte
  const availableOrders = mockDeliveryOrders.filter(order => 
    ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(order.status)
  );

  const handleCreateReport = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setReportData({
      ...reportData,
      orderId: order._id,
      earnings: order.riderPayment
    });
    setShowReportModal(true);
  };

  const handleCreateNewReport = () => {
    if (!newReportOrderId) {
      alert('Por favor selecciona un pedido');
      return;
    }

    const selectedOrder = mockDeliveryOrders.find(order => order._id === newReportOrderId);
    if (!selectedOrder) {
      alert('Pedido no encontrado');
      return;
    }

    setSelectedOrder(selectedOrder);
    setReportData({
      ...reportData,
      orderId: selectedOrder._id,
      status: newReportStatus as any,
      reportType: newReportStatus === 'completed' ? 'delivery_completed' : 
                  newReportStatus === 'failed' ? 'delivery_failed' : 'delivery_attempted',
      earnings: selectedOrder.riderPayment
    });
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!selectedOrder) return;

    const newReport = generateDeliveryReport(selectedOrder._id, {
      ...reportData,
      customerSignature: signature,
      deliveryPhoto: photo
    });

    console.log('Reporte enviado:', newReport);
    setShowReportModal(false);
    setShowSignatureModal(false);
    setShowPhotoModal(false);
    setSignature('');
    setPhoto('');
    setReportData({
      orderId: '',
      status: 'completed',
      reportType: 'delivery_completed',
      notes: '',
      deliveryTime: 0,
      distance: 0,
      fuelConsumption: 0,
      earnings: 0
    });
    
    // Limpiar formulario de nuevo reporte
    setNewReportOrderId('');
    setNewReportStatus('completed');
  };

  const handleCaptureSignature = (signatureDataUrl: string) => {
    setSignature(signatureDataUrl);
    setShowSignatureModal(false);
  };

  const handleCapturePhoto = (photoDataUrl: string) => {
    setPhoto(photoDataUrl);
    setShowPhotoModal(false);
  };

  const handleViewMedia = (type: 'signature' | 'photo', dataUrl: string) => {
    setViewingMedia({ type, dataUrl });
    setShowMediaViewer(true);
  };

  const handleRemoveSignature = () => {
    setSignature('');
  };

  const handleRemovePhoto = () => {
    setPhoto('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300';
      case 'failed': return 'bg-alert-100 text-alert-800 dark:bg-alert-900 dark:text-alert-300';
      case 'attempted': return 'bg-racing-100 text-racing-800 dark:bg-racing-900 dark:text-racing-300';
      default: return 'bg-carbon-100 text-carbon-800 dark:bg-carbon-900 dark:text-carbon-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'attempted': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-onix-900 dark:text-snow-500">
            {t('deliveryReport.title')}
          </h1>
          <p className="text-carbon-600 dark:text-carbon-400 mt-2">
            {t('deliveryReport.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-carbon-600 text-snow-500 rounded-lg hover:bg-carbon-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="px-4 py-2 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-carbon-200 dark:border-carbon-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Reportes
          </button>
          <button
            onClick={() => setActiveTab('new-report')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new-report'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Nuevo Reporte
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('deliveryReport.completedToday')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    {todayStats.completed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-alert-100 dark:bg-alert-900 rounded-lg">
                  <XCircle className="h-6 w-6 text-alert-600 dark:text-alert-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('deliveryReport.failedToday')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    {todayStats.failed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-racing-100 dark:bg-racing-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-racing-600 dark:text-racing-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('deliveryReport.todayEarnings')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    ${todayStats.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('deliveryReport.avgDeliveryTime')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    {Math.round(todayStats.avgDeliveryTime)}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos y estadísticas detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500 mb-4">
                {t('deliveryReport.deliveryStats')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-carbon-600 dark:text-carbon-400">Semana Actual</span>
                  <span className="font-medium text-onix-900 dark:text-snow-500">
                    {weeklyStats.completed} completadas
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-carbon-600 dark:text-carbon-400">Ganancias Semanales</span>
                  <span className="font-medium text-onix-900 dark:text-snow-500">
                    ${weeklyStats.totalEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-carbon-600 dark:text-carbon-400">Distancia Total</span>
                  <span className="font-medium text-onix-900 dark:text-snow-500">
                    {weeklyStats.totalDistance.toFixed(1)} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-carbon-600 dark:text-carbon-400">Tiempo Promedio</span>
                  <span className="font-medium text-onix-900 dark:text-snow-500">
                    {Math.round(weeklyStats.avgDeliveryTime)} min
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500 mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-3">
                {mockDeliveryReports.slice(0, 5).map((report) => (
                  <div key={report._id} className="flex items-center justify-between p-3 bg-carbon-50 dark:bg-carbon-700 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(report.status)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-onix-900 dark:text-snow-500">
                          Pedido #{report.orderId.split('_')[1]}
                        </p>
                        <p className="text-xs text-carbon-500 dark:text-carbon-400">
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status === 'completed' ? 'Completado' : report.status === 'failed' ? 'Fallido' : 'Intentado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carbon-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por código de seguimiento o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
            >
              <option value="all">Todos los estados</option>
              <option value="assigned">Asignado</option>
              <option value="accepted">Aceptado</option>
              <option value="picked_up">Recogido</option>
              <option value="in_transit">En Tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Lista de órdenes */}
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-carbon-200 dark:divide-carbon-700">
                <thead className="bg-carbon-50 dark:bg-carbon-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      Tiempo Estimado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      Ganancias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      Acciones
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
                            {order.status === 'assigned' ? 'Asignado' :
                             order.status === 'accepted' ? 'Aceptado' :
                             order.status === 'picked_up' ? 'Recogido' :
                             order.status === 'in_transit' ? 'En Tránsito' :
                             order.status === 'delivered' ? 'Entregado' :
                             order.status === 'cancelled' ? 'Cancelado' : order.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-onix-900 dark:text-snow-500">
                        {order.estimatedDeliveryTime ? 
                          new Date(order.estimatedDeliveryTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-onix-900 dark:text-snow-500">
                        ${order.riderPayment.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleCreateReport(order)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button className="text-racing-600 hover:text-racing-900 dark:text-racing-400 dark:hover:text-racing-300">
                          <Eye className="h-4 w-4" />
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

      {activeTab === 'new-report' && (
        <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
          <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500 mb-6">
            Crear Nuevo Reporte de Entrega
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                Seleccionar Pedido
              </label>
              <select 
                value={newReportOrderId}
                onChange={(e) => setNewReportOrderId(e.target.value)}
                className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
              >
                <option value="">Seleccionar un pedido...</option>
                {availableOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    #{order.trackingCode} - {order.customerId.name} - ${order.riderPayment.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                Estado de la Entrega
              </label>
              <select 
                value={newReportStatus}
                onChange={(e) => setNewReportStatus(e.target.value)}
                className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
              >
                <option value="completed">Completada</option>
                <option value="failed">Fallida</option>
                <option value="attempted">Intentada</option>
              </select>
            </div>
          </div>

          {/* Información del pedido seleccionado */}
          {newReportOrderId && (
            <div className="mt-6 p-4 bg-racing-50 dark:bg-racing-900/20 rounded-lg border border-racing-200 dark:border-racing-800">
              <h4 className="font-medium text-onix-900 dark:text-snow-500 mb-3">
                Información del Pedido Seleccionado
              </h4>
              {(() => {
                const selectedOrder = mockDeliveryOrders.find(order => order._id === newReportOrderId);
                if (!selectedOrder) return null;
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-carbon-500 dark:text-carbon-400">Código:</span>
                      <p className="text-onix-900 dark:text-snow-500 font-medium">#{selectedOrder.trackingCode}</p>
                    </div>
                    <div>
                      <span className="text-carbon-500 dark:text-carbon-400">Cliente:</span>
                      <p className="text-onix-900 dark:text-snow-500 font-medium">{selectedOrder.customerId.name}</p>
                    </div>
                    <div>
                      <span className="text-carbon-500 dark:text-carbon-400">Teléfono:</span>
                      <p className="text-onix-900 dark:text-snow-500 font-medium">{selectedOrder.customerId.phone}</p>
                    </div>
                    <div>
                      <span className="text-carbon-500 dark:text-carbon-400">Ganancias:</span>
                      <p className="text-racing-600 dark:text-racing-400 font-medium">${selectedOrder.riderPayment.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-6">
            <button 
              onClick={handleCreateNewReport}
              disabled={!newReportOrderId}
              className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                newReportOrderId 
                  ? 'bg-racing-500 text-onix-900 hover:bg-racing-600 shadow-md hover:shadow-lg transform hover:scale-105' 
                  : 'bg-carbon-300 text-carbon-500 cursor-not-allowed'
              }`}
            >
              <Plus className="h-4 w-4" />
              Crear Reporte
            </button>
          </div>
        </div>
      )}

      {/* Modal de Reporte */}
      {showReportModal && selectedOrder && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('deliveryReport.reportDelivery')} - #{selectedOrder.trackingCode}
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información del pedido */}
              <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-4">
                <h4 className="font-medium text-onix-900 dark:text-snow-500 mb-3">
                  {t('deliveryReport.deliveryDetails')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Cliente:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.customerId.name}</p>
                  </div>
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Teléfono:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.customerId.phone}</p>
                  </div>
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Dirección:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.deliveryLocation.address}</p>
                  </div>
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Ganancias:</span>
                    <p className="text-racing-600 dark:text-racing-400 font-medium">${selectedOrder.riderPayment.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Estado de la entrega */}
              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  Estado de la Entrega
                </label>
                <select
                  value={reportData.status}
                  onChange={(e) => setReportData({...reportData, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                >
                  <option value="completed">Completada</option>
                  <option value="failed">Fallida</option>
                  <option value="attempted">Intentada</option>
                </select>
              </div>

              {/* Firma del cliente */}
              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  {t('deliveryReport.customerSignature')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="px-4 py-2 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    Capturar Firma
                  </button>
                  {signature && (
                    <CapturedMediaPreview
                      type="signature"
                      dataUrl={signature}
                      onRemove={handleRemoveSignature}
                      onView={() => handleViewMedia('signature', signature)}
                    />
                  )}
                </div>
              </div>

              {/* Foto de entrega */}
              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  {t('deliveryReport.deliveryPhoto')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
                  >
                    <CameraIcon className="h-4 w-4" />
                    Tomar Foto
                  </button>
                  {photo && (
                    <CapturedMediaPreview
                      type="photo"
                      dataUrl={photo}
                      onRemove={handleRemovePhoto}
                      onView={() => handleViewMedia('photo', photo)}
                    />
                  )}
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  {t('deliveryReport.deliveryNotes')}
                </label>
                <textarea
                  value={reportData.notes}
                  onChange={(e) => setReportData({...reportData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  placeholder="Agregar notas sobre la entrega..."
                />
              </div>

              {/* Problemas (solo si falló) */}
              {reportData.status === 'failed' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                      {t('deliveryReport.issueType')}
                    </label>
                    <select
                      value={reportData.issueType || ''}
                      onChange={(e) => setReportData({...reportData, issueType: e.target.value})}
                      className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                    >
                      <option value="">Seleccionar tipo de problema...</option>
                      {issueTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                      {t('deliveryReport.issueDescription')}
                    </label>
                    <textarea
                      value={reportData.issueDescription || ''}
                      onChange={(e) => setReportData({...reportData, issueDescription: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                      placeholder="Describir el problema..."
                    />
                  </div>
                </div>
              )}

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                    Tiempo de Entrega (min)
                  </label>
                  <input
                    type="number"
                    value={reportData.deliveryTime}
                    onChange={(e) => setReportData({...reportData, deliveryTime: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={reportData.distance}
                    onChange={(e) => setReportData({...reportData, distance: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                    Combustible (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={reportData.fuelConsumption}
                    onChange={(e) => setReportData({...reportData, fuelConsumption: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Send className="h-4 w-4" />
                  {t('deliveryReport.submitReport')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Firma */}
      {showSignatureModal && (
        <SignatureCapture
          onCapture={handleCaptureSignature}
          onClose={() => setShowSignatureModal(false)}
        />
      )}

      {/* Modal de Foto */}
      {showPhotoModal && (
        <PhotoCapture
          onCapture={handleCapturePhoto}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

      {/* Visor de medios */}
      {showMediaViewer && viewingMedia && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {viewingMedia.type === 'signature' ? 'Firma del Cliente' : 'Foto de Entrega'}
              </h3>
              <button
                onClick={() => setShowMediaViewer(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex justify-center">
              {viewingMedia.type === 'signature' ? (
                <div className="bg-snow-500 dark:bg-carbon-600 rounded border border-carbon-200 dark:border-carbon-500 p-4">
                  <img
                    src={viewingMedia.dataUrl}
                    alt="Firma del cliente"
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
              ) : (
                <img
                  src={viewingMedia.dataUrl}
                  alt="Foto de entrega"
                  className="max-w-full max-h-96 object-contain rounded"
                />
              )}
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = viewingMedia.dataUrl;
                  link.download = `${viewingMedia.type === 'signature' ? 'firma' : 'foto'}_entrega_${new Date().toISOString().slice(0, 10)}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryReport;
