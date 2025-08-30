import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers,
  Car,
  Satellite,
  Mountain,
  RefreshCw,
  Clock,
  Package,
  User,
  Store,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import type { DeliveryOrder } from '../data/mockDeliveryOrders';

// Fix para los iconos de Leaflet en React
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DeliveryMapComponentProps {
  orders: DeliveryOrder[];
  currentLocation: { lat: number; lng: number } | null;
  onOrderSelect: (order: DeliveryOrder) => void;
  onCallCustomer: (phone: string) => void;
  onCallStore: (phone: string) => void;
  onRefreshLocation: () => void;
}

// Componente para centrar el mapa
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

const DeliveryMapComponent: React.FC<DeliveryMapComponentProps> = ({
  orders,
  currentLocation,
  onOrderSelect,
  onCallCustomer,
  onCallStore,
  onRefreshLocation
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [zoom, setZoom] = useState(13);
  const [mapType, setMapType] = useState<'osm' | 'satellite' | 'terrain'>('osm');
  const [showRoute, setShowRoute] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showMapControls, setShowMapControls] = useState(false);
  const mapRef = useRef<any>(null);

  // Ubicación por defecto (Caracas, Venezuela)
  const defaultCenter: [number, number] = [10.4806, -66.9036];
  const mapCenter = currentLocation ? [currentLocation.lat, currentLocation.lng] : defaultCenter;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFC300'; // racing-500
      case 'assigned': return '#2563eb'; // primary-600
      case 'accepted': return '#8b5cf6'; // purple-500
      case 'picked_up': return '#f97316'; // orange-500
      case 'in_transit': return '#6366f1'; // indigo-500
      case 'delivered': return '#22c55e'; // green-500
      case 'cancelled': return '#E63946'; // alert-600
      case 'failed': return '#6b7280'; // gray-500
      default: return '#6b7280';
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

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleCenterMap = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.setView([currentLocation.lat, currentLocation.lng], zoom);
    }
  };

  const handleOrderClick = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    onOrderSelect(order);
  };

  const getTileLayerUrl = () => {
    switch (mapType) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileLayerAttribution = () => {
    switch (mapType) {
      case 'satellite':
        return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'terrain':
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  // Crear iconos personalizados para los marcadores
  const createCustomIcon = (color: string, iconType: 'store' | 'customer' | 'location') => {
    let iconText = '';
    switch (iconType) {
      case 'store':
        iconText = 'S';
        break;
      case 'customer':
        iconText = 'C';
        break;
      case 'location':
        iconText = '📍';
        break;
    }

    // Función segura para codificar en Base64
    const safeBtoa = (str: string) => {
      try {
        return btoa(unescape(encodeURIComponent(str)));
      } catch (e) {
        // Fallback: usar un SVG simple sin caracteres especiales
        return btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
            <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-family="Arial">${iconType === 'location' ? 'L' : iconText}</text>
          </svg>
        `);
      }
    };

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${safeBtoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-family="Arial">${iconText}</text>
        </svg>
      `)}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  const storeIcon = createCustomIcon('#3b82f6', 'store');
  const customerIcon = createCustomIcon('#22c55e', 'customer');
  const currentLocationIcon = createCustomIcon('#ef4444', 'location');

  return (
    <div className="relative w-full h-[600px] bg-carbon-100 dark:bg-carbon-800 rounded-lg overflow-hidden">
      {/* Mapa de OpenStreetMap */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url={getTileLayerUrl()}
          attribution={getTileLayerAttribution()}
        />
        
        <MapController center={mapCenter} />

        {/* Marcador de ubicación actual */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng] as [number, number]}
            icon={currentLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-medium text-onix-900">{t('deliveryMap.currentLocation')}</div>
                <div className="text-sm text-carbon-600">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de pedidos */}
        {orders.map((order) => {
          const pickupPos: [number, number] = [
            order.pickupLocation.coordinates.lat,
            order.pickupLocation.coordinates.lng
          ] as [number, number];
          const deliveryPos: [number, number] = [
            order.deliveryLocation.coordinates.lat,
            order.deliveryLocation.coordinates.lng
          ] as [number, number];

          return (
            <div key={order._id}>
              {/* Marcador de tienda */}
              <Marker
                position={pickupPos}
                icon={storeIcon}
                eventHandlers={{
                  click: () => handleOrderClick(order)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="font-medium text-onix-900 mb-2">{order.storeId.name}</div>
                    <div className="text-sm text-carbon-600 mb-2">{order.storeId.address}</div>
                    <div className="text-sm text-carbon-600 mb-2">📞 {order.storeId.phone}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onCallStore(order.storeId.phone)}
                        className="px-2 py-1 bg-primary-600 text-snow-500 text-xs rounded hover:bg-primary-700"
                      >
                        {t('deliveryMap.callStore')}
                      </button>
                      <button
                        onClick={() => handleOrderClick(order)}
                        className="px-2 py-1 bg-racing-500 text-onix-900 text-xs rounded hover:bg-racing-600"
                      >
                        {t('deliveryMap.viewOrder')}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Marcador de cliente */}
              <Marker
                position={deliveryPos}
                icon={customerIcon}
                eventHandlers={{
                  click: () => handleOrderClick(order)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="font-medium text-onix-900 mb-2">{order.customerId.name}</div>
                    <div className="text-sm text-carbon-600 mb-2">{order.deliveryLocation.address}</div>
                    <div className="text-sm text-carbon-600 mb-2">📞 {order.customerId.phone}</div>
                    {order.deliveryLocation.instructions && (
                      <div className="text-sm text-carbon-600 mb-2">
                        📝 {order.deliveryLocation.instructions}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onCallCustomer(order.customerId.phone)}
                        className="px-2 py-1 bg-primary-600 text-snow-500 text-xs rounded hover:bg-primary-700"
                      >
                        {t('deliveryMap.callCustomer')}
                      </button>
                      <button
                        onClick={() => handleOrderClick(order)}
                        className="px-2 py-1 bg-racing-500 text-onix-900 text-xs rounded hover:bg-racing-600"
                      >
                        {t('deliveryMap.viewOrder')}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Línea de ruta */}
              {showRoute && (
                <Polyline
                  positions={[pickupPos, deliveryPos]}
                  color={getStatusColor(order.status)}
                  weight={3}
                  opacity={0.7}
                  dashArray="10, 5"
                />
              )}
            </div>
          );
        })}
      </MapContainer>

      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 space-y-2 z-[1000]">
        {/* Botón de controles */}
        <button
          onClick={() => setShowMapControls(!showMapControls)}
          className="p-2 bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-lg hover:bg-carbon-50 dark:hover:bg-carbon-700 transition-colors"
          title={t('deliveryMap.mapControls')}
        >
          <Layers className="h-5 w-5 text-carbon-600 dark:text-carbon-300" />
        </button>

        {/* Panel de controles */}
        {showMapControls && (
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-lg p-3 space-y-2 min-w-[200px]">
            <div className="text-sm font-medium text-onix-900 dark:text-snow-500 mb-2">
              {t('deliveryMap.mapControls')}
            </div>
            
            {/* Zoom */}
            <div className="flex space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-1 bg-carbon-100 dark:bg-carbon-700 rounded hover:bg-carbon-200 dark:hover:bg-carbon-600"
                title={t('deliveryMap.zoomOut')}
              >
                <ZoomOut className="h-4 w-4 text-carbon-600 dark:text-carbon-300" />
              </button>
              <span className="px-2 py-1 text-sm text-carbon-600 dark:text-carbon-300">
                {zoom}
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 bg-carbon-100 dark:bg-carbon-700 rounded hover:bg-carbon-200 dark:hover:bg-carbon-600"
                title={t('deliveryMap.zoomIn')}
              >
                <ZoomIn className="h-4 w-4 text-carbon-600 dark:text-carbon-300" />
              </button>
            </div>

            {/* Centrar */}
            <button
              onClick={handleCenterMap}
              className="w-full p-1 bg-carbon-100 dark:bg-carbon-700 rounded hover:bg-carbon-200 dark:hover:bg-carbon-600 text-sm text-carbon-600 dark:text-carbon-300"
              title={t('deliveryMap.centerMap')}
            >
              <Maximize2 className="h-4 w-4 inline mr-1" />
              {t('deliveryMap.centerMap')}
            </button>

            {/* Tipo de mapa */}
            <div className="space-y-1">
              <div className="text-xs text-carbon-500 dark:text-carbon-400">{t('deliveryMap.layers')}</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setMapType('osm')}
                  className={`p-1 rounded text-xs ${
                    mapType === 'osm' 
                      ? 'bg-racing-100 text-racing-600 dark:bg-racing-900 dark:text-racing-300' 
                      : 'bg-carbon-100 text-carbon-600 dark:bg-carbon-700 dark:text-carbon-300'
                  }`}
                >
                  <Car className="h-3 w-3 inline mr-1" />
                  {t('deliveryMap.traffic')}
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`p-1 rounded text-xs ${
                    mapType === 'satellite' 
                      ? 'bg-racing-100 text-racing-600 dark:bg-racing-900 dark:text-racing-300' 
                      : 'bg-carbon-100 text-carbon-600 dark:bg-carbon-700 dark:text-carbon-300'
                  }`}
                >
                  <Satellite className="h-3 w-3 inline mr-1" />
                  {t('deliveryMap.satellite')}
                </button>
                <button
                  onClick={() => setMapType('terrain')}
                  className={`p-1 rounded text-xs ${
                    mapType === 'terrain' 
                      ? 'bg-racing-100 text-racing-600 dark:bg-racing-900 dark:text-racing-300' 
                      : 'bg-carbon-100 text-carbon-600 dark:bg-carbon-700 dark:text-carbon-300'
                  }`}
                >
                  <Mountain className="h-3 w-3 inline mr-1" />
                  {t('deliveryMap.terrain')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de ruta */}
      <div className="absolute bottom-4 left-4 space-y-2 z-[1000]">
        <button
          onClick={() => setShowRoute(!showRoute)}
          className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${
            showRoute 
              ? 'bg-alert-600 text-snow-500 hover:bg-alert-700' 
              : 'bg-primary-600 text-snow-500 hover:bg-primary-700'
          }`}
        >
          {showRoute ? t('deliveryMap.hideRoute') : t('deliveryMap.showRoute')}
        </button>
        
        <button
          onClick={onRefreshLocation}
          className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg shadow-lg hover:bg-racing-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          {t('deliveryMap.refreshLocation')}
        </button>
      </div>

      {/* Información de ruta */}
      {showRoute && (
        <div className="absolute bottom-4 right-4 bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-lg p-3 min-w-[200px] z-[1000]">
          <div className="text-sm font-medium text-onix-900 dark:text-snow-500 mb-2">
            {t('deliveryMap.routeOptimization')}
          </div>
          <div className="space-y-1 text-sm text-carbon-600 dark:text-carbon-300">
            <div>{t('deliveryMap.totalDistance')}: ~12.5 km</div>
            <div>{t('deliveryMap.estimatedTime')}: ~45 min</div>
            <div>Pedidos activos: {orders.filter(o => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(o.status)).length}</div>
          </div>
        </div>
      )}

      {/* Panel de detalles del pedido seleccionado */}
      {selectedOrder && (
        <div className="absolute top-4 left-4 bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-lg p-4 max-w-sm z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-onix-900 dark:text-snow-500">
              {t('deliveryMap.orderDetails')}
            </h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Información básica */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`} style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1 text-white">{getStatusTranslation(selectedOrder.status)}</span>
                </span>
              </div>
              <p className="text-sm text-carbon-600 dark:text-carbon-300">
                {t('deliveryMap.trackingCode')}: {selectedOrder.trackingCode}
              </p>
            </div>

            {/* Cliente */}
            <div>
              <p className="text-sm font-medium text-onix-900 dark:text-snow-500 mb-1">
                {t('deliveryMap.customer')}
              </p>
              <p className="text-sm text-carbon-600 dark:text-carbon-300">
                {selectedOrder.customerId.name}
              </p>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => onCallCustomer(selectedOrder.customerId.phone)}
                  className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  title={t('deliveryMap.callCustomer')}
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tienda */}
            <div>
              <p className="text-sm font-medium text-onix-900 dark:text-snow-500 mb-1">
                {t('deliveryMap.store')}
              </p>
              <p className="text-sm text-carbon-600 dark:text-carbon-300">
                {selectedOrder.storeId.name}
              </p>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => onCallStore(selectedOrder.storeId.phone)}
                  className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  title={t('deliveryMap.callStore')}
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tiempos */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-carbon-500 dark:text-carbon-400">{t('deliveryMap.estimatedPickup')}</p>
                <p className="text-onix-900 dark:text-snow-500">
                  {selectedOrder.estimatedPickupTime ? formatTime(selectedOrder.estimatedPickupTime) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-carbon-500 dark:text-carbon-400">{t('deliveryMap.estimatedDelivery')}</p>
                <p className="text-onix-900 dark:text-snow-500">
                  {selectedOrder.estimatedDeliveryTime ? formatTime(selectedOrder.estimatedDeliveryTime) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Instrucciones */}
            {selectedOrder.deliveryLocation.instructions && (
              <div>
                <p className="text-sm font-medium text-onix-900 dark:text-snow-500 mb-1">
                  {t('deliveryMap.instructions')}
                </p>
                <p className="text-sm text-carbon-600 dark:text-carbon-300">
                  {selectedOrder.deliveryLocation.instructions}
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 pt-2 border-t border-carbon-200 dark:border-carbon-700">
              <button
                onClick={() => onOrderSelect(selectedOrder)}
                className="flex-1 px-3 py-2 bg-primary-600 text-snow-500 text-sm rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('deliveryMap.viewOrder')}
              </button>
              <button
                onClick={() => {
                  // Abrir navegación en Google Maps hacia el cliente
                  const address = encodeURIComponent(selectedOrder.deliveryLocation.address);
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 px-3 py-2 bg-racing-500 text-onix-900 text-sm rounded-lg hover:bg-racing-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {t('deliveryMap.startNavigation')}
              </button>
            </div>
            
            {/* Botón adicional para navegar a la tienda */}
            <div className="mt-2">
              <button
                onClick={() => {
                  // Abrir navegación en Google Maps hacia la tienda
                  const address = encodeURIComponent(selectedOrder.storeId.address);
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
                  window.open(url, '_blank');
                }}
                className="w-full px-3 py-2 bg-primary-600 text-snow-500 text-sm rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
              >
                <Store className="h-4 w-4 mr-2" />
                {t('deliveryMap.navigateToStore')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMapComponent;
