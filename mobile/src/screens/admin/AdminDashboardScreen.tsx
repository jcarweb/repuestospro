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
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeStores: number;
  pendingDeliveries: number;
}

const AdminDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // Aquí cargarías las estadísticas desde el backend
      // Por ahora usamos datos de ejemplo
      const mockStats: DashboardStats = {
        totalUsers: 1250,
        totalProducts: 850,
        totalOrders: 320,
        totalRevenue: 45678.90,
        activeStores: 12,
        pendingDeliveries: 45,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Panel de Administración
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Bienvenido al centro de control de PiezasYA
          </Text>
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
              stats.totalUsers.toLocaleString(),
              colors.info
            )}
            {renderStatCard(
              'cube-outline',
              'Productos',
              stats.totalProducts.toLocaleString(),
              colors.success
            )}
            {renderStatCard(
              'receipt-outline',
              'Pedidos',
              stats.totalOrders.toLocaleString(),
              colors.warning
            )}
            {renderStatCard(
              'cash-outline',
              'Ingresos',
              `$${stats.totalRevenue.toLocaleString()}`,
              colors.primary
            )}
            {renderStatCard(
              'business-outline',
              'Tiendas Activas',
              stats.activeStores.toString(),
              colors.info
            )}
            {renderStatCard(
              'car-outline',
              'Entregas Pendientes',
              stats.pendingDeliveries.toString(),
              colors.error
            )}
          </View>
        </View>

        {/* Sistema de Enriquecimiento de Datos - Nueva Sección */}
        <View style={styles.enrichmentSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            🔍 Sistema de Enriquecimiento de Datos
          </Text>
          
          <View style={styles.enrichmentGrid}>
            <TouchableOpacity
              style={[styles.enrichmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('StorePhotoCapture' as never);
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
                navigation.navigate('StorePhotosList' as never);
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
              navigation.navigate('AdminUsers' as never);
            }
          )}
          
          {renderMenuCard(
            'cube-outline',
            'Gestión de Productos',
            'Administrar catálogo de productos',
            () => {
              // Navegar a gestión de productos
              // navigation.navigate('ProductManagement');
            }
          )}
          
          {renderMenuCard(
            'business-outline',
            'Gestión de Tiendas',
            'Administrar tiendas y sucursales',
            () => {
              // Navegar a gestión de tiendas
              // navigation.navigate('StoreManagement');
            }
          )}
          
          {renderMenuCard(
            'receipt-outline',
            'Gestión de Pedidos',
            'Ver y administrar pedidos',
            () => {
              // Navegar a gestión de pedidos
              // navigation.navigate('OrderManagement');
            }
          )}
          
          {renderMenuCard(
            'car-outline',
            'Gestión de Delivery',
            'Administrar sistema de entregas',
            () => {
              // Navegar a gestión de delivery
              // navigation.navigate('DeliveryManagement');
            }
          )}
          
          {renderMenuCard(
            'analytics-outline',
            'Reportes y Analytics',
            'Ver estadísticas y reportes',
            () => {
              // Navegar a reportes
              // navigation.navigate('Reports');
            }
          )}
          
          {renderMenuCard(
            'settings-outline',
            'Configuración Global',
            'Configurar parámetros del sistema',
            () => {
              // Navegar a configuración
              // navigation.navigate('GlobalSettings');
            }
          )}
          
          {renderMenuCard(
            'search-outline',
            'Configuración de Búsqueda',
            'Configurar búsqueda y filtros',
            () => {
              // Navegar a configuración de búsqueda
              // navigation.navigate('SearchConfig');
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
                // Crear nuevo producto
                // navigation.navigate('CreateProduct');
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
                // Crear nueva tienda
                // navigation.navigate('CreateStore');
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
                // Ver reportes
                // navigation.navigate('Reports');
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
                // Configuración
                // navigation.navigate('GlobalSettings');
              }}
            >
              <Ionicons name="settings-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Configuración
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
