import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Share2, 
  Filter,
  Search,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';
import RatingSystem from '../components/RatingSystem';
import RatingStatsComponent from '../components/RatingStats';
import { 
  getRatingStats, 
  getRatingComparison, 
  getDeliveryRatings,
  createRating,
  type Rating,
  type RatingStats 
} from '../data/mockRatings';
import { getMockDeliveryOrders } from '../data/mockDeliveryOrders';

const DeliveryRatings: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'received' | 'given'>('overview');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRateCustomerModal, setShowRateCustomerModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Estados para calificaciones
  const [receivedRatings, setReceivedRatings] = useState<Rating[]>([]);
  const [givenRatings, setGivenRatings] = useState<Rating[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [ratingComparison, setRatingComparison] = useState<any>(null);

  // Estados para nueva calificación
  const [newRating, setNewRating] = useState({
    rating: 0,
    comment: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadRatingData();
  }, []);

  const loadRatingData = async () => {
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obtener estadísticas de calificaciones recibidas
      const stats = getRatingStats('delivery_001', 'customer_to_delivery');
      setRatingStats(stats);
      
      // Obtener comparación con período anterior
      const comparison = getRatingComparison('delivery_001', 'customer_to_delivery');
      setRatingComparison(comparison);
      
      // Obtener calificaciones recibidas
      const received = getDeliveryRatings('delivery_001');
      setReceivedRatings(received);
      
      // Obtener calificaciones dadas
      const given = getDeliveryRatings('delivery_001').filter(r => r.type === 'delivery_to_customer');
      setGivenRatings(given);
      
    } catch (error) {
      console.error('Error loading rating data:', error);
    }
  };

  // Filtrar calificaciones
  const getFilteredRatings = () => {
    let ratings = activeTab === 'received' ? receivedRatings : givenRatings;
    
    if (filterRating !== 'all') {
      ratings = ratings.filter(rating => rating.rating === parseInt(filterRating));
    }
    
    if (searchTerm) {
      ratings = ratings.filter(rating => 
        rating.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rating.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return ratings;
  };

  const handleSubmitRating = () => {
    if (!selectedOrder || newRating.rating === 0) return;

    const ratingData = {
      orderId: selectedOrder._id,
      deliveryId: 'delivery_001',
      customerId: selectedOrder.customerId._id,
      rating: newRating.rating,
      comment: newRating.comment,
      type: 'delivery_to_customer' as const
    };

    const newRatingCreated = createRating(ratingData);
    setGivenRatings([...givenRatings, newRatingCreated]);
    
    // Limpiar formulario
    setNewRating({ rating: 0, comment: '' });
    setSelectedOrder(null);
    setShowRateCustomerModal(false);
    
    // Recargar datos
    loadRatingData();
  };

  // Funciones para los botones de acción
  const handleExportRatings = () => {
    const filteredRatings = getFilteredRatings();
    const csvContent = generateCSV(filteredRatings);
    downloadCSV(csvContent, `calificaciones_${new Date().toISOString().slice(0, 10)}.csv`);
    
    // Mostrar notificación de éxito
    setTimeout(() => {
      alert(t('rating.exportSuccess'));
    }, 100);
  };

  const handleShareRatings = () => {
    const stats = ratingStats;
    if (!stats) return;

    const shareText = `${t('rating.shareTitle')}:\n⭐ ${t('rating.averageRating')}: ${stats.averageRating.toFixed(1)}/5\n📦 ${t('rating.totalDeliveries')}: ${stats.totalRatings}\n📊 ${t('rating.stats.excellent')}: ${stats.ratingDistribution[5] || 0}`;
    
    if (navigator.share) {
      navigator.share({
        title: t('rating.shareTitle'),
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(shareText).then(() => {
        alert(t('rating.statsCopied'));
      });
    }
  };

  const handleRefreshData = () => {
    loadRatingData();
  };

  // Funciones para generar CSV
  const generateCSV = (ratings: Rating[]) => {
    const headers = ['ID', 'Pedido', 'Cliente', 'Calificación', 'Comentario', 'Tipo', 'Fecha'];
    const rows = ratings.map(rating => [
      rating._id,
      rating.orderId,
      rating.customerId,
      rating.rating,
      rating.comment || '',
      rating.type === 'customer_to_delivery' ? 'Recibida' : 'Dada',
      new Date(rating.createdAt).toLocaleDateString()
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para abrir modal de calificar cliente
  const handleRateCustomer = (order: any) => {
    setSelectedOrder(order);
    setShowRateCustomerModal(true);
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setFilterRating('all');
    setSearchTerm('');
  };

  // Función para obtener pedidos disponibles para calificar
  const getAvailableOrdersForRating = () => {
    const orders = getMockDeliveryOrders();
    const ratedOrderIds = givenRatings.map(r => r.orderId);
    return orders.filter(order => !ratedOrderIds.includes(order._id));
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5: return 'text-green-600 dark:text-green-400';
      case 4: return 'text-primary-600 dark:text-primary-400';
      case 3: return 'text-racing-600 dark:text-racing-400';
      case 2: return 'text-orange-600 dark:text-orange-400';
      case 1: return 'text-alert-600 dark:text-alert-400';
      default: return 'text-carbon-600 dark:text-carbon-400';
    }
  };

  const getRatingIcon = (rating: number) => {
    switch (rating) {
      case 5: return <CheckCircle className="h-4 w-4" />;
      case 4: return <CheckCircle className="h-4 w-4" />;
      case 3: return <Clock className="h-4 w-4" />;
      case 2: return <AlertTriangle className="h-4 w-4" />;
      case 1: return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-onix-900 dark:text-snow-500">
            {t('rating.title')}
          </h1>
          <p className="text-carbon-600 dark:text-carbon-400 mt-2">
            {t('rating.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadRatingData}
            className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button className="px-4 py-2 bg-carbon-600 text-snow-500 rounded-lg hover:bg-carbon-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('rating.exportRatings')}
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
            onClick={() => setActiveTab('received')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'received'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <Star className="h-4 w-4 inline mr-2" />
            {t('rating.receivedRatings')}
          </button>
          <button
            onClick={() => setActiveTab('given')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'given'
                ? 'border-racing-500 text-racing-600 dark:text-racing-400'
                : 'border-transparent text-carbon-500 hover:text-carbon-700 hover:border-carbon-300 dark:text-carbon-400 dark:hover:text-carbon-300'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-2" />
            {t('rating.givenRatings')}
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'overview' && ratingStats && (
        <div className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-racing-100 dark:bg-racing-900 rounded-lg">
                  <Star className="h-6 w-6 text-racing-600 dark:text-racing-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('rating.averageRating')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    {ratingStats.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('rating.totalDeliveries')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    {ratingStats.totalRatings}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('rating.thisMonth')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    {Math.floor(ratingStats.totalRatings * 0.3)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                    {t('rating.stats.excellent')}
                  </p>
                  <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                    {ratingStats.ratingDistribution[5] || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <RatingStatsComponent
               averageRating={ratingStats.averageRating}
               totalRatings={ratingStats.totalRatings}
               ratingDistribution={ratingStats.ratingDistribution}
               previousPeriod={ratingComparison?.previous}
             />

            <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500 mb-4">
                {t('rating.recentRatings')}
              </h3>
              <div className="space-y-3">
                {ratingStats.recentRatings.slice(0, 5).map((rating) => (
                  <div key={rating._id} className="flex items-center justify-between p-3 bg-carbon-50 dark:bg-carbon-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getRatingColor(rating.rating)}`}>
                        {getRatingIcon(rating.rating)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-onix-900 dark:text-snow-500">
                          #{rating.orderId.split('_')[1]}
                        </p>
                        <p className="text-xs text-carbon-500 dark:text-carbon-400">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingSystem
                        rating={rating.rating}
                        onRatingChange={() => {}}
                        readonly
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'received' || activeTab === 'given') && (
        <div className="space-y-6">
          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carbon-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por número de pedido o comentario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                />
              </div>
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
            >
              <option value="all">{t('rating.allRatings')}</option>
              <option value="5">{t('rating.5stars')}</option>
              <option value="4">{t('rating.4stars')}</option>
              <option value="3">{t('rating.3stars')}</option>
              <option value="2">{t('rating.2stars')}</option>
              <option value="1">{t('rating.1star')}</option>
            </select>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {t('rating.clearFilters')}
            </button>
          </div>

          {/* Información de filtros activos */}
          {(filterRating !== 'all' || searchTerm) && (
            <div className="bg-racing-50 dark:bg-racing-900/20 rounded-lg p-3 border border-racing-200 dark:border-racing-700 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-racing-700 dark:text-racing-300">
                  <Filter className="h-4 w-4" />
                  <span>{t('rating.activeFilters')}:</span>
                  {filterRating !== 'all' && (
                    <span className="px-2 py-1 bg-racing-200 dark:bg-racing-800 rounded text-xs">
                      {filterRating} estrellas
                    </span>
                  )}
                  {searchTerm && (
                    <span className="px-2 py-1 bg-racing-200 dark:bg-racing-800 rounded text-xs">
                      "{searchTerm}"
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-racing-600 hover:text-racing-800 dark:text-racing-400 dark:hover:text-racing-200 text-sm"
                >
                  {t('rating.clearAll')}
                </button>
              </div>
            </div>
          )}

          {/* Botón para calificar cliente (solo en tab de calificaciones dadas) */}
          {activeTab === 'given' && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-carbon-600 dark:text-carbon-400">
                {getFilteredRatings().length} {t('rating.ratingsFound')}
              </div>
              <button
                onClick={() => {
                  const availableOrders = getAvailableOrdersForRating();
                  if (availableOrders.length > 0) {
                    setSelectedOrder(availableOrders[0]);
                    setShowRateCustomerModal(true);
                  } else {
                    alert(t('rating.noOrdersToRate'));
                  }
                }}
                className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                {t('rating.rateCustomer')}
              </button>
            </div>
          )}

          {/* Lista de calificaciones */}
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-carbon-200 dark:divide-carbon-700">
                <thead className="bg-carbon-50 dark:bg-carbon-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      {t('rating.orderNumber')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      {t('rating.deliveryDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      {t('rating.ratingValue')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      {t('rating.comment')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-carbon-500 dark:text-carbon-300 uppercase tracking-wider">
                      {t('rating.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-snow-500 dark:bg-carbon-800 divide-y divide-carbon-200 dark:divide-carbon-700">
                  {getFilteredRatings().map((rating) => (
                    <tr key={rating._id} className="hover:bg-carbon-50 dark:hover:bg-carbon-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-onix-900 dark:text-snow-500">
                          #{rating.orderId.split('_')[1]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-carbon-600 dark:text-carbon-400">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RatingSystem
                          rating={rating.rating}
                          onRatingChange={() => {}}
                          readonly
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-carbon-600 dark:text-carbon-400 max-w-xs truncate">
                          {rating.comment || 'Sin comentario'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRating(rating);
                              setShowRatingModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            title={t('rating.viewDetails')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {activeTab === 'given' && (
                            <button
                              onClick={() => {
                                const order = getMockDeliveryOrders().find(o => o._id === rating.orderId);
                                if (order) {
                                  handleRateCustomer(order);
                                }
                              }}
                              className="text-racing-600 hover:text-racing-800 dark:text-racing-400 dark:hover:text-racing-200 p-1 rounded hover:bg-racing-50 dark:hover:bg-racing-900/20"
                              title={t('rating.editRating')}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Mensaje cuando no hay calificaciones */}
              {getFilteredRatings().length === 0 && (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-carbon-300 dark:text-carbon-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-carbon-600 dark:text-carbon-400 mb-2">
                    {t('rating.noRatings')}
                  </h3>
                  <p className="text-sm text-carbon-500 dark:text-carbon-500">
                    {activeTab === 'received' 
                      ? 'Aún no has recibido calificaciones de clientes'
                      : 'Aún no has calificado a ningún cliente'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de calificación */}
      {showRatingModal && selectedRating && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                Detalles de Calificación - #{selectedRating.orderId.split('_')[1]}
              </h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${getRatingColor(selectedRating.rating)}`}>
                      {getRatingIcon(selectedRating.rating)}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-onix-900 dark:text-snow-500">
                        Calificación {selectedRating.rating}/5
                      </p>
                      <p className="text-sm text-carbon-600 dark:text-carbon-400">
                        {new Date(selectedRating.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <RatingSystem
                    rating={selectedRating.rating}
                    onRatingChange={() => {}}
                    readonly
                    size="lg"
                    showLabel
                  />
                </div>

                {selectedRating.comment && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                      Comentario:
                    </h4>
                    <p className="text-sm text-carbon-600 dark:text-carbon-400 bg-snow-500 dark:bg-carbon-600 rounded p-3">
                      {selectedRating.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para calificar cliente */}
      {showRateCustomerModal && selectedOrder && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('rating.rateCustomer')}
              </h3>
              <button
                onClick={() => setShowRateCustomerModal(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-4">
                <h4 className="font-medium text-onix-900 dark:text-snow-500 mb-2">
                  Pedido #{selectedOrder._id.split('_')[1]}
                </h4>
                <p className="text-sm text-carbon-600 dark:text-carbon-400">
                  Cliente: {selectedOrder.customerId.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-3">
                  Calificación:
                </label>
                <RatingSystem
                  rating={newRating.rating}
                  onRatingChange={(rating) => setNewRating({ ...newRating, rating })}
                  showLabel
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-carbon-700 dark:text-carbon-300 mb-2">
                  {t('rating.comment')}:
                </label>
                <textarea
                  value={newRating.comment}
                  onChange={(e) => setNewRating({ ...newRating, comment: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500"
                  placeholder={t('rating.commentPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => setShowRateCustomerModal(false)}
                  className="flex-1 px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={newRating.rating === 0}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    newRating.rating > 0
                      ? 'bg-racing-500 text-onix-900 hover:bg-racing-600'
                      : 'bg-carbon-300 text-carbon-500 cursor-not-allowed'
                  }`}
                >
                  {t('rating.submitRating')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryRatings;
