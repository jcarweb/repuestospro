import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCryptoAuth } from '../../contexts/CryptoAuthContext';
import cryptoAuthService from '../../services/cryptoAuthService';
import { useToast } from '../../contexts/ToastContext';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

const StorePhotoCaptureScreen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const { user, isAdmin } = useCryptoAuth();
  const { showToast } = useToast();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Solicitar permisos de cámara
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos de cámara para tomar fotos de locales.'
        );
        return;
      }

      // Solicitar permisos de ubicación
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos de ubicación para obtener las coordenadas GPS.'
        );
        return;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      showToast('Error solicitando permisos', 'error');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
      });

      setLocation({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy,
      });

      showToast('Ubicación obtenida exitosamente', 'success');
    } catch (error) {
      console.error('Error getting location:', error);
      showToast('Error obteniendo ubicación', 'error');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        
        // Obtener ubicación automáticamente después de tomar la foto
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showToast('Error tomando foto', 'error');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        
        // Obtener ubicación automáticamente después de seleccionar la foto
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      showToast('Error seleccionando imagen', 'error');
    }
  };

  const uploadPhoto = async () => {
    if (!image || !location || !storeName.trim()) {
      Alert.alert(
        'Datos incompletos',
        'Por favor, toma una foto, obtén la ubicación y proporciona el nombre del local.'
      );
      return;
    }

    try {
      setIsUploading(true);

      const response = await cryptoAuthService.uploadStorePhoto({
        name: storeName.trim(),
        phone: storePhone.trim() || undefined,
        lat: location.latitude,
        lng: location.longitude,
        imageUri: image,
      });

      if (response.success) {
        showToast('Foto subida exitosamente', 'success');
        
        // Limpiar formulario
        setImage(null);
        setLocation(null);
        setStoreName('');
        setStorePhone('');
      } else {
        throw new Error(response.message || 'Error subiendo foto');
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      showToast(error.message || 'Error subiendo foto', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Verificar si el usuario es admin
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedTitle}>Acceso Restringido</Text>
          <Text style={styles.restrictedText}>
            Solo los administradores pueden acceder a esta funcionalidad.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Capturar Foto de Local</Text>
        <Text style={styles.subtitle}>
          Toma una foto del local con GPS para enriquecimiento de datos
        </Text>
      </View>

      {/* Sección de foto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Foto del Local</Text>
        
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.removeImageText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtonsContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={selectFromGallery}>
              <Text style={styles.photoButtonText}>🖼️ Seleccionar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sección de ubicación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación GPS</Text>
        
        {location ? (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              📍 Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              📍 Lng: {location.longitude.toFixed(6)}
            </Text>
            {location.accuracy && (
              <Text style={styles.accuracyText}>
                Precisión: {location.accuracy.toFixed(0)}m
              </Text>
            )}
            <TouchableOpacity
              style={styles.updateLocationButton}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.updateLocationText}>Actualizar Ubicación</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.getLocationButton}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.getLocationText}>📍 Obtener Ubicación</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Sección de información del local */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Local</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nombre del local *"
          value={storeName}
          onChangeText={setStoreName}
          maxLength={100}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Teléfono (opcional)"
          value={storePhone}
          onChangeText={setStorePhone}
          keyboardType="phone-pad"
          maxLength={20}
        />
      </View>

      {/* Botón de subida */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!image || !location || !storeName.trim() || isUploading) && styles.uploadButtonDisabled
          ]}
          onPress={uploadPhoto}
          disabled={!image || !location || !storeName.trim() || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>📤 Subir Foto</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          La foto será procesada automáticamente para extraer información del local.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeImageButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  getLocationButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  getLocationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateLocationButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  updateLocationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  uploadSection: {
    margin: 16,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StorePhotoCaptureScreen;
