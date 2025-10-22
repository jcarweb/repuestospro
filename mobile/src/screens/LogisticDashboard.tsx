import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface DeliveryStats {
  weeklyDeliveries: number;
  totalDeliveries: number;
  averageRating: number;
  level: 'bronze' | 'silver' | 'gold' | 'elite';
  weeklyBonus: number;
  totalEarnings: number;
  availableBalance: number;
}

interface LogisticDashboardProps {
  navigation: any;
}

const LogisticDashboard: React.FC<LogisticDashboardProps> = ({ navigation }) => {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDeliveryStats();
  }, []);

  const fetchDeliveryStats = async () => {
    try {
      setLoading(true);
      // Simular datos del delivery
      const mockStats: DeliveryStats = {
        weeklyDeliveries: 25,
        totalDeliveries: 150,
        averageRating: 4.7,
        level: 'silver',
        weeklyBonus: 36,
        totalEarnings: 1250,
        availableBalance: 180
      };
      
      setStats(mockStats);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryStats();
    setRefreshing(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'elite': return '#8A2BE2';
      default: return '#6B7280';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return 'medal-outline';
      case 'silver': return 'trophy-outline';
      case 'gold': return 'star-outline';
      case 'elite': return 'diamond-outline';
      default: return 'person-outline';
    }
  };

  const getNextLevelInfo = (currentLevel: string) => {
    switch (currentLevel) {
      case 'bronze': return { next: 'silver', required: 40, progress: 25 };
      case 'silver': return { next: 'gold', required: 60, progress: 25 };
      case 'gold': return { next: 'elite', required: 80, progress: 25 };
      case 'elite': return { next: 'elite', required: 80, progress: 100 };
      default: return { next: 'silver', required: 40, progress: 0 };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los datos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeliveryStats}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nextLevelInfo = getNextLevelInfo(stats.level);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con saldo */}
      <LinearGradient
        colors={[getLevelColor(stats.level), getLevelColor(stats.level) + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo Disponible</Text>
            <Text style={styles.balanceAmount}>${stats.availableBalance}</Text>
          </View>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <Ionicons name="arrow-up" size={20} color="white" />
            <Text style={styles.withdrawButtonText}>Retirar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Nivel y progreso */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Ionicons 
            name={getLevelIcon(stats.level)} 
            size={24} 
            color={getLevelColor(stats.level)} 
          />
          <Text style={[styles.levelText, { color: getLevelColor(stats.level) }]}>
            Nivel {stats.level.toUpperCase()}
          </Text>
        </View>
        
        {stats.level !== 'elite' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {stats.weeklyDeliveries} / {nextLevelInfo.required} entregas para {nextLevelInfo.next}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((stats.weeklyDeliveries / nextLevelInfo.required) * 100, 100)}%`,
                    backgroundColor: getLevelColor(stats.level)
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Estadísticas principales */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="bicycle" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{stats.weeklyDeliveries}</Text>
          <Text style={styles.statLabel}>Entregas esta semana</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.averageRating}</Text>
          <Text style={styles.statLabel}>Rating promedio</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="gift" size={24} color="#10B981" />
          <Text style={styles.statValue}>${stats.weeklyBonus}</Text>
          <Text style={styles.statLabel}>Bono semanal</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>${stats.totalEarnings}</Text>
          <Text style={styles.statLabel}>Ganancias totales</Text>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Acciones Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <Ionicons name="list" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Mis Pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Wallet')}
          >
            <Ionicons name="wallet" size={24} color="#10B981" />
            <Text style={styles.actionButtonText}>Mi Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Bonuses')}
          >
            <Ionicons name="gift" size={24} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Bonos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={24} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notificaciones recientes */}
      <View style={styles.notificationsContainer}>
        <Text style={styles.notificationsTitle}>Notificaciones Recientes</Text>
        
        <View style={styles.notificationItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Bono semanal acreditado</Text>
            <Text style={styles.notificationText}>+$36 por 25 entregas esta semana</Text>
            <Text style={styles.notificationTime}>Hace 2 horas</Text>
          </View>
        </View>

        <View style={styles.notificationItem}>
          <Ionicons name="arrow-down" size={20} color="#3B82F6" />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Pago por entrega</Text>
            <Text style={styles.notificationText}>+$5.50 por entrega completada</Text>
            <Text style={styles.notificationTime}>Hace 4 horas</Text>
          </View>
        </View>

        <View style={styles.notificationItem}>
          <Ionicons name="trophy" size={20} color="#F59E0B" />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Nivel alcanzado</Text>
            <Text style={styles.notificationText}>¡Felicidades! Ahora eres nivel Silver</Text>
            <Text style={styles.notificationTime}>Ayer</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContainer: {
    flex: 1,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  withdrawButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '600',
  },
  levelCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsContainer: {
    margin: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  notificationsContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  notificationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default LogisticDashboard;
