import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface InteractiveMapProps {
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

const InteractiveMap: React.FC<InteractiveMapProps> = ({
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
  const [showMapModal, setShowMapModal] = useState(false);
  const [manualCoords, setManualCoords] = useState({
    latitude: '',
    longitude: ''
  });

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
      showToast('Permisos de ubicación requeridos', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      const address = await getAddressFromCoords(latitude, longitude);

      const newLocation = {
        latitude,
        longitude,
        address,
      };

      setLocation(newLocation);
      onLocationSelect(newLocation);
      showToast('Ubicación actual obtenida', 'success');
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
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
        return `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
      }

      return 'Ubicación seleccionada';
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return 'Ubicación seleccionada';
    }
  };

  const handleManualLocation = () => {
    setShowMapModal(true);
    if (location) {
      setManualCoords({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString()
      });
    }
  };

  const confirmManualLocation = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      showToast('Coordenadas inválidas', 'error');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      showToast('Coordenadas fuera de rango válido', 'error');
      return;
    }

    const newLocation = {
      latitude: lat,
      longitude: lng,
      address: 'Ubicación manual',
    };

    setLocation(newLocation);
    onLocationSelect(newLocation);
    setShowMapModal(false);
    showToast('Ubicación manual configurada', 'success');
  };

  const selectFromPresetLocations = () => {
    Alert.alert(
      'Ubicaciones Predefinidas',
      'Selecciona una ubicación:',
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
            showToast('Ubicación: Bogotá', 'success');
          }
        },
        {
          text: 'Caracas, Venezuela',
          onPress: () => {
            const newLocation = {
              latitude: 10.4631911,
              longitude: -66.984321,
              address: 'Caracas, Venezuela',
            };
            setLocation(newLocation);
            onLocationSelect(newLocation);
            showToast('Ubicación: Caracas', 'success');
          }
        },
        {
          text: 'Medellín, Colombia',
          onPress: () => {
            const newLocation = {
              latitude: 6.2442,
              longitude: -75.5812,
              address: 'Medellín, Colombia',
            };
            setLocation(newLocation);
            onLocationSelect(newLocation);
            showToast('Ubicación: Medellín', 'success');
          }
        }
      ]
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

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Ionicons name="location" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Seleccionar Ubicación
        </Text>
      </View>

      {/* Mapa simulado */}
      <View style={[styles.mapContainer, { backgroundColor: colors.surfaceSecondary }]}>
        {location ? (
          <View style={styles.mapContent}>
            <View style={[styles.mapPin, { backgroundColor: colors.primary }]}>
              <Ionicons name="location" size={30} color="white" />
            </View>
            <Text style={[styles.coordinatesText, { color: colors.textPrimary }]}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {location.address}
            </Text>
            
            <View style={styles.locationDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="navigate" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Lat: {location.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="navigate" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Lng: {location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={60} color={colors.textTertiary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Selecciona una ubicación
            </Text>
            <Text style={[styles.placeholderSubtext, { color: colors.textTertiary }]}>
              Usa los botones de abajo para elegir
            </Text>
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={getCurrentLocation}
          disabled={isLoading || !hasPermission}
        >
          <Ionicons name="locate" size={20} color="white" />
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Obteniendo...' : 'Ubicación Actual'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={handleManualLocation}
        >
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.actionButtonText}>Coordenadas Manuales</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={selectFromPresetLocations}
        >
          <Ionicons name="list" size={20} color="white" />
          <Text style={styles.actionButtonText}>Ubicaciones Predefinidas</Text>
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

      {/* Modal para coordenadas manuales */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Ingresar Coordenadas
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Latitud (-90 a 90)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  color: colors.textPrimary,
                  borderColor: colors.border 
                }]}
                value={manualCoords.latitude}
                onChangeText={(text) => setManualCoords(prev => ({ ...prev, latitude: text }))}
                placeholder="Ej: 4.7110"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Longitud (-180 a 180)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  color: colors.textPrimary,
                  borderColor: colors.border 
                }]}
                value={manualCoords.longitude}
                onChangeText={(text) => setManualCoords(prev => ({ ...prev, longitude: text }))}
                placeholder="Ej: -74.0721"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textTertiary }]}
                onPress={() => setShowMapModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={confirmManualLocation}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
        <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
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
    fontSize: 14,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  permissionText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  instructionsText: {
    marginLeft: 8,
    fontSize: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default InteractiveMap;
