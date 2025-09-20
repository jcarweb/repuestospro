import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Icon';

interface StoreStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  averageRating: number;
  totalReviews: number;
}

const StoreManagerDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreStats();
  }, []);

  const loadStoreStats = async () => {
    try {
      setLoading(true);
      // Aquí cargarías las estadísticas de la tienda desde el backend
      // Por ahora usamos datos de ejemplo
      const mockStats: StoreStats = {
        totalProducts: 150,
        lowStockProducts: 8,
        totalOrders: 45,
        pendingOrders: 12,
        totalRevenue: 12500.75,
        todayRevenue: 850.50,
        averageRating: 4.2,
        totalReviews: 28,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error cargando estadísticas de tienda:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (icon: string, title: string, value: string, subtitle?: string, color?: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color || colors.primary }]}>
        <Icon name={icon as any} size={24} color="white" />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  const renderMenuCard = (icon: string, title: string, subtitle: string, onPress: () => void) => (
    <TouchableOpacity
      style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.primary }]}>
        <Icon name={icon as any} size={24} color="#000000" />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando dashboard de tienda...
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Icon name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          No se pudieron cargar las estadísticas de la tienda
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Gestión de Tienda
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Panel de control de tu tienda
          </Text>
        </View>

        {/* Estadísticas principales */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Estadísticas de la Tienda
          </Text>
          
          <View style={styles.statsGrid}>
            {renderStatCard(
              'cube-outline',
              'Productos',
              stats.totalProducts.toString(),
              'En catálogo',
              colors.success
            )}
            {renderStatCard(
              'warning-outline',
              'Stock Bajo',
              stats.lowStockProducts.toString(),
              'Necesitan reposición',
              colors.warning
            )}
            {renderStatCard(
              'receipt-outline',
              'Pedidos',
              stats.totalOrders.toString(),
              `${stats.pendingOrders} pendientes`,
              colors.info
            )}
            {renderStatCard(
              'cash-outline',
              'Ingresos',
              `$${stats.totalRevenue.toLocaleString()}`,
              `Hoy: $${stats.todayRevenue.toFixed(2)}`,
              colors.primary
            )}
            {renderStatCard(
              'star-outline',
              'Calificación',
              stats.averageRating.toFixed(1),
              `${stats.totalReviews} reseñas`,
              colors.primary
            )}
            {renderStatCard(
              'trending-up-outline',
              'Rendimiento',
              '85%',
              'Este mes',
              colors.success
            )}
          </View>
        </View>

        {/* Alertas y notificaciones */}
        <View style={styles.alertsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Alertas y Notificaciones
          </Text>
          
          {stats.lowStockProducts > 0 && (
            <View style={[styles.alertCard, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
              <Icon name="warning-outline" size={24} color={colors.warning} />
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>
                  Productos con stock bajo
                </Text>
                <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
                  {stats.lowStockProducts} productos necesitan reposición
                </Text>
              </View>
            </View>
          )}
          
          {stats.pendingOrders > 0 && (
            <View style={[styles.alertCard, { backgroundColor: colors.info + '20', borderColor: colors.info }]}>
              <Icon name="time-outline" size={24} color={colors.info} />
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>
                  Pedidos pendientes
                </Text>
                <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
                  {stats.pendingOrders} pedidos esperan procesamiento
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Menú de funciones */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Funciones de Gestión
          </Text>
          
          {renderMenuCard(
            'cube-outline',
            'Gestión de Productos',
            'Administrar inventario y productos',
            () => {
              // Navegar a gestión de productos
              // navigation.navigate('ProductManagement');
            }
          )}
          
          {renderMenuCard(
            'receipt-outline',
            'Gestión de Pedidos',
            'Procesar y gestionar pedidos',
            () => {
              // Navegar a gestión de pedidos
              // navigation.navigate('OrderManagement');
            }
          )}
          
          {renderMenuCard(
            'analytics-outline',
            'Reportes de Ventas',
            'Ver estadísticas y reportes',
            () => {
              // Navegar a reportes
              // navigation.navigate('SalesReports');
            }
          )}
          
          {renderMenuCard(
            'chatbubble-outline',
            'Mensajes',
            'Comunicación con clientes',
            () => {
              // Navegar a mensajes
              // navigation.navigate('Messages');
            }
          )}
          
          {renderMenuCard(
            'star-outline',
            'Reseñas',
            'Gestionar reseñas de clientes',
            () => {
              // Navegar a reseñas
              // navigation.navigate('Reviews');
            }
          )}
          
          {renderMenuCard(
            'settings-outline',
            'Configuración',
            'Configurar tienda',
            () => {
              // Navegar a configuración
              // navigation.navigate('StoreSettings');
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
                // Agregar nuevo producto
                // navigation.navigate('AddProduct');
              }}
            >
              <Icon name="add-circle-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Nuevo Producto
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Ver pedidos pendientes
                // navigation.navigate('PendingOrders');
              }}
            >
              <Icon name="time-outline" size={32} color={colors.warning} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Pedidos Pendientes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Ver stock bajo
                // navigation.navigate('LowStock');
              }}
            >
              <Icon name="warning-outline" size={32} color={colors.warning} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Stock Bajo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Ver reportes
                // navigation.navigate('Reports');
              }}
            >
              <Icon name="analytics-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Ver Reportes
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
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
  },
  alertsSection: {
    marginBottom: 24,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
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
});

export default StoreManagerDashboardScreen;
