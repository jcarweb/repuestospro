import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';

interface DeliveryStats {
  assignedOrders: number;
  completedToday: number;
  averageRating: number;
  totalEarnings: number;
  currentStatus: 'available' | 'unavailable' | 'busy' | 'on_route' | 'returning_to_store';
  autoStatusMode: boolean;
  workHours: string;
  deliveryZone: {
    center: [number, number];
    radius: number;
  };
}

const DeliveryDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [stats, setStats] = useState<DeliveryStats>({
    assignedOrders: 0,
    completedToday: 0,
    averageRating: 0,
    totalEarnings: 0,
    currentStatus: 'unavailable',
    autoStatusMode: true,
    workHours: '8:00 - 17:00',
    deliveryZone: {
      center: [-66.98422315655894, 10.462530926442378],
      radius: 10,
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeliveryStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDeliveryStats();
      
      if (response.success) {
        const data = response.data;
        setStats({
          assignedOrders: data.totalDeliveries || 0,
          completedToday: data.completedDeliveries || 0,
          averageRating: data.averageRating || 0,
          totalEarnings: data.totalEarnings || 0,
          currentStatus: user?.deliveryStatus || 'unavailable',
          autoStatusMode: user?.autoStatusMode || false,
          workHours: user?.workSchedule ? `${user.workSchedule.startTime} - ${user.workSchedule.endTime}` : '8:00 - 17:00',
          deliveryZone: user?.deliveryZone || {
            center: [-66.98422315655894, 10.462530926442378],
            radius: 10,
          },
        });
      } else {
        throw new Error(response.message || 'Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error loading delivery stats:', error);
      showToast('Error al cargar estadísticas de delivery', 'error');
      
      // Fallback a datos mock en caso de error
      setStats({
        assignedOrders: 5,
        completedToday: 12,
        averageRating: 4.9,
        totalEarnings: 850,
        currentStatus: 'available',
        autoStatusMode: true,
        workHours: '8:00 - 17:00',
        deliveryZone: {
          center: [-66.98422315655894, 10.462530926442378],
          radius: 10,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeliveryStats();
    setRefreshing(false);
  };

  const toggleStatus = async () => {
    try {
      const newStatus = stats.currentStatus === 'available' ? 'unavailable' : 'available';
      const response = await apiService.updateDeliveryStatus({ deliveryStatus: newStatus });
      
      if (response.success) {
        setStats(prev => ({ ...prev, currentStatus: newStatus }));
        showToast(`Estado cambiado a: ${newStatus === 'available' ? 'Disponible' : 'No Disponible'}`, 'success');
      } else {
        throw new Error(response.message || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error al cambiar estado', 'error');
    }
  };

  const toggleAutoStatus = async () => {
    try {
      const response = await apiService.updateDeliverySettings({ 
        performance: { autoStatusMode: !stats.autoStatusMode } 
      });
      
      if (response.success) {
        setStats(prev => ({ ...prev, autoStatusMode: !prev.autoStatusMode }));
        showToast(`Modo automático: ${!stats.autoStatusMode ? 'Activado' : 'Desactivado'}`, 'success');
      } else {
        throw new Error(response.message || 'Error al actualizar modo automático');
      }
    } catch (error) {
      console.error('Error updating auto status:', error);
      showToast('Error al cambiar modo automático', 'error');
    }
  };

  useEffect(() => {
    loadDeliveryStats();
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
    onPress,
    badge 
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    badge?: number;
  }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.quickActionHeader}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        {badge && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={[styles.badgeText, { color: 'white' }]}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>{title}</Text>
    </TouchableOpacity>
  );

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Ver Órdenes Asignadas':
        navigation.navigate('DeliveryOrders' as never);
        break;
      case 'Ver Completadas':
        navigation.navigate('DeliveryOrders' as never);
        break;
      case 'Ver Calificaciones':
        navigation.navigate('DeliveryRatings' as never);
        break;
      case 'Ver Ganancias':
        navigation.navigate('DeliveryEarnings' as never);
        break;
      case 'Mapa de Rutas':
        navigation.navigate('DeliveryMap' as never);
        break;
      case 'Reportes':
        navigation.navigate('DeliveryReport' as never);
        break;
      case 'Horario de Trabajo':
        navigation.navigate('DeliverySchedule' as never);
        break;
      default:
        showToast(`Acción: ${action}`, 'info');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#34C759';
      case 'unavailable': return '#FF3B30';
      case 'busy': return '#FF9500';
      case 'on_route': return '#007AFF';
      case 'returning_to_store': return '#5856D6';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'unavailable': return 'No Disponible';
      case 'busy': return 'Ocupado';
      case 'on_route': return 'En Ruta';
      case 'returning_to_store': return 'Regresando';
      default: return 'Desconocido';
    }
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
              {user?.name || 'Repartidor'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: '#34C759' + '20' }]}>
              <Ionicons name="car" size={16} color="#34C759" />
              <Text style={[styles.roleText, { color: '#34C759' }]}>
                Delivery
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: '#34C759' }]}
            onPress={() => navigation.navigate('DeliveryProfile')}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Control */}
      <View style={[styles.statusSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statusHeader}>
          <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
            Estado de Disponibilidad
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(stats.currentStatus) + '20' }]}>
            <Ionicons 
              name={stats.currentStatus === 'available' ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={getStatusColor(stats.currentStatus)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(stats.currentStatus) }]}>
              {getStatusText(stats.currentStatus)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusControls}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { 
                backgroundColor: stats.currentStatus === 'available' ? '#34C759' : colors.border,
                borderColor: getStatusColor(stats.currentStatus)
              }
            ]}
            onPress={toggleStatus}
          >
            <Ionicons 
              name={stats.currentStatus === 'available' ? 'checkmark' : 'close'} 
              size={20} 
              color={stats.currentStatus === 'available' ? 'white' : colors.textSecondary} 
            />
            <Text style={[
              styles.statusButtonText,
              { color: stats.currentStatus === 'available' ? 'white' : colors.textSecondary }
            ]}>
              {stats.currentStatus === 'available' ? 'Disponible' : 'No Disponible'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.autoStatusControl}>
            <Text style={[styles.autoStatusLabel, { color: colors.textSecondary }]}>
              Modo Automático
            </Text>
            <Switch
              value={stats.autoStatusMode}
              onValueChange={toggleAutoStatus}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={stats.autoStatusMode ? colors.primary : colors.textTertiary}
            />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Órdenes Asignadas"
          value={stats.assignedOrders}
          icon="list"
          color="#007AFF"
          onPress={() => handleQuickAction('Ver Órdenes Asignadas')}
        />
        <StatCard
          title="Completadas Hoy"
          value={stats.completedToday}
          icon="checkmark-circle"
          color="#34C759"
          onPress={() => handleQuickAction('Ver Completadas')}
        />
        <StatCard
          title="Calificación"
          value={`${stats.averageRating}/5`}
          icon="star"
          color="#FFD60A"
          onPress={() => handleQuickAction('Ver Calificaciones')}
        />
        <StatCard
          title="Ganancias Totales"
          value={`$${stats.totalEarnings}`}
          icon="cash"
          color="#34C759"
          onPress={() => handleQuickAction('Ver Ganancias')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Acciones Rápidas
        </Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Órdenes Asignadas"
            icon="list"
            onPress={() => handleQuickAction('Órdenes Asignadas')}
            badge={stats.assignedOrders}
          />
          <QuickAction
            title="Mapa de Rutas"
            icon="map"
            onPress={() => handleQuickAction('Mapa de Rutas')}
          />
          <QuickAction
            title="Reportes"
            icon="document-text"
            onPress={() => handleQuickAction('Reportes')}
          />
          <QuickAction
            title="Calificaciones"
            icon="star"
            onPress={() => handleQuickAction('Calificaciones')}
          />
          <QuickAction
            title="Horario de Trabajo"
            icon="calendar"
            onPress={() => handleQuickAction('Horario de Trabajo')}
          />
          <QuickAction
            title="Perfil"
            icon="person"
            onPress={() => navigation.navigate('DeliveryProfile')}
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

      {/* Work Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información de Trabajo
        </Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Horario de Trabajo:
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {stats.workHours}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Zona de Entrega:
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {stats.deliveryZone.radius} km
            </Text>
          </View>
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
  statusSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusControls: {
    gap: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  autoStatusControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoStatusLabel: {
    fontSize: 14,
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
  quickActionHeader: {
    position: 'relative',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeliveryDashboardScreen;