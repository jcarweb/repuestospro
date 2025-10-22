import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  TruckIcon,
  StarIcon,
  BellIcon,
  CogIcon
} from 'react-native-heroicons/outline';
import { getBaseURL } from '../config/api';

const { width } = Dimensions.get('window');

interface DeliveryStats {
  currentBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  totalDeliveries: number;
  completedDeliveries: number;
  rating: number;
  averageDeliveryTime: number;
}

interface RecentTransaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

const DeliveryDashboard: React.FC = () => {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'offline' | 'break'>('offline');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const baseURL = await getBaseURL();
      
      // Obtener estadísticas de la wallet
      const walletResponse = await fetch(`${baseURL}/delivery/wallet/delivery123/stats`);
      const walletData = await walletResponse.json();
      
      if (walletData.success) {
        setStats(walletData.data);
      }

      // Obtener transacciones recientes
      const transactionsResponse = await fetch(`${baseURL}/delivery/wallet/delivery123/transactions?limit=5`);
      const transactionsData = await transactionsResponse.json();
      
      if (transactionsData.success) {
        setRecentTransactions(transactionsData.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const toggleAvailability = async () => {
    try {
      const baseURL = await getBaseURL();
      const newStatus = availabilityStatus === 'available' ? 'offline' : 'available';
      
      const response = await fetch(`${baseURL}/delivery/delivery123/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilityStatus: newStatus,
          currentLocation: {
            lat: 10.4806, // Coordenadas de ejemplo
            lng: -66.9036
          }
        })
      });

      if (response.ok) {
        setAvailabilityStatus(newStatus);
        Alert.alert(
          'Estado actualizado',
          newStatus === 'available' ? 'Ahora estás disponible para recibir pedidos' : 'Has cambiado a modo offline'
        );
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de disponibilidad');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'busy': return '#3B82F6';
      case 'offline': return '#6B7280';
      case 'break': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Desconectado';
      case 'break': return 'Descanso';
      default: return 'Desconectado';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, Juan!</Text>
          <Text style={styles.subtitle}>Bienvenido a tu dashboard</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <BellIcon size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Estado de Disponibilidad */}
      <View style={styles.availabilityCard}>
        <View style={styles.availabilityHeader}>
          <Text style={styles.availabilityTitle}>Estado de Disponibilidad</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(availabilityStatus) }]} />
        </View>
        <Text style={styles.availabilityStatus}>
          {getStatusText(availabilityStatus)}
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: availabilityStatus === 'available' ? '#EF4444' : '#10B981' }
          ]}
          onPress={toggleAvailability}
        >
          <Text style={styles.toggleButtonText}>
            {availabilityStatus === 'available' ? 'Ir Offline' : 'Estar Disponible'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas de Wallet */}
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Mi Wallet</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo Actual</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(stats.currentBalance)}</Text>
          </div>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Ganado</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.totalEarned)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Retirado</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.totalWithdrawn)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pendiente</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.pendingWithdrawal)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Entregas</Text>
              <Text style={styles.statValue}>{stats.totalDeliveries}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Estadísticas de Rendimiento */}
      {stats && (
        <View style={styles.performanceCard}>
          <Text style={styles.cardTitle}>Mi Rendimiento</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <StarIcon size={24} color="#F59E0B" />
              <Text style={styles.performanceLabel}>Rating</Text>
              <Text style={styles.performanceValue}>{stats.rating.toFixed(1)}/5</Text>
            </View>
            <View style={styles.performanceItem}>
              <TruckIcon size={24} color="#3B82F6" />
              <Text style={styles.performanceLabel}>Entregas</Text>
              <Text style={styles.performanceValue}>{stats.completedDeliveries}</Text>
            </View>
            <View style={styles.performanceItem}>
              <ClockIcon size={24} color="#10B981" />
              <Text style={styles.performanceLabel}>Tiempo Prom.</Text>
              <Text style={styles.performanceValue}>{stats.averageDeliveryTime} min</Text>
            </View>
          </View>
        </View>
      )}

      {/* Transacciones Recientes */}
      <View style={styles.transactionsCard}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.cardTitle}>Transacciones Recientes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length === 0 ? (
          <Text style={styles.noTransactionsText}>No hay transacciones recientes</Text>
        ) : (
          recentTransactions.map((transaction) => (
            <View key={transaction._id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
              ]}>
                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <CurrencyDollarIcon size={24} color="#10B981" />
            <Text style={styles.actionText}>Retirar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MapPinIcon size={24} color="#3B82F6" />
            <Text style={styles.actionText}>Ubicación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <ClockIcon size={24} color="#F59E0B" />
            <Text style={styles.actionText}>Horarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <CogIcon size={24} color="#6B7280" />
            <Text style={styles.actionText}>Config</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  availabilityCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  availabilityStatus: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: (width - 72) / 2,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  performanceCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  transactionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  noTransactionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default DeliveryDashboard;
