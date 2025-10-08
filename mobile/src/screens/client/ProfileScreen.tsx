import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SimpleBackendStatus } from '../../components/SimpleBackendStatus';
import { BackendSwitcher } from '../../components/BackendSwitcher';
import { apiConfig } from '../../config/api';

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout, loadUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    console.log('ProfileScreen useEffect ejecutado');
    console.log('🔍 ProfileScreen - user recibido:', user);
    console.log('🔍 ProfileScreen - user.profileImage:', user?.profileImage);
    console.log('🔍 ProfileScreen - user.avatar:', user?.avatar);
    loadProfileData();
    setTimeout(() => {
      console.log('ProfileScreen carga completada');
      setIsLoaded(true);
    }, 1000);
  }, []);

  // Recargar datos cuando se regrese a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

  // Recargar imagen cuando cambie el usuario
  useEffect(() => {
    if (user) {
      console.log('🔍 ProfileScreen - Usuario cambió, recargando imagen');
      console.log('🔍 ProfileScreen - Nuevo user.profileImage:', user.profileImage);
      console.log('🔍 ProfileScreen - Nuevo user.avatar:', user.avatar);
      loadProfileData();
    }
  }, [user]);


  const getBaseUrl = async () => {
    try {
      const baseUrl = await apiConfig.getBaseURL();
      // Remover /api del final para obtener la URL base del servidor
      return baseUrl.replace('/api', '');
    } catch (error) {
      console.error('Error obteniendo URL base:', error);
      return 'https://piezasya-back.onrender.com'; // Fallback
    }
  };

  const loadProfileData = async () => {
    try {
      if (!user?.id) {
        console.log('No hay usuario logueado, no se pueden cargar datos del perfil');
        return;
      }

      // DEBUG: Verificar estado completo del usuario
      console.log('🔍 DEBUG COMPLETO DEL USUARIO:');
      console.log('🔍 user completo:', JSON.stringify(user, null, 2));
      console.log('🔍 user.profileImage:', user.profileImage);
      console.log('🔍 user.avatar:', user.avatar);
      console.log('🔍 typeof user.profileImage:', typeof user.profileImage);
      console.log('🔍 user.profileImage length:', user.profileImage?.length);

      // Primero intentar cargar datos reales del backend
      try {
        console.log('Cargando datos reales del usuario desde el backend...');
        await loadUserProfile();
      } catch (error) {
        console.log('No se pudieron cargar datos del backend, usando datos locales');
      }

      // Cargar datos del perfil guardados específicos del usuario
      const userProfileKey = `profileData_${user.id}`;
      const savedProfileData = await AsyncStorage.getItem(userProfileKey);
      
      if (savedProfileData) {
        const data = JSON.parse(savedProfileData);
        setProfileData(data);
        // Usar la imagen del usuario actualizado si está disponible, sino usar la guardada localmente
        const avatarUrl = user.profileImage || user.avatar || data.profileImage || null;
        console.log('🖼️ Avatar URL encontrada:', avatarUrl);
        console.log('🔍 user.profileImage:', user.profileImage);
        console.log('🔍 user.avatar:', user.avatar);
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          // Si es una ruta relativa, construir la URL completa
          const baseUrl = await getBaseUrl();
          const fullImageUrl = `${baseUrl}${avatarUrl}`;
          console.log('🖼️ URL completa de imagen construida:', fullImageUrl);
          setProfileImage(fullImageUrl);
        } else {
          console.log('🖼️ Usando URL de imagen directa:', avatarUrl);
          setProfileImage(avatarUrl);
        }
        console.log(`Datos del perfil cargados para usuario ${user.id}:`, data);
      } else {
        // Si no hay datos guardados localmente, usar los datos del usuario actualizado
        const avatarUrl = user.profileImage || user.avatar || null;
        console.log('🖼️ Avatar URL del usuario:', avatarUrl);
        console.log('🔍 user.profileImage:', user.profileImage);
        console.log('🔍 user.avatar:', user.avatar);
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          // Si es una ruta relativa, construir la URL completa
          const baseUrl = await getBaseUrl();
          const fullImageUrl = `${baseUrl}${avatarUrl}`;
          console.log('🖼️ URL completa de imagen construida:', fullImageUrl);
          setProfileImage(fullImageUrl);
        } else {
          console.log('🖼️ Usando URL de imagen directa:', avatarUrl);
          setProfileImage(avatarUrl);
        }
        console.log(`No hay datos de perfil guardados para usuario ${user.id}, usando datos del usuario actualizado`);
      }
    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
    }
  };

  const handleEditProfile = () => {
    console.log('Botón Editar presionado');
    navigation.navigate('EditProfile' as never);
  };



  const handleOrdersPress = () => {
    // Navegar a la pestaña de Pedidos
    (navigation as any).navigate('ClientTabs', { screen: 'Orders' });
  };

  const handleFavoritesPress = () => {
    // Navegar a la pestaña de Favoritos
    (navigation as any).navigate('ClientTabs', { screen: 'Favorites' });
  };

  const handleRatingPress = () => {
    showToast('Funcionalidad de reseñas próximamente', 'info');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  console.log('ProfileScreen render - isLoaded:', isLoaded, 'user:', user);

  if (!isLoaded) {
    console.log('Mostrando loading...');
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
            Cargando perfil...
          </Text>
        </View>
      </View>
    );
  }

  console.log('Renderizando perfil principal');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header con foto de perfil */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        {/* Foto de perfil */}
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={40} color="white" />
            </View>
          )}
        </View>
        
        {/* BOTÓN DE DEBUG TEMPORAL */}
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: '#FF6B6B', marginTop: 10 }]} 
          onPress={testImageDirectly}
        >
          <Text style={[styles.editButtonText, { color: 'white' }]}>🧪 TEST IMAGEN</Text>
        </TouchableOpacity>
        
        {/* BOTÓN DE TEST TOKEN */}
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: '#4CAF50', marginTop: 5 }]} 
          onPress={async () => {
            const { testTokenStatus } = useAuth();
            await testTokenStatus();
          }}
        >
          <Text style={[styles.editButtonText, { color: 'white' }]}>🔐 TEST TOKEN</Text>
        </TouchableOpacity>
        
        <Text style={[styles.userName, { color: colors.textPrimary }]}>
          {profileData?.name || user?.name || 'Usuario PiezasYA'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {profileData?.email || user?.email || 'usuario@piezasya.com'}
        </Text>
        
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={16} color="#000000" />
          <Text style={[styles.editButtonText, { color: '#000000' }]}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Backend Switcher */}
      <View style={styles.backendSwitcherContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Servidor Backend
        </Text>
        <BackendSwitcher />
      </View>



      {/* Información básica */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información de la Cuenta
        </Text>
        
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Miembro desde:
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              31 de diciembre de 2023
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Último acceso:
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              15 de enero de 2024
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Tipo de cuenta:
            </Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              Cliente
            </Text>
          </View>
          
          {profileData?.phone && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Teléfono:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {profileData.phone}
              </Text>
            </View>
          )}
          
          {profileData?.address && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Dirección:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {profileData.address}
              </Text>
            </View>
          )}
          
          {profileData?.location && profileData.location.address && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Ubicación:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {profileData.location.address}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Estadísticas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Mis Estadísticas
        </Text>
        
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleOrdersPress}
          >
            <Ionicons name="bag-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pedidos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleFavoritesPress}
          >
            <Ionicons name="heart-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>8</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favoritos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleRatingPress}
          >
            <Ionicons name="star-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>4.8</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calificación</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configuración rápida */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Configuración Rápida
        </Text>
        
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleSettingsPress}
        >
          <View style={styles.settingsButtonContent}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
            <View style={styles.settingsButtonText}>
              <Text style={[styles.settingsButtonTitle, { color: colors.textPrimary }]}>
                Configuración General
              </Text>
              <Text style={[styles.settingsButtonSubtitle, { color: colors.textSecondary }]}>
                Notificaciones, seguridad y privacidad
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Botón de cerrar sesión */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  backendSwitcherContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    minHeight: 40,
  },
  infoLabel: {
    fontSize: 14,
    width: 120,
    marginRight: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  settingsButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsButtonSubtitle: {
    fontSize: 14,
  },
});

export default ProfileScreen;
