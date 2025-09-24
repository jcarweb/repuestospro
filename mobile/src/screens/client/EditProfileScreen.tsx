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

const EditProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, loadUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+57 300 123 4567');
  const [address, setAddress] = useState('Calle 123 #45-67, Bogotá');
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
        setPhone(profileData.phone || '+57 300 123 4567');
        setAddress(profileData.address || 'Calle 123 #45-67, Bogotá');
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
    // Solicitar permisos de cámara
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      showToast('Se necesitan permisos de cámara para tomar fotos', 'warning');
    }
  };

  const resetSaveState = useCallback(() => {
    setIsSaving(false);
    saveAttemptRef.current = 0;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (isSaving) {
      Alert.alert(
        'Guardado en Progreso',
        '¿Deseas cancelar el guardado actual e intentar de nuevo?',
        [
          {
            text: 'Continuar Esperando',
            style: 'cancel'
          },
          {
            text: 'Cancelar y Reintentar',
            style: 'destructive',
            onPress: () => {
              resetSaveState();
              // Llamar handleSave de nuevo después de un pequeño delay
              setTimeout(handleSave, 500);
            }
          }
        ]
      );
      return;
    }

    try {
      setIsSaving(true);
      saveAttemptRef.current += 1;
      
      // Establecer un timeout de 30 segundos para el guardado
      saveTimeoutRef.current = setTimeout(() => {
        if (isSaving) {
          setIsSaving(false);
          showToast('El guardado está tomando demasiado tiempo. Intenta de nuevo.', 'error');
        }
      }, 30000);

      showToast('Guardando perfil...', 'info');
      
      // Preparar datos del perfil
      const profileData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        location: location ? {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          address: location.address
        } : undefined,
        profileImage: profileImage
      };

      // Guardar en el backend real
      console.log('📤 Enviando datos del perfil:', profileData);
      const response = await apiService.updateUserProfile(profileData);
      console.log('📥 Respuesta del backend:', response);
      
      if (response.success && response.data) {
        // Actualizar el usuario en el contexto
        const updatedUser = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Guardar datos del perfil específicos del usuario localmente también
        const userProfileKey = `profileData_${user.id}`;
        const profileDataToSave = {
          ...profileData,
          profileImage: profileImage, // Asegurar que la imagen se guarde
          avatar: profileImage // También guardar como avatar para compatibilidad
        };
        await AsyncStorage.setItem(userProfileKey, JSON.stringify(profileDataToSave));
        
        console.log('Perfil actualizado en backend:', updatedUser);
        
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        showToast('Perfil actualizado correctamente', 'success');
        console.log('Perfil actualizado:', updatedUser);
        
        // Recargar el perfil del usuario desde el backend
        try {
          console.log('🔄 Recargando perfil del usuario...');
          await loadUserProfile();
          console.log('✅ Perfil recargado exitosamente');
        } catch (reloadError) {
          console.error('❌ Error recargando perfil:', reloadError);
        }
        
        resetSaveState();
      } else {
        console.error('❌ Error en la respuesta del backend:', response);
        throw new Error(response.message || response.error || 'Error al actualizar perfil en el servidor');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      
      if (saveAttemptRef.current < 3) {
        Alert.alert(
          'Error al Guardar',
          '¿Deseas intentar guardar nuevamente?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: resetSaveState
            },
            {
              text: 'Reintentar',
              onPress: () => {
                resetSaveState();
                setTimeout(handleSave, 1000);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error al Guardar',
          'Se ha alcanzado el límite de intentos. Por favor, verifica tu conexión e intenta más tarde.',
          [
            {
              text: 'Entendido',
              onPress: resetSaveState
            }
          ]
        );
      }
      
      // Mostrar mensaje específico según el tipo de error
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          showToast('Error de conexión. Verifica tu conexión a internet.', 'error');
        } else if (error.message.includes('timeout')) {
          showToast('La operación tardó demasiado. Intenta de nuevo.', 'error');
        } else {
          showToast(`Error: ${error.message}`, 'error');
        }
      } else {
        showToast('Ocurrió un error inesperado. Intenta de nuevo.', 'error');
      }
    }
  };

  const handleChangePhoto = async () => {
    Alert.alert(
      'Cambiar Foto',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Tomar Foto', 
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
                showToast('Foto tomada correctamente', 'success');
              }
            } catch (error) {
              showToast('Error al tomar la foto', 'error');
            }
          }
        },
        { 
          text: 'Galería', 
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
                showToast('Foto seleccionada correctamente', 'success');
              }
            } catch (error) {
              showToast('Error al seleccionar la foto', 'error');
            }
          }
        },
      ]
    );
  };



  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Editar Perfil
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Actualiza tu información personal
        </Text>
      </View>

      {/* Foto de perfil */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Foto de Perfil
        </Text>
        
        <TouchableOpacity
          style={[styles.photoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleChangePhoto}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={60} color={colors.textTertiary} />
              <Text style={[styles.photoText, { color: colors.textSecondary }]}>
                Toca para cambiar foto
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Información personal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información Personal
        </Text>
        
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Nombre completo *
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre completo"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Correo electrónico *
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Teléfono
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+57 300 123 4567"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Dirección
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={address}
            onChangeText={setAddress}
            placeholder="Tu dirección completa"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Ubicación y Mapa */}
      <LocationPicker
        onLocationSelect={(newLocation) => setLocation(newLocation)}
        initialLocation={location}
      />

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: isSaving ? colors.textTertiary : colors.primary,
              opacity: isSaving ? 0.7 : 1
            }
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#000000" style={styles.saveButtonSpinner} />
              <Text style={[styles.saveButtonText, { color: '#000000' }]}>
                Guardando...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#000000" />
              <Text style={[styles.saveButtonText, { color: '#000000' }]}>
                Guardar Cambios
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 20,
    marginBottom: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  saveButtonSpinner: {
    marginRight: 8,
  },

});

export default EditProfileScreen;
