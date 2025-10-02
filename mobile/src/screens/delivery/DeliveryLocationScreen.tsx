import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Switch,
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
    <Ionicons name="location" size={64} color="#007AFF" />
    <Text style={{ color: '#007AFF', marginTop: 8, fontSize: 16, fontWeight: '600' }}>
      Ubicación en Tiempo Real
    </Text>
    <Text style={{ color: '#666', marginTop: 4, fontSize: 12, textAlign: 'center' }}>
      Implementación con react-native-maps{'\n'}próximamente
    </Text>
  </View>
);

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

interface LocationSettings {
  isTracking: boolean;
  shareWithStore: boolean;
  shareWithCustomers: boolean;
  updateInterval: number; // en segundos
  batteryOptimization: boolean;
  backgroundTracking: boolean;
}

interface DeliveryStatus {
  status: 'available' | 'busy' | 'on_route' | 'offline';
  currentOrder?: string;
  estimatedArrival?: string;
  lastUpdate: string;
}

const DeliveryLocationScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    isTracking: false,
    shareWithStore: true,
    shareWithCustomers: false,
    updateInterval: 30,
    batteryOptimization: true,
    backgroundTracking: false,
  });
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>({
    status: 'offline',
    lastUpdate: new Date().toISOString(),
  });
  const [isSharing, setIsSharing] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  const { width, height } = Dimensions.get('window');
  const locationUpdateInterval = useRef<NodeJS.Timeout>();

  const loadLocationData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint real para datos de ubicación
      // const response = await apiService.getDeliveryLocation();
      // setCurrentLocation(response.data.currentLocation);
      // setLocationSettings(response.data.settings);
      // setDeliveryStatus(response.data.status);
      
      // Datos mock por ahora
      const mockLocation: LocationData = {
        latitude: 10.4806,
        longitude: -66.9036,
        accuracy: 5,
        timestamp: new Date().toISOString(),
        speed: 25,
        heading: 180,
      };

      setCurrentLocation(mockLocation);
      setDeliveryStatus({
        status: 'available',
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading location data:', error);
      showToast('Error al cargar datos de ubicación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      // TODO: Implementar tracking de ubicación real
      // await apiService.startLocationTracking();
      
      setLocationSettings(prev => ({ ...prev, isTracking: true }));
      showToast('Tracking de ubicación iniciado', 'success');
      
      // Simular actualizaciones de ubicación
      locationUpdateInterval.current = setInterval(() => {
        if (currentLocation) {
          const newLocation: LocationData = {
            ...currentLocation,
            latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.001,
            longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.001,
            timestamp: new Date().toISOString(),
            speed: Math.random() * 50,
            heading: Math.random() * 360,
          };
          setCurrentLocation(newLocation);
          setLocationHistory(prev => [...prev.slice(-9), newLocation]);
        }
      }, locationSettings.updateInterval * 1000);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      showToast('Error al iniciar tracking', 'error');
    }
  };

  const stopLocationTracking = async () => {
    try {
      // TODO: Implementar parada de tracking
      // await apiService.stopLocationTracking();
      
      setLocationSettings(prev => ({ ...prev, isTracking: false }));
      showToast('Tracking de ubicación detenido', 'info');
      
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      showToast('Error al detener tracking', 'error');
    }
  };

  const shareLocation = async () => {
    try {
      setIsSharing(true);
      // TODO: Implementar compartir ubicación
      // await apiService.shareLocation();
      
      showToast('Ubicación compartida exitosamente', 'success');
    } catch (error) {
      console.error('Error sharing location:', error);
      showToast('Error al compartir ubicación', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const updateDeliveryStatus = (newStatus: DeliveryStatus['status']) => {
    setDeliveryStatus(prev => ({
      ...prev,
      status: newStatus,
      lastUpdate: new Date().toISOString(),
    }));
    showToast(`Estado actualizado: ${getStatusText(newStatus)}`, 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#34C759';
      case 'busy': return '#FF9500';
      case 'on_route': return '#007AFF';
      case 'offline': return '#FF3B30';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'on_route': return 'En Ruta';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return 'checkmark-circle';
      case 'busy': return 'time';
      case 'on_route': return 'car';
      case 'offline': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const toggleLocationSetting = (setting: keyof LocationSettings) => {
    setLocationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const updateInterval = (interval: number) => {
    setLocationSettings(prev => ({
      ...prev,
      updateInterval: interval,
    }));
  };

  useEffect(() => {
    loadLocationData();
    
    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, []);

  const StatusButton = ({ status, label }: { status: DeliveryStatus['status']; label: string }) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        { 
          backgroundColor: deliveryStatus.status === status ? getStatusColor(status) : colors.surface,
          borderColor: getStatusColor(status)
        }
      ]}
      onPress={() => updateDeliveryStatus(status)}
    >
      <Ionicons 
        name={getStatusIcon(status) as any} 
        size={20} 
        color={deliveryStatus.status === status ? 'white' : getStatusColor(status)} 
      />
      <Text style={[
        styles.statusButtonText,
        { color: deliveryStatus.status === status ? 'white' : getStatusColor(status) }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const LocationCard = ({ location, index }: { location: LocationData; index: number }) => (
    <View style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.locationHeader}>
        <Text style={[styles.locationTime, { color: colors.textPrimary }]}>
          {new Date(location.timestamp).toLocaleTimeString('es-VE', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </Text>
        <Text style={[styles.locationAccuracy, { color: colors.textSecondary }]}>
          ±{location.accuracy}m
        </Text>
      </View>
      <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
      </Text>
      {location.speed && (
        <Text style={[styles.locationSpeed, { color: colors.textSecondary }]}>
          Velocidad: {location.speed.toFixed(1)} km/h
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando ubicación...
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
          Ubicación en Tiempo Real
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={shareLocation}
            disabled={isSharing}
          >
            <Ionicons name="share" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerButton, 
              { 
                backgroundColor: locationSettings.isTracking ? colors.error : colors.success,
                borderColor: colors.border 
              }
            ]}
            onPress={locationSettings.isTracking ? stopLocationTracking : startLocationTracking}
          >
            <Ionicons 
              name={locationSettings.isTracking ? 'stop' : 'play'} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Status */}
      <View style={[styles.statusSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statusHeader}>
          <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
            Estado Actual
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deliveryStatus.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(deliveryStatus.status) as any} 
              size={16} 
              color={getStatusColor(deliveryStatus.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(deliveryStatus.status) }]}>
              {getStatusText(deliveryStatus.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusButtons}>
          <StatusButton status="available" label="Disponible" />
          <StatusButton status="busy" label="Ocupado" />
          <StatusButton status="on_route" label="En Ruta" />
          <StatusButton status="offline" label="Desconectado" />
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
        />
      </View>

      {/* Current Location Info */}
      {currentLocation && (
        <View style={[styles.locationInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.locationInfoTitle, { color: colors.textPrimary }]}>
            Ubicación Actual
          </Text>
          <View style={styles.locationDetails}>
            <View style={styles.locationDetail}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={[styles.locationDetailText, { color: colors.textSecondary }]}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.locationDetail}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={[styles.locationDetailText, { color: colors.textSecondary }]}>
                {new Date(currentLocation.timestamp).toLocaleString('es-VE')}
              </Text>
            </View>
            <View style={styles.locationDetail}>
              <Ionicons name="speedometer" size={16} color={colors.primary} />
              <Text style={[styles.locationDetailText, { color: colors.textSecondary }]}>
                Precisión: ±{currentLocation.accuracy}m
              </Text>
            </View>
            {currentLocation.speed && (
              <View style={styles.locationDetail}>
                <Ionicons name="car" size={16} color={colors.primary} />
                <Text style={[styles.locationDetailText, { color: colors.textSecondary }]}>
                  Velocidad: {currentLocation.speed.toFixed(1)} km/h
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Location Settings */}
      <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.settingsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>
            Configuración de Ubicación
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Compartir con Tienda
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Permitir que la tienda vea tu ubicación
              </Text>
            </View>
            <Switch
              value={locationSettings.shareWithStore}
              onValueChange={() => toggleLocationSetting('shareWithStore')}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={locationSettings.shareWithStore ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Compartir con Clientes
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Permitir que los clientes vean tu ubicación
              </Text>
            </View>
            <Switch
              value={locationSettings.shareWithCustomers}
              onValueChange={() => toggleLocationSetting('shareWithCustomers')}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={locationSettings.shareWithCustomers ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Optimización de Batería
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Reducir frecuencia de actualización para ahorrar batería
              </Text>
            </View>
            <Switch
              value={locationSettings.batteryOptimization}
              onValueChange={() => toggleLocationSetting('batteryOptimization')}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={locationSettings.batteryOptimization ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Tracking en Segundo Plano
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Continuar tracking cuando la app esté en segundo plano
              </Text>
            </View>
            <Switch
              value={locationSettings.backgroundTracking}
              onValueChange={() => toggleLocationSetting('backgroundTracking')}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={locationSettings.backgroundTracking ? colors.primary : colors.textTertiary}
            />
          </View>
        </View>

        {/* Location History */}
        {locationHistory.length > 0 && (
          <View style={[styles.historySection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>
              Historial de Ubicación
            </Text>
            {locationHistory.slice(-5).map((location, index) => (
              <LocationCard key={index} location={location} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
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
  statusSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationDetails: {
    gap: 8,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDetailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  settingsContainer: {
    flex: 1,
  },
  settingsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  historySection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationAccuracy: {
    fontSize: 10,
  },
  locationCoords: {
    fontSize: 11,
    marginBottom: 2,
  },
  locationSpeed: {
    fontSize: 10,
  },
});

export default DeliveryLocationScreen;
