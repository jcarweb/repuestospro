import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { getBaseURL } from '../../config/api';
import { sellerService, SellerStats } from '../../services/sellerService';

const SellerDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [stats, setStats] = useState<SellerStats>({
    totalQueries: 0,
    successfulSales: 0,
    averageResponseTime: 0,
    customerRating: 0,
    unreadMessages: 0,
    pendingQuotes: 0,
    todayQueries: 0,
    monthlySales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSellerStats = async () => {
    try {
      setLoading(true);
      
      const response = await sellerService.getSellerStats();
      
      if (response.success && response.data) {
        setStats(response.data);
        console.log('✅ Estadísticas del vendedor cargadas:', response.data);
      } else {
        console.warn('⚠️ No se pudieron cargar las estadísticas, usando datos por defecto');
        // Datos por defecto en caso de error
        setStats({
          totalQueries: 0,
          successfulSales: 0,
          averageResponseTime: 0,
          customerRating: 0,
          unreadMessages: 0,
          pendingQuotes: 0,
          todayQueries: 0,
          monthlySales: 0,
        });
      }
    } catch (error) {
      console.error('Error loading seller stats:', error);
      showToast('Error al cargar estadísticas del vendedor', 'error');
      
      // Datos por defecto en caso de error
      setStats({
        totalQueries: 0,
        successfulSales: 0,
        averageResponseTime: 0,
        customerRating: 0,
        unreadMessages: 0,
        pendingQuotes: 0,
        todayQueries: 0,
        monthlySales: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSellerStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSellerStats();
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
      case 'Consulta de Precios':
        navigation.navigate('Quotations');
        break;
      case 'Chat con Clientes':
        showToast('Chat con clientes próximamente', 'info');
        break;
      case 'Gestión de Cotizaciones':
        navigation.navigate('Quotations');
        break;
      case 'Catálogo de Productos':
        showToast('Catálogo de productos próximamente', 'info');
        break;
      case 'Gestión de Clientes':
        showToast('Gestión de clientes próximamente', 'info');
        break;
      case 'Rendimiento':
        showToast('Rendimiento próximamente', 'info');
        break;
      case 'Ver Consultas':
        navigation.navigate('Quotations');
        break;
      case 'Ver Ventas':
        navigation.navigate('Quotations');
        break;
      case 'Ver Tiempo Respuesta':
        showToast('Tiempo de respuesta próximamente', 'info');
        break;
      case 'Ver Calificaciones':
        showToast('Calificaciones próximamente', 'info');
        break;
      case 'Ver Mensajes':
        showToast('Mensajes próximamente', 'info');
        break;
      case 'Ver Cotizaciones':
        navigation.navigate('Quotations');
        break;
      default:
        showToast(`Acción: ${action}`, 'info');
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
              {user?.name || 'Vendedor'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: '#FF9500' + '20' }]}>
              <Ionicons name="people" size={16} color="#FF9500" />
              <Text style={[styles.roleText, { color: '#FF9500' }]}>
                Vendedor
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: '#FF9500' }]}
            onPress={() => navigation.navigate('SellerProfile')}
          >
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${getBaseURL()}${user.avatar}` }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Consultas Totales"
          value={stats.totalQueries}
          icon="search"
          color="#FF9500"
          onPress={() => handleQuickAction('Ver Consultas')}
        />
        <StatCard
          title="Ventas Exitosas"
          value={stats.successfulSales}
          icon="checkmark-circle"
          color="#34C759"
          onPress={() => handleQuickAction('Ver Ventas')}
        />
        <StatCard
          title="Tiempo Respuesta"
          value={`${stats.averageResponseTime}m`}
          icon="time"
          color="#007AFF"
          onPress={() => handleQuickAction('Ver Tiempo Respuesta')}
        />
        <StatCard
          title="Calificación"
          value={`${stats.customerRating}/5`}
          icon="star"
          color="#FFD60A"
          onPress={() => handleQuickAction('Ver Calificaciones')}
        />
        <StatCard
          title="Mensajes Sin Leer"
          value={stats.unreadMessages}
          icon="mail"
          color="#FF3B30"
          onPress={() => handleQuickAction('Ver Mensajes')}
        />
        <StatCard
          title="Cotizaciones Pendientes"
          value={stats.pendingQuotes}
          icon="document-text"
          color="#5856D6"
          onPress={() => handleQuickAction('Ver Cotizaciones')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Acciones Rápidas
        </Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Consulta de Precios"
            icon="dollar-sign"
            onPress={() => handleQuickAction('Consulta de Precios')}
          />
          <QuickAction
            title="Chat con Clientes"
            icon="chatbubbles"
            onPress={() => handleQuickAction('Chat con Clientes')}
            badge={stats.unreadMessages}
          />
          <QuickAction
            title="Gestión de Cotizaciones"
            icon="document-text"
            onPress={() => handleQuickAction('Gestión de Cotizaciones')}
            badge={stats.pendingQuotes}
          />
          <QuickAction
            title="Catálogo de Productos"
            icon="cube"
            onPress={() => handleQuickAction('Catálogo de Productos')}
          />
          <QuickAction
            title="Gestión de Clientes"
            icon="people"
            onPress={() => handleQuickAction('Gestión de Clientes')}
          />
          <QuickAction
            title="Rendimiento"
            icon="bar-chart"
            onPress={() => handleQuickAction('Rendimiento')}
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

      {/* Today's Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Resumen del Día
        </Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {stats.todayQueries}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Consultas Hoy
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                ${stats.monthlySales.toLocaleString()}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Ventas del Mes
              </Text>
            </View>
          </View>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    overflow: 'hidden',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
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

export default SellerDashboardScreen;
