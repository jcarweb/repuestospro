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

interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  todayEarnings: number;
  weeklyEarnings: number;
  averageRating: number;
  totalReviews: number;
  activeHours: number;
  totalDistance: number;
}

const DeliveryDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadDeliveryStats();
  }, []);

  const loadDeliveryStats = async () => {
    try {
      setLoading(true);
      // Aquí cargarías las estadísticas de delivery desde el backend
      // Por ahora usamos datos de ejemplo
      const mockStats: DeliveryStats = {
        totalDeliveries: 45,
        completedDeliveries: 42,
        pendingDeliveries: 3,
        todayEarnings: 125.50,
        weeklyEarnings: 850.75,
        averageRating: 4.8,
        totalReviews: 38,
        activeHours: 6.5,
        totalDistance: 45.2,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error cargando estadísticas de delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    // Aquí actualizarías el estado en el backend
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
          Cargando dashboard de delivery...
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Icon name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          No se pudieron cargar las estadísticas de delivery
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header con estado online/offline */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Panel de Delivery
            </Text>
            <TouchableOpacity
              style={[
                styles.onlineToggle,
                { backgroundColor: isOnline ? colors.success : colors.error }
              ]}
              onPress={toggleOnlineStatus}
            >
              <Icon 
                name={isOnline ? 'radio-button-on' : 'radio-button-off'} 
                size={20} 
                color="white" 
              />
              <Text style={styles.onlineText}>
                {isOnline ? 'En línea' : 'Desconectado'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isOnline ? 'Listo para recibir entregas' : 'Activa tu disponibilidad para recibir entregas'}
          </Text>
        </View>

        {/* Estadísticas principales */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Estadísticas de Hoy
          </Text>
          
          <View style={styles.statsGrid}>
            {renderStatCard(
              'car-outline',
              'Entregas',
              `${stats.completedDeliveries}/${stats.totalDeliveries}`,
              'Completadas',
              colors.success
            )}
            {renderStatCard(
              'time-outline',
              'Pendientes',
              stats.pendingDeliveries.toString(),
              'Por entregar',
              colors.warning
            )}
            {renderStatCard(
              'cash-outline',
              'Ganancias',
              `$${stats.todayEarnings.toFixed(2)}`,
              'Hoy',
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
              'time-outline',
              'Horas Activo',
              `${stats.activeHours}h`,
              'Hoy',
              colors.info
            )}
            {renderStatCard(
              'location-outline',
              'Distancia',
              `${stats.totalDistance}km`,
              'Recorrida',
              colors.info
            )}
          </View>
        </View>

        {/* Ganancias semanales */}
        <View style={styles.earningsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Ganancias Semanales
          </Text>
          
          <View style={[styles.earningsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.earningsHeader}>
              <Icon name="cash-outline" size={32} color={colors.primary} />
              <View style={styles.earningsInfo}>
                <Text style={[styles.earningsAmount, { color: colors.textPrimary }]}>
                  ${stats.weeklyEarnings.toFixed(2)}
                </Text>
                <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>
                  Esta semana
                </Text>
              </View>
            </View>
            
            <View style={styles.earningsBreakdown}>
              <View style={styles.earningsRow}>
                <Text style={[styles.earningsRowLabel, { color: colors.textSecondary }]}>
                  Entregas completadas:
                </Text>
                <Text style={[styles.earningsRowValue, { color: colors.textPrimary }]}>
                  {stats.completedDeliveries}
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={[styles.earningsRowLabel, { color: colors.textSecondary }]}>
                  Promedio por entrega:
                </Text>
                <Text style={[styles.earningsRowValue, { color: colors.textPrimary }]}>
                  ${(stats.weeklyEarnings / stats.completedDeliveries).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menú de funciones */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Funciones de Delivery
          </Text>
          
          {renderMenuCard(
            'list-outline',
            'Mis Entregas',
            'Ver entregas asignadas y completadas',
            () => {
              // Navegar a mis entregas
              // navigation.navigate('MyDeliveries');
            }
          )}
          
          {renderMenuCard(
            'map-outline',
            'Mapa de Rutas',
            'Ver rutas optimizadas',
            () => {
              // Navegar a mapa de rutas
              // navigation.navigate('RouteMap');
            }
          )}
          
          {renderMenuCard(
            'document-text-outline',
            'Reporte de Entregas',
            'Generar reportes de actividad',
            () => {
              // Navegar a reportes
              // navigation.navigate('DeliveryReports');
            }
          )}
          
          {renderMenuCard(
            'star-outline',
            'Calificaciones',
            'Ver calificaciones de clientes',
            () => {
              // Navegar a calificaciones
              // navigation.navigate('Ratings');
            }
          )}
          
          {renderMenuCard(
            'time-outline',
            'Horario de Trabajo',
            'Configurar disponibilidad',
            () => {
              // Navegar a horario
              // navigation.navigate('WorkSchedule');
            }
          )}
          
          {renderMenuCard(
            'settings-outline',
            'Configuración',
            'Configurar perfil y preferencias',
            () => {
              // Navegar a configuración
              // navigation.navigate('DeliverySettings');
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
                // Ver entregas pendientes
                // navigation.navigate('PendingDeliveries');
              }}
            >
              <Icon name="time-outline" size={32} color={colors.warning} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Entregas Pendientes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Ver mapa
                // navigation.navigate('Map');
              }}
            >
              <Icon name="map-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Ver Mapa
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Ver ganancias
                // navigation.navigate('Earnings');
              }}
            >
              <Icon name="cash-outline" size={32} color={colors.success} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Ver Ganancias
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Ver perfil
                // navigation.navigate('Profile');
              }}
            >
              <Icon name="person-outline" size={32} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>
                Mi Perfil
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  earningsSection: {
    marginBottom: 24,
  },
  earningsCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsInfo: {
    marginLeft: 16,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 14,
  },
  earningsBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsRowLabel: {
    fontSize: 14,
  },
  earningsRowValue: {
    fontSize: 14,
    fontWeight: '600',
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

export default DeliveryDashboardScreen;
