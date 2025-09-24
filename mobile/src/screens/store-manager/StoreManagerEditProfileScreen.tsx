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

const StoreManagerEditProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, loadUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const saveAttemptRef = useRef(0);

  useEffect(() => {
    requestPermissions();
    loadProfileData();
  }, []);

  // Recargar datos cuando se regrese a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      if (!user?.id) {
        console.log('No hay usuario logueado, no se pueden cargar datos del perfil');
        return;
      }

      // Cargar datos guardados del perfil específicos del usuario
      const userProfileKey = `profileData_${user.id}`;
      const savedProfileData = await AsyncStorage.getItem(userProfileKey);
      
      if (savedProfileData) {
        const profileData = JSON.parse(savedProfileData);
        console.log(`Datos del perfil cargados para usuario ${user.id}:`, profileData);
        
        setName(profileData.name || user?.name || '');
        setEmail(profileData.email || user?.email || '');
        setPhone(profileData.phone || '');
        setAddress(profileData.address || '');
        setProfileImage(profileData.profileImage || null);
        
        // Cargar ubicación GPS
        if (profileData.location && profileData.location.coordinates && profileData.location.coordinates.length === 2) {
          const locationData = {
            latitude: profileData.location.coordinates[1],
            longitude: profileData.location.coordinates[0],
            address: profileData.location.address || 'Ubicación guardada'
          };
          setLocation(locationData);
          console.log('Ubicación GPS cargada:', locationData);
        } else {
          console.log('No hay datos de ubicación GPS guardados');
        }
      } else {
        // Usar datos del usuario actual
        setName(user?.name || '');
        setEmail(user?.email || '');
        console.log(`No hay datos de perfil guardados para usuario ${user.id}, usando datos del usuario:`, user);
      }
    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
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

  const saveProfileData = async () => {
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
        const response = await apiService.updateUserProfile({
          name,
          email,
          phone,
          address,
          location: profileData.location
        });
        
        if (response.success) {
          showToast('Perfil actualizado exitosamente', 'success');
          // Recargar perfil del usuario
          await loadUserProfile();
        } else {
          showToast('Perfil guardado localmente', 'info');
        }
      } catch (error) {
        console.error('Error guardando en backend:', error);
        showToast('Perfil guardado localmente', 'info');
      }
      
    } catch (error) {
      console.error('Error guardando perfil:', error);
      showToast('Error al guardar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-guardar después de cambios
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (name || email || phone || address) {
        saveProfileData();
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [name, email, phone, address, profileImage, location]);

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
                <Ionicons name="storefront" size={40} color="white" />
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
});

export default StoreManagerEditProfileScreen;
