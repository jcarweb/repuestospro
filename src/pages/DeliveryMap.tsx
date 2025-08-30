import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Eye, 
  RefreshCw,
  Clock,
  Package,
  User,
  Store,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  Layers,
  Download,
  Share2,
  DollarSign
} from 'lucide-react';
import DeliveryMapComponent from '../components/DeliveryMapComponent';
import type { DeliveryOrder } from '../data/mockDeliveryOrders';
import { getMockDeliveryOrders } from '../data/mockDeliveryOrders';

const DeliveryMap: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos desde API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders = getMockDeliveryOrders();
      setOrders(mockOrders);
      
    } catch (err) {
      console.error('Error loading delivery map data:', err);
      setError(t('deliveryMap.error'));
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Usar ubicación por defecto (Caracas, Venezuela)
          setCurrentLocation({ lat: 10.4806, lng: -66.9036 });
        }
      );
    } else {
      // Fallback a ubicación por defecto
      setCurrentLocation({ lat: 10.4806, lng: -66.9036 });
    }
  };

  const handleOrderSelect = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCallCustomer = (phone: string) => {
    // En una implementación real, abriría la aplicación de teléfono
    console.log('Calling customer:', phone);
    window.open(`tel:${phone}`, '_blank');
  };

  const handleCallStore = (phone: string) => {
    // En una implementación real, abriría la aplicación de teléfono
    console.log('Calling store:', phone);
    window.open(`tel:${phone}`, '_blank');
  };

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      case 'accepted': return 'bg-purple-500';
      case 'picked_up': return 'bg-orange-500';
      case 'in_transit': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'failed': return 'bg-gray-500';
      default: return 'bg-gray-500';
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

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('deliveryMap.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
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
            {t('deliveryMap.title')}
          </h1>
          <p className="text-carbon-600 dark:text-carbon-400 mt-2">
            {t('deliveryMap.subtitle')}
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

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                Pedidos Activos
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                {orders.filter(o => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(o.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 shadow-sm border border-carbon-200 dark:border-carbon-700">
          <div className="flex items-center">
            <div className="p-2 bg-racing-100 dark:bg-racing-900 rounded-lg">
              <MapPin className="h-6 w-6 text-racing-600 dark:text-racing-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-carbon-600 dark:text-carbon-400">
                Ubicación Actual
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                {currentLocation ? 'Activa' : 'No disponible'}
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
                En Tránsito
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                {orders.filter(o => o.status === 'in_transit').length}
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
                Ganancias Hoy
              </p>
              <p className="text-2xl font-bold text-onix-900 dark:text-snow-500">
                ${orders.reduce((sum, order) => sum + order.riderPayment, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700">
        <DeliveryMapComponent
          orders={orders}
          currentLocation={currentLocation}
          onOrderSelect={setSelectedOrder}
          onCallCustomer={handleCallCustomer}
          onCallStore={handleCallStore}
          onRefreshLocation={getCurrentLocation}
        />
      </div>

      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                Detalles del Pedido - #{selectedOrder.trackingCode}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información del cliente */}
              <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-4">
                <h4 className="font-medium text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Cliente
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Nombre:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.customerId.name}</p>
                  </div>
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Teléfono:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.customerId.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-carbon-500 dark:text-carbon-400">Dirección:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.deliveryLocation.address}</p>
                  </div>
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="bg-racing-50 dark:bg-racing-900/20 rounded-lg p-4">
                <h4 className="font-medium text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Tienda
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Nombre:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.storeId.name}</p>
                  </div>
                  <div>
                    <span className="text-carbon-500 dark:text-carbon-400">Teléfono:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.storeId.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-carbon-500 dark:text-carbon-400">Dirección:</span>
                    <p className="text-onix-900 dark:text-snow-500">{selectedOrder.storeId.address}</p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-carbon-50 dark:bg-carbon-700 rounded-lg p-4">
                <h4 className="font-medium text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Productos
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
                          Total: ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de entrega */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <h4 className="font-medium text-onix-900 dark:text-snow-500 mb-3 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Información de Entrega
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-carbon-500 dark:text-carbon-400">Costo de Envío</p>
                    <p className="text-onix-900 dark:text-snow-500 font-medium">${selectedOrder.deliveryFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-carbon-500 dark:text-carbon-400">Ganancias del Delivery</p>
                    <p className="text-racing-600 dark:text-racing-400 font-medium">${selectedOrder.riderPayment.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => handleCallCustomer(selectedOrder.customerId.phone)}
                  className="flex-1 px-4 py-3 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t('deliveryMap.callCustomer')}
                </button>
                <button
                  onClick={() => handleCallStore(selectedOrder.storeId.phone)}
                  className="flex-1 px-4 py-3 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t('deliveryMap.callStore')}
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
                  {t('deliveryMap.startNavigation')}
                </button>
              </div>
              
              {/* Botón adicional para navegar a la tienda */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    // Abrir navegación en Google Maps hacia la tienda
                    const address = encodeURIComponent(selectedOrder.storeId.address);
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full px-4 py-3 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                >
                  <Store className="h-4 w-4 mr-2" />
                  {t('deliveryMap.navigateToStore')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;
