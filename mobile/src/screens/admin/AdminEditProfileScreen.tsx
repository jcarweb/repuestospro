import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import LocationPicker from '../../components/LocationPicker';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminEditProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, loadUserProfile, updateUserAfterProfileEdit } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const saveAttemptRef = useRef(0);

  const getBaseUrl = async () => {
    try {
      const { getBaseURL } = await import('../../config/api');
      const baseUrl = await getBaseURL();
      return baseUrl.replace('/api', '');
    } catch (error) {
      console.error('Error obteniendo URL base:', error);
      return 'https://piezasya-back.onrender.com'; // Fallback
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // Cargar datos cuando el usuario esté disponible (solo una vez)
  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  // Recargar datos cuando se regrese a la pantalla (solo si es necesario)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id && isInitialLoad) {
        // Solo recargar en la carga inicial
        loadProfileData();
      }
    }, [user?.id, isInitialLoad])
  );


  const loadProfileData = async () => {
    try {
      console.log('🔄 loadProfileData iniciado');
      
      if (!user?.id) {
        console.log('❌ No hay usuario logueado, no se pueden cargar datos del perfil');
        return;
      }

      // Cargar datos frescos del backend sin actualizar el contexto (para evitar bucles)
      let userData = null;
      
      try {
        console.log('🔄 Cargando datos directamente del backend...');
        const response = await apiService.getUserProfile();
        
        if (response.success && response.data) {
          console.log('✅ Datos del backend obtenidos directamente:', response.data);
          userData = response.data;
        } else {
          console.log('❌ No se pudieron obtener datos del backend, usando usuario actual');
          userData = user;
        }
      } catch (error) {
        console.log('❌ Error cargando datos del backend, usando usuario actual:', error);
        userData = user;
      }

      // Usar datos del usuario (del backend o actual)
      console.log('📥 Cargando datos en AdminEditProfile:');
      console.log('  - name:', userData?.name);
      console.log('  - email:', userData?.email);
      console.log('  - phone:', userData?.phone);
      console.log('  - address:', userData?.address);
      console.log('  - avatar:', userData?.avatar);
      
      setName(userData?.name || '');
      setEmail(userData?.email || '');
      setPhone(userData?.phone || '');
      setAddress(userData?.address || '');
      
      console.log('📝 Estados establecidos:');
      console.log('  - name state:', userData?.name || '');
      console.log('  - email state:', userData?.email || '');
      console.log('  - phone state:', userData?.phone || '');
      console.log('  - address state:', userData?.address || '');
      
      // Cargar imagen de perfil actual del usuario
      console.log('🖼️ Cargando imagen de perfil en edición:');
      console.log('  - userData completo:', JSON.stringify(userData, null, 2));
      console.log('  - userData.avatar:', userData?.avatar);
      console.log('  - userData.profileImage:', userData?.profileImage);
      
      const avatarUrl = userData?.avatar || userData?.profileImage || null;
      console.log('  - avatarUrl final:', avatarUrl);
      console.log('  - tipo de avatarUrl:', typeof avatarUrl);
      console.log('  - longitud de avatarUrl:', avatarUrl?.length);
      
      if (avatarUrl && avatarUrl.trim() !== '') {
        if (avatarUrl.startsWith('http')) {
          // URL completa de Cloudinary o externa
          console.log('🖼️ Usando URL completa:', avatarUrl);
          setProfileImage(avatarUrl);
        } else if (avatarUrl.startsWith('/uploads/') || avatarUrl.startsWith('uploads/')) {
          // Ruta relativa del servidor
          const baseUrl = await getBaseUrl();
          const fullImageUrl = `${baseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
          console.log('🖼️ Construyendo URL completa:', fullImageUrl);
          setProfileImage(fullImageUrl);
        } else {
          // Otra ruta relativa
          const baseUrl = await getBaseUrl();
          const fullImageUrl = `${baseUrl}/${avatarUrl}`;
          console.log('🖼️ Construyendo URL completa (otra ruta):', fullImageUrl);
          setProfileImage(fullImageUrl);
        }
      } else {
        console.log('🖼️ No hay imagen de perfil, usando avatar por defecto');
        setProfileImage(null);
      }

      // Cargar ubicación GPS si existe
      if (userData?.location && userData.location.coordinates && userData.location.coordinates.length === 2) {
        const locationData = {
          latitude: userData.location.coordinates[1],
          longitude: userData.location.coordinates[0],
          address: userData.location.address || 'Ubicación guardada'
        };
        setLocation(locationData);
        console.log('📍 Ubicación GPS cargada:', locationData);
      } else {
        console.log('📍 No hay datos de ubicación GPS del usuario');
      }

      console.log(`✅ Datos del perfil cargados para usuario ${user.id}:`, {
        name: userData?.name,
        email: userData?.email,
        phone: userData?.phone,
        address: userData?.address,
        avatar: userData?.avatar,
        location: userData?.location
      });
      
      // Marcar que la carga inicial está completa
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
      setIsInitialLoad(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para seleccionar una foto de perfil.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        showToast('Imagen seleccionada', 'success');
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      showToast('Error al seleccionar imagen', 'error');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu cámara para tomar una foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        showToast('Foto tomada', 'success');
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      showToast('Error al tomar foto', 'error');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Seleccionar Imagen',
      '¿Cómo quieres seleccionar tu foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galería', onPress: pickImage },
        { text: 'Cámara', onPress: takePhoto },
      ]
    );
  };

  const saveProfileData = async (isManualSave = false) => {
    try {
      setIsSaving(true);
      saveAttemptRef.current += 1;
      
      const profileData = {
        name,
        email,
        phone,
        address,
        profileImage,
        location: location ? {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          address: location.address
        } : null,
        lastUpdated: new Date().toISOString(),
        saveAttempt: saveAttemptRef.current
      };

      // Guardar localmente
      const userProfileKey = `profileData_${user?.id}`;
      await AsyncStorage.setItem(userProfileKey, JSON.stringify(profileData));
      
      // Intentar guardar en el backend
      try {
        // Validar que al menos hay datos para guardar
        if (!name && !email && !phone && !address && !location && !profileImage) {
          console.log('⚠️ No hay datos para guardar en el backend');
          return;
        }
        
        // Primero subir la imagen si es una nueva imagen local
        let uploadedImageUrl = null;
        if (profileImage && profileImage.startsWith('file://')) {
          try {
            console.log('📤 Subiendo nueva imagen de perfil...');
            const uploadResponse = await apiService.uploadProfileImage(profileImage);
            if (uploadResponse.success && uploadResponse.data?.avatar) {
              uploadedImageUrl = uploadResponse.data.avatar;
              console.log('✅ Imagen subida exitosamente:', uploadedImageUrl);
            } else {
              console.log('❌ Error subiendo imagen:', uploadResponse.message);
            }
          } catch (uploadError) {
            console.error('❌ Error subiendo imagen:', uploadError);
            showToast('Error subiendo imagen de perfil', 'warning');
          }
        }
        
        const backendData: any = {};
        
        // Solo incluir campos que no estén vacíos
        if (name && name.trim() !== '') {
          backendData.name = name;
        }
        if (email && email.trim() !== '') {
          backendData.email = email;
        }
        if (phone && phone.trim() !== '') {
          backendData.phone = phone;
        }
        if (address && address.trim() !== '') {
          backendData.address = address;
        }
        if (location) {
          backendData.location = {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
            address: location.address
          };
        }
        
        console.log('🔄 Enviando datos al backend:', backendData);
        console.log('🔄 Datos individuales:');
        console.log('  - name:', name, '(tipo:', typeof name, ', longitud:', name?.length, ')');
        console.log('  - email:', email, '(tipo:', typeof email, ', longitud:', email?.length, ')');
        console.log('  - phone:', phone, '(tipo:', typeof phone, ', longitud:', phone?.length, ')');
        console.log('  - address:', address, '(tipo:', typeof address, ', longitud:', address?.length, ')');
        console.log('  - location:', location);
        console.log('  - profileImage:', profileImage);
        console.log('  - uploadedImageUrl:', uploadedImageUrl);
        console.log('🔄 Estados actuales del componente:');
        console.log('  - name state:', name);
        console.log('  - email state:', email);
        console.log('  - phone state:', phone);
        console.log('  - address state:', address);
        console.log('  - profileImage state:', profileImage);
        
        const response = await apiService.updateUserProfile(backendData);
        
        console.log('📡 Respuesta del backend:', response);
        
        if (response.success) {
          console.log('✅ Backend actualizado exitosamente');
          showToast('Perfil actualizado exitosamente', 'success');
          
          // Actualizar el usuario con los nuevos datos del backend
          let updatedUserData = response.data;
          if (response.data?.user) {
            updatedUserData = response.data.user;
          }
          
          // Si se subió una nueva imagen, actualizar el avatar
          if (uploadedImageUrl) {
            updatedUserData = {
              ...updatedUserData,
              avatar: uploadedImageUrl,
              profileImage: uploadedImageUrl
            };
          }
          
          await updateUserAfterProfileEdit(updatedUserData);
          
          // No recargar automáticamente - los datos ya están actualizados en el contexto
        } else {
          console.log('❌ Backend falló:', response.message);
          showToast('Perfil guardado localmente', 'info');
        }
      } catch (error) {
        console.error('❌ Error guardando en backend:', error);
        if (isManualSave) {
          showToast('Error al guardar en el servidor. Datos guardados localmente.', 'warning');
        } else {
          showToast('Perfil guardado localmente', 'info');
        }
      }
      
    } catch (error) {
      console.error('Error guardando perfil:', error);
      showToast('Error al guardar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    saveProfileData(true);
  };

  const handleRefreshData = () => {
    setIsInitialLoad(true);
    loadProfileData();
  };

  // Auto-guardar después de cambios (solo si hay cambios reales)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Solo auto-guardar si hay cambios reales y no estamos en el proceso de carga inicial
    const hasRealChanges = (name && name !== user?.name) || 
                          (email && email !== user?.email) || 
                          (phone && phone !== user?.phone) || 
                          (address && address !== user?.address) ||
                          (profileImage && profileImage !== user?.avatar && profileImage !== user?.profileImage) ||
                          (location && JSON.stringify(location) !== JSON.stringify(user?.location));
    
    // Solo auto-guardar si hay datos cargados y no estamos en carga inicial
    const hasLoadedData = name || email || phone || address;
    
    if (hasRealChanges && hasLoadedData && !isInitialLoad) {
      console.log('🔄 Auto-guardado detectado - hay cambios reales');
      saveTimeoutRef.current = setTimeout(() => {
        saveProfileData();
      }, 3000); // Aumentar delay para evitar guardados excesivos
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [name, email, phone, address, profileImage, location, user?.name, user?.email, user?.phone, user?.address, user?.avatar, user?.profileImage, user?.location, isInitialLoad]);

  const handleLocationSelect = (selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setLocation(selectedLocation);
    showToast('Ubicación actualizada', 'success');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Profile Image Section */}
        <View style={[styles.imageSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Foto de Perfil
          </Text>
          <View style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={40} color="white" />
              </View>
            )}
            <TouchableOpacity
              style={[styles.imageButton, { backgroundColor: colors.primary }]}
              onPress={showImagePicker}
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Información Personal
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.textPrimary,
                borderColor: colors.border 
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Ingresa tu nombre"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.textPrimary,
                borderColor: colors.border 
              }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Ingresa tu email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.textPrimary,
                borderColor: colors.border 
              }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Ingresa tu teléfono"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Dirección</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.textPrimary,
                borderColor: colors.border 
              }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Ingresa tu dirección"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Ubicación GPS
          </Text>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={location}
            colors={colors}
          />
        </View>

        {/* Action Buttons */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleManualSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="save" size={20} color="white" />
            )}
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
            onPress={handleRefreshData}
            disabled={isSaving}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
            <Text style={[styles.refreshButtonText, { color: colors.primary }]}>
              Recargar Datos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Status */}
        {isSaving && (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.savingText, { color: colors.textSecondary }]}>
              Guardando...
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  imageSection: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  savingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AdminEditProfileScreen;
