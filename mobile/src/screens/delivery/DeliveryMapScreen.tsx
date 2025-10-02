import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';

// Mock MapView component - En una implementación real usarías react-native-maps
const MockMapView = ({ 
  style, 
  initialRegion, 
  showsUserLocation, 
  showsMyLocationButton,
  onRegionChange,
  children 
}: any) => (
  <View style={[style, { backgroundColor: '#E8F4FD', justifyContent: 'center', alignItems: 'center' }]}>
    <Ionicons name="map" size={64} color="#007AFF" />
    <Text style={{ color: '#007AFF', marginTop: 8, fontSize: 16, fontWeight: '600' }}>
      Mapa de Entregas
    </Text>
    <Text style={{ color: '#666', marginTop: 4, fontSize: 12, textAlign: 'center' }}>
      Implementación con react-native-maps{'\n'}próximamente
    </Text>
  </View>
);

// Mock Marker component
const MockMarker = ({ coordinate, title, description, pinColor, onPress }: any) => (
  <TouchableOpacity
    style={[
      styles.mockMarker,
      { backgroundColor: pinColor || '#FF3B30' }
    ]}
    onPress={onPress}
  >
    <Ionicons name="location" size={20} color="white" />
  </TouchableOpacity>
);

interface DeliveryLocation {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: 'pending' | 'in_progress' | 'completed';
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

const DeliveryMapScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showTraffic, setShowTraffic] = useState(false);
  const [optimizeRoute, setOptimizeRoute] = useState(false);
  const [loading, setLoading] = useState(true);

  const { width, height } = Dimensions.get('window');

  const loadDeliveryLocations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDeliveryLocations();
      
      if (response.success) {
        // Transformar los datos del backend al formato esperado por el frontend
        const transformedLocations: DeliveryLocation[] = response.data.map((location: any) => ({
          id: location.id,
          orderNumber: location.orderNumber,
          customerName: location.customerName,
          address: location.address,
          coordinates: location.coordinates,
          status: location.status === 'assigned' ? 'pending' : 
                  location.status === 'picked_up' || location.status === 'in_transit' ? 'in_progress' : 'completed',
          estimatedTime: location.estimatedTime,
          priority: location.priority
        }));
        
        setDeliveryLocations(transformedLocations);
      } else {
        throw new Error(response.message || 'Error al cargar ubicaciones');
      }
      
      // Simular ubicación actual
      setCurrentLocation({
        latitude: 10.4806,
        longitude: -66.9036
      });
    } catch (error) {
      console.error('Error loading delivery locations:', error);
      showToast('Error al cargar ubicaciones', 'error');
      
      // Fallback a datos mock en caso de error
      const mockLocations: DeliveryLocation[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'Juan Pérez',
          address: 'Calle 5, Edificio Los Rosales, Apto 3B, Caracas',
          coordinates: {
            latitude: 10.4806,
            longitude: -66.9036
          },
          status: 'pending',
          estimatedTime: '12:00 PM',
          priority: 'high'
        }
      ];
      
      setDeliveryLocations(mockLocations);
      
      // Simular ubicación actual
      setCurrentLocation({
        latitude: 10.4806,
        longitude: -66.9036
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'in_progress': return '#007AFF';
      case 'completed': return '#34C759';
      default: return colors.textSecondary;
    }
  };

  const getLocationStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return colors.textSecondary;
    }
  };

  const handleLocationPress = (location: DeliveryLocation) => {
    setSelectedLocation(location);
    showToast(`Seleccionada: ${location.orderNumber}`, 'info');
  };

  const navigateToLocation = (location: DeliveryLocation) => {
    Alert.alert(
      'Navegar a Ubicación',
      `¿Deseas navegar a ${location.address}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Navegar', onPress: () => {
          // TODO: Implementar navegación GPS real
          showToast('Navegación GPS próximamente', 'info');
        }}
      ]
    );
  };

  const optimizeDeliveryRoute = () => {
    Alert.alert(
      'Optimizar Ruta',
      '¿Deseas optimizar la ruta de entrega para reducir tiempo y distancia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Optimizar', onPress: () => {
          setOptimizeRoute(true);
          showToast('Ruta optimizada', 'success');
        }}
      ]
    );
  };

  const shareLocation = () => {
    Alert.alert(
      'Compartir Ubicación',
      '¿Deseas compartir tu ubicación actual con la tienda?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Compartir', onPress: () => {
          // TODO: Implementar compartir ubicación
          showToast('Ubicación compartida', 'success');
        }}
      ]
    );
  };

  useEffect(() => {
    loadDeliveryLocations();
  }, []);

  const LocationCard = ({ location }: { location: DeliveryLocation }) => (
    <TouchableOpacity
      style={[
        styles.locationCard,
        { 
          backgroundColor: colors.surface,
          borderColor: selectedLocation?.id === location.id ? colors.primary : colors.border,
          borderWidth: selectedLocation?.id === location.id ? 2 : 1
        }
      ]}
      onPress={() => handleLocationPress(location)}
    >
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>
            {location.orderNumber}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(location.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(location.priority) }]}>
              {location.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getLocationStatusColor(location.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getLocationStatusColor(location.status) }]}>
            {getLocationStatusText(location.status)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.customerName, { color: colors.textPrimary }]}>
        {location.customerName}
      </Text>
      
      <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={2}>
        {location.address}
      </Text>
      
      <View style={styles.locationFooter}>
        <View style={styles.timeInfo}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={[styles.estimatedTime, { color: colors.textSecondary }]}>
            {location.estimatedTime}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.navigateButton, { backgroundColor: colors.primary }]}
          onPress={() => navigateToLocation(location)}
        >
          <Ionicons name="navigate" size={16} color="white" />
          <Text style={styles.navigateButtonText}>Navegar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando mapa...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Mapa de Rutas
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={shareLocation}
          >
            <Ionicons name="share" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={optimizeDeliveryRoute}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Controls */}
      <View style={[styles.mapControls, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.mapTypeButtons}>
          <TouchableOpacity
            style={[
              styles.mapTypeButton,
              { 
                backgroundColor: mapType === 'standard' ? colors.primary : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setMapType('standard')}
          >
            <Text style={[
              styles.mapTypeButtonText,
              { color: mapType === 'standard' ? 'white' : colors.textPrimary }
            ]}>
              Estándar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mapTypeButton,
              { 
                backgroundColor: mapType === 'satellite' ? colors.primary : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={[
              styles.mapTypeButtonText,
              { color: mapType === 'satellite' ? 'white' : colors.textPrimary }
            ]}>
              Satélite
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.trafficControl}>
          <Text style={[styles.trafficLabel, { color: colors.textSecondary }]}>
            Tráfico
          </Text>
          <TouchableOpacity
            style={[
              styles.trafficButton,
              { 
                backgroundColor: showTraffic ? colors.primary : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setShowTraffic(!showTraffic)}
          >
            <Ionicons 
              name="car" 
              size={16} 
              color={showTraffic ? 'white' : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MockMapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || 10.4806,
            longitude: currentLocation?.longitude || -66.9036,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User Location Marker */}
          {currentLocation && (
            <MockMarker
              coordinate={currentLocation}
              title="Mi Ubicación"
              description="Ubicación actual"
              pinColor="#007AFF"
            />
          )}
          
          {/* Delivery Location Markers */}
          {deliveryLocations.map((location) => (
            <MockMarker
              key={location.id}
              coordinate={location.coordinates}
              title={location.orderNumber}
              description={location.customerName}
              pinColor={getLocationStatusColor(location.status)}
              onPress={() => handleLocationPress(location)}
            />
          ))}
        </MockMapView>
      </View>

      {/* Locations List */}
      <View style={styles.locationsContainer}>
        <View style={[styles.locationsHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.locationsTitle, { color: colors.textPrimary }]}>
            Ubicaciones de Entrega ({deliveryLocations.length})
          </Text>
          {optimizeRoute && (
            <View style={[styles.optimizedBadge, { backgroundColor: '#34C759' + '20' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={[styles.optimizedText, { color: '#34C759' }]}>
                Ruta Optimizada
              </Text>
            </View>
          )}
        </View>
        
        <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
          {deliveryLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  mapTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mapTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  mapTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trafficControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trafficLabel: {
    fontSize: 14,
  },
  trafficButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  mapContainer: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
  },
  mockMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  locationsContainer: {
    maxHeight: 300,
  },
  locationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  locationsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optimizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optimizedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationsList: {
    flex: 1,
  },
  locationCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    marginBottom: 12,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTime: {
    fontSize: 13,
    marginLeft: 4,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  navigateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
});

export default DeliveryMapScreen;
