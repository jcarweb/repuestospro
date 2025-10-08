import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { productService } from '../../services/productService';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Array<{ _id: string; count: number }>;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
    byCategory: Array<{ _id: string; count: number; avgPrice: number }>;
  };
  stores: {
    total: number;
    active: number;
    byCity: Array<{ _id: string; count: number }>;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    pendingDeliveries: number;
    recent: Array<any>;
  };
  revenue: {
    total: number;
    monthly: number;
  };
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminProducts: undefined;
  AdminStores: undefined;
  AdminOrders: undefined;
  AdminReports: undefined;
  AdminSettings: undefined;
  AdminDelivery: undefined;
  AdminSearchConfig: undefined;
  StorePhotoCapture: undefined;
  StorePhotosList: undefined;
  OrderDetails: { orderId: string };
};

type AdminDashboardNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const AdminDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
    loadUserImage();
  }, []);

  // Recargar imagen cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadUserImage();
    }
  }, [user]);

  const loadUserImage = async () => {
    try {
      console.log('🔍 AdminDashboard - Cargando imagen del usuario:', user);
      console.log('🔍 AdminDashboard - user.profileImage:', user?.profileImage);
      console.log('🔍 AdminDashboard - user.avatar:', user?.avatar);
      
      if (user?.profileImage) {
        console.log('✅ AdminDashboard - Usando profileImage:', user.profileImage);
        setUserImage(user.profileImage);
      } else if (user?.avatar) {
        console.log('✅ AdminDashboard - Usando avatar:', user.avatar);
        // Si es una ruta relativa, construir la URL completa
        if (!user.avatar.startsWith('http')) {
          const { getBaseURL } = await import('../../config/api');
          const baseUrl = await getBaseURL();
          const fullImageUrl = `${baseUrl.replace('/api', '')}${user.avatar}`;
          setUserImage(fullImageUrl);
        } else {
          setUserImage(user.avatar);
        }
      } else {
        console.log('⚠️ AdminDashboard - No hay imagen de perfil disponible');
        setUserImage(null);
      }
    } catch (error) {
      console.error('❌ AdminDashboard - Error loading user image:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas reales desde el backend
      const statsResponse = await productService.getDashboardStats();
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
        console.log('✅ Estadísticas del dashboard cargadas:', statsResponse.data);
      } else {
        console.warn('⚠️ No se pudieron cargar las estadísticas del dashboard');
        showToast('No se pudieron cargar las estadísticas', 'warning');
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      showToast('Error al cargar estadísticas del dashboard', 'error');
      
      // Fallback a datos mock en caso de error
      const mockStats: DashboardStats = {
        users: { total: 0, active: 0, newThisMonth: 0, byRole: [] },
        products: { total: 0, active: 0, lowStock: 0, outOfStock: 0, byCategory: [] },
        stores: { total: 0, active: 0, byCity: [] },
        orders: { total: 0, pending: 0, completed: 0, pendingDeliveries: 0, recent: [] },
        revenue: { total: 0, monthly: 0 }
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (icon: string, title: string, value: string, color: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
      </View>
    </View>
  );

  const renderMenuCard = (icon: string, title: string, subtitle: string, onPress: () => void) => (
    <TouchableOpacity
      style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.primary }]}>
        <Ionicons name={icon as any} size={24} color="#000000" />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando dashboard...
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          No se pudieron cargar las estadísticas
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colors.textPrimary === '#000000' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.surface}
        translucent={false}
      />
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Panel de Administración
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Bienvenido al centro de control de PiezasYA
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AdminProfile')}
            >
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Estadísticas Generales
          </Text>
          
          <View style={styles.statsGrid}>
            {renderStatCard(
              'people-outline',
              'Usuarios',
              stats.users.total.toLocaleString(),
              colors.info
            )}
            {renderStatCard(
              'cube-outline',
              'Productos',
              stats.products.total.toLocaleString(),
              colors.success
            )}
            {renderStatCard(
              'receipt-outline',
              'Pedidos',
              stats.orders.total.toLocaleString(),
              colors.warning
            )}
            {renderStatCard(
              'cash-outline',
              'Ingresos',
              `$${stats.revenue.total.toLocaleString()}`,
              colors.primary
            )}
            {renderStatCard(
              'business-outline',
              'Tiendas Activas',
              stats.stores.active.toString(),
              colors.info
            )}
            {renderStatCard(
              'car-outline',
              'Entregas Pendientes',
              stats.orders.pendingDeliveries.toString(),
              colors.error
            )}
          </View>
        </View>

        {/* Sistema de Enriquecimiento de Datos - Solo para Admin */}
        {user?.role === 'admin' && (
        <View style={styles.enrichmentSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            🔍 Sistema de Enriquecimiento de Datos
          </Text>
          
          <View style={styles.enrichmentGrid}>
            <TouchableOpacity
              style={[styles.enrichmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('StorePhotoCapture');
              }}
            >
              <View style={[styles.enrichmentIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <View style={styles.enrichmentContent}>
                <Text style={[styles.enrichmentTitle, { color: colors.textPrimary }]}>
                  Capturar Fotos
                </Text>
                <Text style={[styles.enrichmentSubtitle, { color: colors.textSecondary }]}>
                  Tomar fotos de locales con GPS
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.enrichmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('StorePhotosList');
              }}
            >
              <View style={[styles.enrichmentIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="list" size={24} color="white" />
              </View>
              <View style={styles.enrichmentContent}>
                <Text style={[styles.enrichmentTitle, { color: colors.textPrimary }]}>
                  Ver Fotos
                </Text>
                <Text style={[styles.enrichmentSubtitle, { color: colors.textSecondary }]}>
                  Gestionar fotos y resultados
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.enrichmentFeatures}>
            <Text style={[styles.featuresTitle, { color: colors.textPrimary }]}>
              Funcionalidades Automáticas:
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="eye" size={16} color="#8B5CF6" />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  OCR con Tesseract.js
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="search" size={16} color="#8B5CF6" />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Búsqueda en MercadoLibre
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="globe" size={16} color="#8B5CF6" />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Consultas a DuckDuckGo
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="logo-instagram" size={16} color="#8B5CF6" />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Análisis de Instagram
                </Text>
              </View>
            </View>
          </View>
        </View>
        )}

        {/* Menú de funciones */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Funciones Principales
          </Text>
          
          {renderMenuCard(
            'people-outline',
            'Gestión de Usuarios',
            'Administrar usuarios, roles y permisos',
            () => {
              navigation.navigate('AdminUsers');
            }
          )}
          
          {renderMenuCard(
            'cube-outline',
            'Gestión de Productos',
            'Administrar catálogo de productos',
            () => {
              navigation.navigate('AdminProducts');
            }
          )}
          
          {renderMenuCard(
            'business-outline',
            'Gestión de Tiendas',
            'Administrar tiendas y sucursales',
            () => {
              navigation.navigate('AdminStores');
            }
          )}
          
          {renderMenuCard(
            'receipt-outline',
            'Gestión de Pedidos',
            'Ver y administrar pedidos',
            () => {
              navigation.navigate('AdminOrders');
            }
          )}
          
          {renderMenuCard(
            'car-outline',
            'Gestión de Delivery',
            'Administrar sistema de entregas',
            () => {
              navigation.navigate('AdminDelivery');
            }
          )}
          
          {renderMenuCard(
            'analytics-outline',
            'Reportes y Analytics',
            'Ver estadísticas y reportes',
            () => {
              navigation.navigate('AdminReports');
            }
          )}
          
          {renderMenuCard(
            'settings-outline',
            'Configuración Global',
            'Configurar parámetros del sistema',
            () => {
              navigation.navigate('AdminSettings');
            }
          )}
          
          {renderMenuCard(
            'search-outline',
            'Configuración de Búsqueda',
            'Configurar búsqueda y filtros',
            () => {
              navigation.navigate('AdminSearchConfig');
            }
          )}
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Acciones Rápidas
          </Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AdminProducts');
              }}
            >
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Nuevo Producto
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AdminStores');
              }}
            >
              <Ionicons name="business-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Nueva Tienda
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AdminUsers');
              }}
            >
              <Ionicons name="people-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Usuarios
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AdminOrders');
              }}
            >
              <Ionicons name="receipt-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Pedidos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AdminDelivery');
              }}
            >
              <Ionicons name="car-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Delivery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AdminReports');
              }}
            >
              <Ionicons name="analytics-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Ver Reportes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AdminSettings');
              }}
            >
              <Ionicons name="settings-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Configuración
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.error + '10', borderColor: colors.error }]}
              onPress={() => {
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
              }}
            >
              <Ionicons name="log-out-outline" size={32} color={colors.error} />
              <Text style={[styles.quickActionText, { color: colors.error }]}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  // Estilos para la sección de enriquecimiento
  enrichmentSection: {
    marginBottom: 24,
  },
  enrichmentGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  enrichmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  enrichmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  enrichmentContent: {
    flex: 1,
  },
  enrichmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  enrichmentSubtitle: {
    fontSize: 14,
  },
  enrichmentFeatures: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 6,
  },
});

export default AdminDashboardScreen;
