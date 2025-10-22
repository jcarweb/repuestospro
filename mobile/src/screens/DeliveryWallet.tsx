import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Modal
} from 'react-native';
import { 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon
} from 'react-native-heroicons/outline';
import { getBaseURL } from '../config/api';

const { width } = Dimensions.get('window');

interface WalletStats {
  currentBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  totalEarnings: number;
  totalWithdrawals: number;
  totalBonuses: number;
  averageEarning: number;
  totalDeliveries: number;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  metadata?: {
    deliveryFee?: number;
    bonusAmount?: number;
    bonusType?: string;
    distance?: number;
    deliveryTime?: number;
    rating?: number;
    zone?: string;
    peakHours?: boolean;
    weatherCondition?: string;
    orderValue?: number;
  };
}

const DeliveryWallet: React.FC = () => {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const baseURL = await getBaseURL();
      
      // Obtener estadísticas de la wallet
      const statsResponse = await fetch(`${baseURL}/delivery/wallet/delivery123/stats`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Obtener transacciones
      await fetchTransactions(1, true);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (page: number = 1, reset: boolean = false) => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/delivery/wallet/delivery123/transactions?page=${page}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        if (reset) {
          setTransactions(data.data.transactions);
        } else {
          setTransactions(prev => [...prev, ...data.data.transactions]);
        }
        setHasMore(data.data.pagination.current < data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const loadMoreTransactions = async () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchTransactions(nextPage, false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    if (stats && amount > stats.currentBalance) {
      Alert.alert('Error', 'No tienes suficientes fondos');
      return;
    }

    if (amount < 20) {
      Alert.alert('Error', 'El monto mínimo para retiro es $20');
      return;
    }

    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/delivery/wallet/delivery123/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethod: withdrawMethod,
          bankAccount: withdrawMethod === 'bank' ? {
            accountNumber: '1234567890',
            bankName: 'Banco de Venezuela',
            accountHolder: 'Juan Pérez'
          } : undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Solicitud de retiro procesada exitosamente');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchWalletData();
      } else {
        Alert.alert('Error', data.message || 'No se pudo procesar el retiro');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      Alert.alert('Error', 'No se pudo procesar el retiro');
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'delivery_payment': return ArrowDownIcon;
      case 'bonus': return PlusIcon;
      case 'withdrawal': return ArrowUpIcon;
      case 'refund': return ArrowDownIcon;
      case 'penalty': return MinusIcon;
      default: return CurrencyDollarIcon;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'delivery_payment': return '#10B981';
      case 'bonus': return '#8B5CF6';
      case 'withdrawal': return '#EF4444';
      case 'refund': return '#10B981';
      case 'penalty': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'pending': return ClockIcon;
      case 'failed': return XCircleIcon;
      case 'cancelled': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'cancelled': return '#6B7280';
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Wallet</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus ganancias y retiros</Text>
      </View>

      {/* Balance Principal */}
      {stats && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Actual</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(stats.currentBalance)}</Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Total Ganado</Text>
              <Text style={styles.balanceDetailValue}>{formatCurrency(stats.totalEarned)}</Text>
            </View>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Total Retirado</Text>
              <Text style={styles.balanceDetailValue}>{formatCurrency(stats.totalWithdrawn)}</Text>
            </View>
            {stats.pendingWithdrawal > 0 && (
              <View style={styles.balanceDetailItem}>
                <Text style={styles.balanceDetailLabel}>Pendiente</Text>
                <Text style={[styles.balanceDetailValue, { color: '#F59E0B' }]}>
                  {formatCurrency(stats.pendingWithdrawal)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Estadísticas del Período */}
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Estadísticas del Período</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ganancias</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.totalEarnings)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Retiros</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.totalWithdrawals)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Bonos</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.totalBonuses)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Promedio</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.averageEarning)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Botón de Retiro */}
      <View style={styles.withdrawContainer}>
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            { opacity: stats && stats.currentBalance >= 20 ? 1 : 0.5 }
          ]}
          onPress={() => setShowWithdrawModal(true)}
          disabled={!stats || stats.currentBalance < 20}
        >
          <CurrencyDollarIcon size={24} color="#FFFFFF" />
          <Text style={styles.withdrawButtonText}>Retirar Fondos</Text>
        </TouchableOpacity>
        {stats && stats.currentBalance < 20 && (
          <Text style={styles.withdrawNote}>
            Saldo mínimo para retiro: $20
          </Text>
        )}
      </View>

      {/* Lista de Transacciones */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Historial de Transacciones</Text>
        <ScrollView 
          style={styles.transactionsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScrollEndDrag={loadMoreTransactions}
        >
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <CurrencyDollarIcon size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No hay transacciones</Text>
              <Text style={styles.emptyStateText}>
                Las transacciones aparecerán aquí cuando realices entregas
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => {
              const TransactionIcon = getTransactionIcon(transaction.type);
              const StatusIcon = getStatusIcon(transaction.status);
              return (
                <View key={transaction._id} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <TransactionIcon size={24} color={getTransactionColor(transaction.type)} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                    {transaction.metadata && (
                      <View style={styles.transactionMetadata}>
                        {transaction.metadata.bonusType && (
                          <Text style={styles.metadataText}>
                            Bono: {transaction.metadata.bonusType}
                          </Text>
                        )}
                        {transaction.metadata.zone && (
                          <Text style={styles.metadataText}>
                            Zona: {transaction.metadata.zone}
                          </Text>
                        )}
                        {transaction.metadata.rating && (
                          <Text style={styles.metadataText}>
                            Rating: {transaction.metadata.rating}/5
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.transactionAmountText,
                      { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </Text>
                    <View style={styles.transactionStatus}>
                      <StatusIcon size={16} color={getStatusColor(transaction.status)} />
                      <Text style={[
                        styles.transactionStatusText,
                        { color: getStatusColor(transaction.status) }
                      ]}>
                        {transaction.status === 'completed' ? 'Completado' :
                         transaction.status === 'pending' ? 'Pendiente' :
                         transaction.status === 'failed' ? 'Fallido' :
                         transaction.status === 'cancelled' ? 'Cancelado' : transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Modal de Retiro */}
      <Modal
        visible={showWithdrawModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Retirar Fondos</Text>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Monto a retirar</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text
                  style={styles.amountText}
                  onPress={() => {
                    // Aquí se abriría un teclado numérico
                    Alert.alert('Info', 'Funcionalidad de entrada de texto pendiente');
                  }}
                >
                  {withdrawAmount || '0.00'}
                </Text>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Método de pago</Text>
              <View style={styles.methodButtons}>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    withdrawMethod === 'bank' && styles.methodButtonActive
                  ]}
                  onPress={() => setWithdrawMethod('bank')}
                >
                  <Text style={[
                    styles.methodButtonText,
                    withdrawMethod === 'bank' && styles.methodButtonTextActive
                  ]}>
                    Banco
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    withdrawMethod === 'digital' && styles.methodButtonActive
                  ]}
                  onPress={() => setWithdrawMethod('digital')}
                >
                  <Text style={[
                    styles.methodButtonText,
                    withdrawMethod === 'digital' && styles.methodButtonTextActive
                  ]}>
                    Digital
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowWithdrawModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleWithdraw}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceDetailItem: {
    alignItems: 'center',
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  withdrawContainer: {
    margin: 16,
    marginTop: 0,
    alignItems: 'center',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  withdrawNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionsContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  transactionsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metadataText: {
    fontSize: 10,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalField: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  methodButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default DeliveryWallet;
