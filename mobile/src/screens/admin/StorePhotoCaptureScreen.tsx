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
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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
  const { colors } = useTheme();
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

      // Llamada real a la API para subir la foto
      const { getBaseURL } = await import('../../config/api');
      const baseUrl = await getBaseURL();
      
      console.log('📤 Subiendo foto de local...');
      console.log('🌐 URL:', `${baseUrl}/admin/upload-store-photo`);
      console.log('📋 Datos del formulario:', {
        name: storeName.trim(),
        phone: storePhone.trim(),
        lat: location.latitude,
        lng: location.longitude,
        image: 'presente'
      });
      
      const response = await fetch(`${baseUrl}/admin/upload-store-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          // No incluir Content-Type para multipart/form-data, el navegador lo maneja automáticamente
        },
        body: formData,
      });

      console.log('📡 Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Resultado de la subida:', result);
      
      if (!result.success) {
        console.error('❌ Error en la respuesta:', result.message);
        throw new Error(result.message || 'Error subiendo la foto');
      }
      
      console.log('✅ Foto subida exitosamente');
      showToast('Foto subida exitosamente', 'success');
      
      // Limpiar formulario
      setImage(null);
      setLocation(null);
      setStoreName('');
      setStorePhone('');
      
    } catch (error) {
      console.error('❌ Error uploading photo:', error);
      let errorMessage = 'Error al subir la foto';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Error de conexión. Verifica tu internet.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage = 'Error del servidor. Intenta nuevamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast(errorMessage, 'error');
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colors.isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.surface}
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
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Capturar Foto de Local</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Toma una foto del local con GPS para enriquecimiento de datos
        </Text>
      </View>

      {/* Sección de foto */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Foto del Local</Text>
        
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
            <Ionicons name="camera" size={48} color={colors.textTertiary} />
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>Selecciona una foto</Text>
          </View>
        )}

        <View style={styles.imageButtons}>
          <TouchableOpacity style={[styles.imageButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={[styles.imageButtonText, { color: colors.primary }]}>Tomar Foto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.imageButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} onPress={selectFromGallery}>
            <Ionicons name="images" size={20} color={colors.primary} />
            <Text style={[styles.imageButtonText, { color: colors.primary }]}>Galería</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección de ubicación */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ubicación GPS</Text>
        
        {location ? (
          <View style={[styles.locationContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.success }]}>
            <Ionicons name="location" size={20} color={colors.success} />
            <Text style={[styles.locationText, { color: colors.textPrimary }]}>
              Lat: {location.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.locationText, { color: colors.textPrimary }]}>
              Lng: {location.longitude.toFixed(6)}
            </Text>
            {location.accuracy && (
              <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                Precisión: {location.accuracy.toFixed(0)}m
              </Text>
            )}
          </View>
        ) : (
          <View style={[styles.locationPlaceholder, { borderColor: colors.border }]}>
            <Ionicons name="location-outline" size={32} color={colors.textTertiary} />
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>Ubicación no obtenida</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }, isLoadingLocation && styles.disabledButton]}
          onPress={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={colors.primary} />
          )}
          <Text style={[styles.locationButtonText, { color: colors.primary }]}>
            {isLoadingLocation ? 'Obteniendo...' : 'Obtener Ubicación'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sección de información del local */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Información del Local</Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Nombre del Local *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="Ej: Repuestos El Motor"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Teléfono (opcional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.textPrimary }]}
            value={storePhone}
            onChangeText={setStorePhone}
            placeholder="+584121234567"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Botón de subida */}
      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: colors.primary }, isUploading && styles.disabledButton]}
        onPress={uploadPhoto}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="cloud-upload" size={20} color="#fff" />
        )}
        <Text style={styles.uploadButtonText}>
          {isUploading ? 'Subiendo...' : 'Subir Foto'}
        </Text>
      </TouchableOpacity>

      <View style={[styles.footer, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
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
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
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
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  locationText: {
    fontSize: 14,
    marginTop: 4,
  },
  accuracyText: {
    fontSize: 12,
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
    borderStyle: 'dashed',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 16,
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
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
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