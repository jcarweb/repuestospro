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
import { BackendSwitcher } from '../../components/BackendSwitcher';

const StoreManagerProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout, loadUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    console.log('StoreManagerProfileScreen useEffect ejecutado');
    loadProfileData();
    setTimeout(() => {
      console.log('StoreManagerProfileScreen carga completada');
      setIsLoaded(true);
    }, 1000);
  }, []);

  // Recargar datos cuando se regrese a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

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

  const loadProfileData = async () => {
    try {
      if (!user?.id) {
        console.log('No hay usuario logueado, no se pueden cargar datos del perfil');
        return;
      }

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
        const avatarUrl = user.avatar || data.profileImage || null;
        console.log('🖼️ Avatar URL encontrada:', avatarUrl);
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
        const avatarUrl = user.avatar || null;
        console.log('🖼️ Avatar URL del usuario:', avatarUrl);
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
    navigation.navigate('StoreManagerEditProfile' as never);
  };

  const handleInventoryPress = () => {
    navigation.navigate('StoreManagerInventory' as never);
  };

  const handleOrdersPress = () => {
    navigation.navigate('StoreManagerOrders' as never);
  };

  const handleStaffPress = () => {
    navigation.navigate('StoreManagerStaff' as never);
  };

  const handleReportsPress = () => {
    showToast('Funcionalidad de reportes próximamente', 'info');
  };

  const handleSettingsPress = () => {
    navigation.navigate('StoreManagerSettings' as never);
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

  console.log('StoreManagerProfileScreen render - isLoaded:', isLoaded, 'user:', user);

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Ionicons name="storefront" size={40} color="white" />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {user?.name || 'Gestor de Tienda'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'manager@piezasya.com'}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={[styles.roleText, { color: colors.primary }]}>
                  Gestor de Tienda
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Store Management Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Gestión de Tienda
          </Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleInventoryPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="cube-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Gestión de Inventario
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleOrdersPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Gestión de Pedidos
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleStaffPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Gestión de Personal
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleReportsPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="bar-chart-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Reportes y Estadísticas
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Configuración
          </Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleSettingsPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Configuración de Tienda
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                Cerrar Sesión
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Backend Switcher */}
        <View style={styles.section}>
          <BackendSwitcher />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 195, 0, 0.1)',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default StoreManagerProfileScreen;
