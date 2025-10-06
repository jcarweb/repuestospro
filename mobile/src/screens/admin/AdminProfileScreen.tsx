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
import apiService from '../../services/api';

const AdminProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout, loadUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    console.log('AdminProfileScreen useEffect ejecutado');
    loadProfileData();
    setTimeout(() => {
      console.log('AdminProfileScreen carga completada');
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

      // Usar la imagen del usuario actualizado
      const avatarUrl = user.profileImage || user.avatar || null;
      console.log('🖼️ Avatar URL del usuario:', avatarUrl);
      console.log('🔍 user.profileImage:', user.profileImage);
      console.log('🔍 user.avatar:', user.avatar);
      
      if (avatarUrl) {
        if (avatarUrl.startsWith('http')) {
          // URL completa de Cloudinary o externa
          console.log('🖼️ Usando URL completa:', avatarUrl);
          setProfileImage(avatarUrl);
        } else if (avatarUrl.startsWith('/uploads/')) {
          // Ruta relativa del servidor
          const baseUrl = await getBaseUrl();
          const fullImageUrl = `${baseUrl}${avatarUrl}`;
          console.log('🖼️ URL completa construida desde ruta relativa:', fullImageUrl);
          setProfileImage(fullImageUrl);
        } else {
          // Otra ruta relativa
          const baseUrl = await getBaseUrl();
          const fullImageUrl = `${baseUrl}${avatarUrl}`;
          console.log('🖼️ URL completa construida:', fullImageUrl);
          setProfileImage(fullImageUrl);
        }
      } else {
        console.log('🖼️ No hay avatar del usuario');
        setProfileImage(null);
      }

      // Cargar datos del perfil guardados específicos del usuario para información adicional
      const userProfileKey = `profileData_${user.id}`;
      const savedProfileData = await AsyncStorage.getItem(userProfileKey);
      
      if (savedProfileData) {
        const data = JSON.parse(savedProfileData);
        setProfileData(data);
        console.log(`Datos del perfil cargados para usuario ${user.id}:`, data);
      } else {
        console.log(`No hay datos de perfil guardados para usuario ${user.id}`);
      }
    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
    }
  };

  const handleEditProfile = () => {
    console.log('Botón Editar presionado');
    navigation.navigate('AdminEditProfile' as never);
  };

  const handleUsersPress = () => {
    navigation.navigate('AdminUsers' as never);
  };

  const handleProductsPress = () => {
    navigation.navigate('AdminProducts' as never);
  };

  const handleOrdersPress = () => {
    navigation.navigate('AdminOrders' as never);
  };

  const handleAnalyticsPress = () => {
    Alert.alert(
      'Analíticas y Reportes',
      'Esta funcionalidad está en desarrollo y estará disponible en una próxima actualización.\n\nPodrás acceder a:\n• Estadísticas de ventas\n• Reportes de usuarios\n• Métricas de rendimiento\n• Análisis de tendencias',
      [
        { text: 'Entendido', style: 'default' }
      ]
    );
  };

  const handleSettingsPress = () => {
    navigation.navigate('AdminSettings' as never);
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

  console.log('AdminProfileScreen render - isLoaded:', isLoaded, 'user:', user);

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
                  <Ionicons name="person" size={40} color="white" />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {user?.name || 'Administrador'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'admin@piezasya.com'}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={[styles.roleText, { color: colors.primary }]}>
                  Administrador
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
          
          {/* BOTONES DE DEBUG TEMPORALES */}
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: '#FF6B6B', marginTop: 10 }]} 
            onPress={async () => {
              const { testTokenStatus } = useAuth();
              await testTokenStatus();
            }}
          >
            <Text style={[styles.editButtonText, { color: 'white' }]}>🔐 TEST TOKEN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: '#4CAF50', marginTop: 5 }]} 
            onPress={async () => {
              console.log('🧪 TEST IMAGEN ADMIN:');
              console.log('🧪 user.profileImage:', user?.profileImage);
              console.log('🧪 user.avatar:', user?.avatar);
            }}
          >
            <Text style={[styles.editButtonText, { color: 'white' }]}>🧪 TEST IMAGEN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: '#9C27B0', marginTop: 5 }]} 
            onPress={async () => {
              console.log('🧪 TEST BACKEND DIRECTO:');
              try {
                const response = await apiService.getUserProfile();
                console.log('🧪 Respuesta directa del backend:', response);
                console.log('🧪 response.success:', response.success);
                console.log('🧪 response.data:', response.data);
                console.log('🧪 response.data.profileImage:', response.data?.profileImage);
                console.log('🧪 response.data.avatar:', response.data?.avatar);
              } catch (error) {
                console.log('🧪 Error en test backend:', error);
              }
            }}
          >
            <Text style={[styles.editButtonText, { color: 'white' }]}>🔍 TEST BACKEND</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: '#FF9800', marginTop: 5 }]} 
            onPress={async () => {
              console.log('🧪 TEST ASYNCSTORAGE:');
              try {
                const token = await AsyncStorage.getItem('authToken');
                const user = await AsyncStorage.getItem('user');
                console.log('🧪 Token en AsyncStorage:', token ? `${token.substring(0, 20)}...` : 'null');
                console.log('🧪 Usuario en AsyncStorage:', user ? JSON.parse(user) : 'null');
              } catch (error) {
                console.log('🧪 Error en test AsyncStorage:', error);
              }
            }}
          >
            <Text style={[styles.editButtonText, { color: 'white' }]}>💾 TEST STORAGE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: '#E91E63', marginTop: 5 }]} 
            onPress={async () => {
              console.log('🧪 FORZAR TOKEN SIMULADO:');
              try {
                // Crear un token simulado
                const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await AsyncStorage.setItem('authToken', mockToken);
                console.log('🧪 Token simulado creado:', mockToken);
                
                // Verificar que se guardó
                const verifyToken = await AsyncStorage.getItem('authToken');
                console.log('🧪 Token verificado:', verifyToken);
                
                // Notificar al apiService
                await apiService.refreshToken();
                console.log('🧪 apiService notificado del token simulado');
              } catch (error) {
                console.log('🧪 Error creando token simulado:', error);
              }
            }}
          >
            <Text style={[styles.editButtonText, { color: 'white' }]}>🔧 FORZAR TOKEN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: '#795548', marginTop: 5 }]} 
            onPress={async () => {
              console.log('🧪 TEST LOGIN DIRECTO:');
              try {
                // Obtener credenciales del usuario actual
                const user = await AsyncStorage.getItem('user');
                const userData = user ? JSON.parse(user) : null;
                console.log('🧪 Usuario actual:', userData);
                
                // Hacer login directo para obtener token real
                const loginResponse = await apiService.login({
                  email: 'admin@repuestospro.com',
                  password: 'Test123!'
                });
                console.log('🧪 Login directo exitoso:', loginResponse.success);
                console.log('🧪 Token del login directo:', loginResponse.data?.token);
                
                if (loginResponse.data?.token) {
                  await AsyncStorage.setItem('authToken', loginResponse.data.token);
                  console.log('🧪 Token real guardado en AsyncStorage');
                  await apiService.refreshToken();
                  console.log('🧪 apiService notificado del token real');
                }
              } catch (error) {
                console.log('🧪 Error en login directo:', error);
              }
            }}
          >
            <Text style={[styles.editButtonText, { color: 'white' }]}>🔑 LOGIN DIRECTO</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: '#607D8B', marginTop: 5 }]} 
            onPress={async () => {
              console.log('🧪 TEST USUARIOS ALTERNATIVOS:');
              try {
                // Probar con diferentes usuarios que no estén bloqueados
                const users = [
                  { email: 'admin@repuestospro.com', password: 'Test123!' },
                  { email: 'cliente@repuestospro.com', password: 'cliente123' },
                  { email: 'vendedor@repuestospro.com', password: 'vendedor123' },
                  { email: 'delivery@repuestospro.com', password: 'delivery123' },
                  { email: 'tienda@repuestospro.com', password: 'tienda123' }
                ];
                
                for (const user of users) {
                  try {
                    console.log(`🧪 Probando usuario: ${user.email}`);
                    const loginResponse = await apiService.login(user);
                    if (loginResponse.success && loginResponse.data?.token) {
                      console.log('✅ Usuario válido encontrado!');
                      console.log('✅ Token obtenido:', loginResponse.data.token);
                      await AsyncStorage.setItem('authToken', loginResponse.data.token);
                      await apiService.refreshToken();
                      console.log('✅ Token guardado y apiService notificado');
                      break;
                    }
                  } catch (error) {
                    console.log(`❌ Falló con usuario: ${user.email} - ${error.message}`);
                  }
                }
              } catch (error) {
                console.log('🧪 Error probando usuarios:', error);
              }
            }}
          >
            <Text style={[styles.editButtonText, { color: 'white' }]}>👥 PROBAR USUARIOS</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Gestión del Sistema
          </Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleUsersPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Gestión de Usuarios
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleProductsPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="cube-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Gestión de Productos
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
            onPress={handleAnalyticsPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="analytics-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                Analíticas y Reportes
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
                Configuración del Sistema
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error + '10', borderColor: colors.error }]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={[styles.logoutButtonText, { color: colors.error }]}>
                Cerrar Sesión
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.error} />
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default AdminProfileScreen;
