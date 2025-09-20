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
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Icon from 'react-native-vector-icons/Icon';

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
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

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
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showToast('Error al tomar la foto', 'error');
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
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      showToast('Error al seleccionar la imagen', 'error');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      showToast('Ubicación obtenida exitosamente', 'success');
    } catch (error) {
      console.error('Error getting location:', error);
      showToast('Error al obtener la ubicación', 'error');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const uploadPhoto = async () => {
    if (!image || !storeName.trim()) {
      showToast('Por favor, completa todos los campos requeridos', 'error');
      return;
    }

    if (!location) {
      showToast('Por favor, obtén la ubicación GPS', 'error');
      return;
    }

    try {
      setIsUploading(true);

      // Crear FormData para la subida
      const formData = new FormData();
      formData.append('name', storeName.trim());
      if (storePhone.trim()) {
        formData.append('phone', storePhone.trim());
      }
      formData.append('lat', location.latitude.toString());
      formData.append('lng', location.longitude.toString());
      
      // Agregar la imagen
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'store_photo.jpg',
      } as any);

      // Aquí harías la llamada a la API para subir la foto
      // const response = await apiService.uploadStorePhoto(formData);
      
      // Simular subida exitosa
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('Foto subida exitosamente', 'success');
      
      // Limpiar formulario
      setImage(null);
      setLocation(null);
      setStoreName('');
      setStorePhone('');
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast('Error al subir la foto', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Verificar si el usuario es admin
  if (user?.role !== 'admin') {
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
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
        translucent={false}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
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
              <Icon name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="camera" size={48} color="#8E8E93" />
            <Text style={styles.placeholderText}>Selecciona una foto</Text>
          </View>
        )}

        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Icon name="camera" size={20} color="#007AFF" />
            <Text style={styles.imageButtonText}>Tomar Foto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imageButton} onPress={selectFromGallery}>
            <Icon name="images" size={20} color="#007AFF" />
            <Text style={styles.imageButtonText}>Galería</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección de ubicación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación GPS</Text>
        
        {location ? (
          <View style={styles.locationContainer}>
            <Icon name="location" size={20} color="#34C759" />
            <Text style={styles.locationText}>
              Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {location.longitude.toFixed(6)}
            </Text>
            {location.accuracy && (
              <Text style={styles.accuracyText}>
                Precisión: {location.accuracy.toFixed(0)}m
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.locationPlaceholder}>
            <Icon name="location-outline" size={32} color="#8E8E93" />
            <Text style={styles.placeholderText}>Ubicación no obtenida</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.locationButton, isLoadingLocation && styles.disabledButton]}
          onPress={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Icon name="locate" size={20} color="#007AFF" />
          )}
          <Text style={styles.locationButtonText}>
            {isLoadingLocation ? 'Obteniendo...' : 'Obtener Ubicación'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sección de información del local */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Local</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nombre del Local *</Text>
          <TextInput
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="Ej: Repuestos El Motor"
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Teléfono (opcional)</Text>
          <TextInput
            style={styles.input}
            value={storePhone}
            onChangeText={setStorePhone}
            placeholder="+584121234567"
            placeholderTextColor="#8E8E93"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Botón de subida */}
      <TouchableOpacity
        style={[styles.uploadButton, isUploading && styles.disabledButton]}
        onPress={uploadPhoto}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="cloud-upload" size={20} color="#fff" />
        )}
        <Text style={styles.uploadButtonText}>
          {isUploading ? 'Subiendo...' : 'Subir Foto'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          La foto será procesada automáticamente para extraer información del local.
        </Text>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    padding: 20,
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
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  locationContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  locationPlaceholder: {
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  footer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
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
