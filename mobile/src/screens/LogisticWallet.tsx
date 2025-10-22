import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'payment' | 'bonus' | 'withdrawal' | 'adjustment';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletStats {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  weeklyEarnings: number;
  level: 'bronze' | 'silver' | 'gold' | 'elite';
  withdrawalLimit: number;
  nextWithdrawalDate: string;
}

interface LogisticWalletProps {
  navigation: any;
}

const LogisticWallet: React.FC<LogisticWalletProps> = ({ navigation }) => {
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // Simular datos de la wallet
      const mockStats: WalletStats = {
        availableBalance: 180,
        pendingBalance: 25,
        totalEarnings: 1250,
        weeklyEarnings: 85,
        level: 'silver',
        withdrawalLimit: 200,
        nextWithdrawalDate: '2024-01-20'
      };

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'bonus',
          amount: 36,
          description: 'Bono semanal nivel Silver',
          date: '2024-01-15',
          status: 'completed'
        },
        {
          id: '2',
          type: 'payment',
          amount: 5.50,
          description: 'Pago por entrega completada',
          date: '2024-01-15',
          status: 'completed'
        },
        {
          id: '3',
          type: 'bonus',
          amount: 15,
          description: 'Bono por rendimiento excepcional',
          date: '2024-01-14',
          status: 'completed'
        },
        {
          id: '4',
          type: 'withdrawal',
          amount: -50,
          description: 'Retiro a cuenta bancaria',
          date: '2024-01-10',
          status: 'completed'
        },
        {
          id: '5',
          type: 'payment',
          amount: 5.00,
          description: 'Pago por entrega completada',
          date: '2024-01-14',
          status: 'completed'
        },
        {
          id: '6',
          type: 'bonus',
          amount: 5,
          description: 'Bono por entrega rápida',
          date: '2024-01-13',
          status: 'completed'
        }
      ];

      setWalletStats(mockStats);
      setTransactions(mockTransactions);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos de la wallet');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    if (amount < 20) {
      Alert.alert('Error', 'El monto mínimo de retiro es $20');
      return;
    }

    if (amount > walletStats!.availableBalance) {
      Alert.alert('Error', 'No tienes suficiente saldo disponible');
      return;
    }

    if (amount > walletStats!.withdrawalLimit) {
      Alert.alert('Error', `El límite de retiro es $${walletStats!.withdrawalLimit}`);
      return;
    }

    Alert.alert(
      'Confirmar Retiro',
      `¿Estás seguro de que quieres retirar $${amount}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Aquí se procesaría el retiro
            Alert.alert('Éxito', 'Solicitud de retiro enviada correctamente');
            setWithdrawModalVisible(false);
            setWithdrawAmount('');
          }
        }
      ]
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment': return 'bicycle';
      case 'bonus': return 'gift';
      case 'withdrawal': return 'arrow-up';
      case 'adjustment': return 'settings';
      default: return 'card';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment': return '#3B82F6';
      case 'bonus': return '#10B981';
      case 'withdrawal': return '#EF4444';
      case 'adjustment': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando wallet...</Text>
      </View>
    );
  }

  if (!walletStats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los datos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWalletData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
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
      {/* Header con saldo */}
      <LinearGradient
        colors={[getLevelColor(walletStats.level), getLevelColor(walletStats.level) + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo Disponible</Text>
            <Text style={styles.balanceAmount}>${walletStats.availableBalance}</Text>
            <Text style={styles.pendingLabel}>Pendiente: ${walletStats.pendingBalance}</Text>
          </View>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <Ionicons name="arrow-up" size={20} color="white" />
            <Text style={styles.withdrawButtonText}>Retirar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Estadísticas de ganancias */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#10B981" />
          <Text style={styles.statValue}>${walletStats.weeklyEarnings}</Text>
          <Text style={styles.statLabel}>Esta semana</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="wallet" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>${walletStats.totalEarnings}</Text>
          <Text style={styles.statLabel}>Total ganado</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>${walletStats.withdrawalLimit}</Text>
          <Text style={styles.statLabel}>Límite retiro</Text>
        </View>
      </View>

      {/* Información de retiros */}
      <View style={styles.withdrawalInfo}>
        <View style={styles.withdrawalInfoHeader}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.withdrawalInfoTitle}>Información de Retiros</Text>
        </View>
        <Text style={styles.withdrawalInfoText}>
          • Monto mínimo: $20{'\n'}
          • Límite diario: ${walletStats.withdrawalLimit}{'\n'}
          • Tiempo de procesamiento: 24 horas{'\n'}
          • Próximo retiro disponible: {walletStats.nextWithdrawalDate}
        </Text>
      </View>

      {/* Lista de transacciones */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Historial de Transacciones</Text>
        
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionIconContainer}>
                <Ionicons 
                  name={getTransactionIcon(transaction.type) as any} 
                  size={20} 
                  color={getTransactionColor(transaction.type)} 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionAmountContainer}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.amount > 0 ? '+' : ''}${transaction.amount}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(transaction.status) }
                ]}>
                  <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Modal de retiro */}
      <Modal
        visible={withdrawModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar Retiro</Text>
              <TouchableOpacity
                onPress={() => setWithdrawModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Monto a retirar</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <Text style={styles.modalInfo}>
                Saldo disponible: ${walletStats.availableBalance}
              </Text>
              <Text style={styles.modalInfo}>
                Límite de retiro: ${walletStats.withdrawalLimit}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setWithdrawModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleWithdraw}
                >
                  <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  pendingLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
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
  withdrawalInfo: {
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
  withdrawalInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  withdrawalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  withdrawalInfoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  transactionsContainer: {
    margin: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingVertical: 12,
  },
  modalInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default LogisticWallet;
