import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(initialLocation || null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        showToast('Se necesitan permisos de ubicación para usar el mapa', 'warning');
      }
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      showToast('Error al solicitar permisos de ubicación', 'error');
    }
  };

  const getCurrentLocation = async () => {
    if (!hasPermission) {
      showToast('Se necesitan permisos de ubicación', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      // Obtener dirección a partir de coordenadas
      const address = await getAddressFromCoords(latitude, longitude);
      
      const newLocation = {
        latitude,
        longitude,
        address: address || 'Ubicación actual',
      };

      setLocation(newLocation);
      onLocationSelect(newLocation);
      showToast('Ubicación actual obtenida', 'success');
    } catch (error) {
      console.error('Error al obtener ubicación actual:', error);
      showToast('Error al obtener ubicación actual', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const parts = [
          address.street,
          address.streetNumber,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);
        
        return parts.join(', ');
      }
      
      return 'Ubicación seleccionada';
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return 'Ubicación seleccionada';
    }
  };

  const handleManualLocation = () => {
    Alert.prompt(
      'Ingresar Coordenadas',
      'Ingresa las coordenadas (ej: 4.7110, -74.0721)',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: (text) => {
            if (text) {
              const coords = text.split(',').map(coord => parseFloat(coord.trim()));
              if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                const newLocation = {
                  latitude: coords[0],
                  longitude: coords[1],
                  address: 'Ubicación manual',
                };
                setLocation(newLocation);
                onLocationSelect(newLocation);
                showToast('Ubicación manual configurada', 'success');
              } else {
                showToast('Formato de coordenadas inválido', 'error');
              }
            }
          }
        }
      ],
      'plain-text',
      location ? `${location.latitude}, ${location.longitude}` : ''
    );
  };

  const clearLocation = () => {
    setLocation(null);
    onLocationSelect({
      latitude: 0,
      longitude: 0,
      address: '',
    });
    showToast('Ubicación eliminada', 'info');
  };

  const selectFromPresetLocations = () => {
    Alert.alert(
      'Ubicaciones Predefinidas',
      'Selecciona una ubicación común',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bogotá, Colombia',
          onPress: () => {
            const newLocation = {
              latitude: 4.7110,
              longitude: -74.0721,
              address: 'Bogotá, Colombia',
            };
            setLocation(newLocation);
            onLocationSelect(newLocation);
            showToast('Ubicación de Bogotá seleccionada', 'success');
          }
        },
        {
          text: 'Caracas, Venezuela',
          onPress: () => {
            const newLocation = {
              latitude: 10.4806,
              longitude: -66.9036,
              address: 'Caracas, Venezuela',
            };
            setLocation(newLocation);
            onLocationSelect(newLocation);
            showToast('Ubicación de Caracas seleccionada', 'success');
          }
        },
        {
          text: 'Valencia, Venezuela',
          onPress: () => {
            const newLocation = {
              latitude: 10.1579,
              longitude: -67.9972,
              address: 'Valencia, Venezuela',
            };
            setLocation(newLocation);
            onLocationSelect(newLocation);
            showToast('Ubicación de Valencia seleccionada', 'success');
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Ionicons name="location" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Seleccionar Ubicación
        </Text>
      </View>

      {/* Mapa Simulado Mejorado */}
      <View style={[styles.mapContainer, { backgroundColor: colors.surfaceSecondary }]}>
        {location ? (
          <View style={styles.mapContent}>
            <View style={[styles.mapPin, { backgroundColor: colors.primary }]}>
              <Ionicons name="location" size={32} color="white" />
            </View>
            <Text style={[styles.coordinatesText, { color: colors.textPrimary }]}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {location.address}
            </Text>
            
            {/* Información adicional */}
            <View style={styles.locationDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="globe" size={16} color={colors.textTertiary} />
                <Text style={[styles.detailText, { color: colors.textTertiary }]}>
                  Latitud: {location.latitude.toFixed(4)}°
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="compass" size={16} color={colors.textTertiary} />
                <Text style={[styles.detailText, { color: colors.textTertiary }]}>
                  Longitud: {location.longitude.toFixed(4)}°
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
              No hay ubicación seleccionada
            </Text>
            <Text style={[styles.placeholderSubtext, { color: colors.textTertiary }]}>
              Usa los botones de abajo para seleccionar
            </Text>
          </View>
        )}
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={getCurrentLocation}
          disabled={isLoading || !hasPermission}
        >
          <Ionicons 
            name="location" 
            size={20} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Obteniendo...' : 'Ubicación Actual'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.info }]}
          onPress={handleManualLocation}
        >
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.actionButtonText}>Manual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={selectFromPresetLocations}
        >
          <Ionicons name="list" size={20} color="white" />
          <Text style={styles.actionButtonText}>Predefinidas</Text>
        </TouchableOpacity>

        {location && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={clearLocation}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.actionButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Información de Permisos */}
      {hasPermission === false && (
        <View style={[styles.permissionWarning, { backgroundColor: colors.warning }]}>
          <Ionicons name="warning" size={20} color="white" />
          <Text style={styles.permissionText}>
            Permisos de ubicación requeridos para usar esta función
          </Text>
        </View>
      )}

      {/* Instrucciones */}
      <View style={[styles.instructions, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
        <Text style={styles.instructionsText}>
          Selecciona ubicación actual, ingresa coordenadas manualmente o elige de ubicaciones predefinidas
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  mapContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 16,
  },
  mapContent: {
    alignItems: 'center',
    padding: 20,
  },
  mapPin: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  coordinatesText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  locationDetails: {
    width: '100%',
    paddingHorizontal: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 8,
  },
  mapPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 12,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  permissionText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
    color: '#666',
  },
});

export default LocationPicker;
