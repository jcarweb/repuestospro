import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';

interface StoreStats {
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  todaySales: number;
  totalRevenue: number;
  averageRating: number;
}

const StoreManagerDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [stats, setStats] = useState<StoreStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    todaySales: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStoreStats = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint real para estadísticas de tienda
      // const response = await apiService.getStoreStats();
      // setStats(response.data);
      
      // Datos mock por ahora
      setStats({
        totalProducts: 1250,
        lowStockProducts: 23,
        pendingOrders: 8,
        todaySales: 15,
        totalRevenue: 12500,
        averageRating: 4.7,
      });
    } catch (error) {
      console.error('Error loading store stats:', error);
      showToast('Error al cargar estadísticas de la tienda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStoreStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStoreStats();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ 
    title, 
    icon, 
    onPress 
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>{title}</Text>
    </TouchableOpacity>
  );

  const handleQuickAction = (action: string) => {
    showToast(`Acción: ${action}`, 'info');
    // TODO: Implementar navegación a pantallas específicas
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
              Bienvenido de vuelta,
            </Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {user?.name || 'Gestor de Tienda'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="storefront" size={16} color={colors.primary} />
              <Text style={[styles.roleText, { color: colors.primary }]}>
                Gestor de Tienda
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('StoreManagerProfile')}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Productos"
          value={stats.totalProducts}
          icon="cube"
          color={colors.primary}
          onPress={() => handleQuickAction('Ver Productos')}
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockProducts}
          icon="warning"
          color="#FF6B6B"
          onPress={() => handleQuickAction('Ver Stock Bajo')}
        />
        <StatCard
          title="Pedidos Pendientes"
          value={stats.pendingOrders}
          icon="time"
          color="#4ECDC4"
          onPress={() => handleQuickAction('Ver Pedidos')}
        />
        <StatCard
          title="Ventas Hoy"
          value={stats.todaySales}
          icon="trending-up"
          color="#45B7D1"
          onPress={() => handleQuickAction('Ver Ventas')}
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="cash"
          color="#96CEB4"
          onPress={() => handleQuickAction('Ver Ingresos')}
        />
        <StatCard
          title="Calificación"
          value={`${stats.averageRating}/5`}
          icon="star"
          color="#FFEAA7"
          onPress={() => handleQuickAction('Ver Reseñas')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Acciones Rápidas
        </Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Gestión de Inventario"
            icon="cube"
            onPress={() => handleQuickAction('Inventario')}
          />
          <QuickAction
            title="Gestión de Productos"
            icon="package"
            onPress={() => handleQuickAction('Productos')}
          />
          <QuickAction
            title="Gestión de Vendedores"
            icon="people"
            onPress={() => handleQuickAction('Vendedores')}
          />
          <QuickAction
            title="Promociones"
            icon="pricetag"
            onPress={() => handleQuickAction('Promociones')}
          />
          <QuickAction
            title="Gestión de Ventas"
            icon="trending-up"
            onPress={() => handleQuickAction('Ventas')}
          />
          <QuickAction
            title="Gestión de Pedidos"
            icon="list"
            onPress={() => handleQuickAction('Pedidos')}
          />
          <QuickAction
            title="Gestión de Delivery"
            icon="car"
            onPress={() => handleQuickAction('Delivery')}
          />
          <QuickAction
            title="Analytics"
            icon="bar-chart"
            onPress={() => handleQuickAction('Analytics')}
          />
          <QuickAction
            title="Mensajería"
            icon="chatbubbles"
            onPress={() => handleQuickAction('Mensajería')}
          />
          <QuickAction
            title="Reseñas"
            icon="star"
            onPress={() => handleQuickAction('Reseñas')}
          />
          <QuickAction
            title="Configuración"
            icon="settings"
            onPress={() => handleQuickAction('Configuración')}
          />
          <QuickAction
            title="Cerrar Sesión"
            icon="log-out"
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
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Actividad Reciente
        </Text>
        <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.activityText, { color: colors.textSecondary }]}>
            No hay actividad reciente
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statCardContent: {
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
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default StoreManagerDashboardScreen;