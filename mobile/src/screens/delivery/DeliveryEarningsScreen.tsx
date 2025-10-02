import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { deliveryService } from '../../services/deliveryService';

interface EarningsData {
  totalEarnings: number;
  baseEarnings: number;
  tips: number;
  bonuses: number;
  deductions: number;
  netEarnings: number;
  totalDeliveries: number;
  averagePerDelivery: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  type: 'weekly' | 'bonus' | 'tip' | 'adjustment';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  method: 'bank_transfer' | 'cash' | 'digital_wallet';
  reference?: string;
}

interface Commission {
  orderId: string;
  orderNumber: string;
  date: string;
  baseAmount: number;
  tipAmount: number;
  bonusAmount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
}

const DeliveryEarningsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    baseEarnings: 0,
    tips: 0,
    bonuses: 0,
    deductions: 0,
    netEarnings: 0,
    totalDeliveries: 0,
    averagePerDelivery: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = Dimensions.get('window');

  const getDateFromPeriod = (period: string): string => {
    const today = new Date();
    switch (period) {
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString().split('T')[0];
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString().split('T')[0];
      case 'year':
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return yearAgo.toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  };

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      const response = await deliveryService.getDeliveryEarnings({ 
        dateFrom: getDateFromPeriod(selectedPeriod),
        dateTo: new Date().toISOString().split('T')[0]
      });
      
      if (response.success && response.data) {
        setEarnings(response.data.earnings || {});
        setPayments(response.data.payments || []);
        setCommissions(response.data.commissions || []);
        console.log('✅ Datos de ganancias del delivery cargados:', response.data);
      } else {
        console.warn('⚠️ No se pudieron cargar los datos de ganancias, usando datos por defecto');
        setEarnings({
          totalEarnings: 0,
          baseEarnings: 0,
          tips: 0,
          bonuses: 0,
          deductions: 0,
          netEarnings: 0,
          totalDeliveries: 0,
          averagePerDelivery: 0,
          thisWeek: 0,
          lastWeek: 0,
          thisMonth: 0,
          lastMonth: 0,
        });
        setPayments([]);
        setCommissions([]);
      }
    } catch (error) {
      console.error('Error loading earnings data:', error);
      showToast('Error al cargar datos de ganancias', 'error');
      
      // Datos por defecto en caso de error
      setEarnings({
        totalEarnings: 0,
        baseEarnings: 0,
        tips: 0,
        bonuses: 0,
        deductions: 0,
        netEarnings: 0,
        totalDeliveries: 0,
        averagePerDelivery: 0,
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
      });
      setPayments([]);
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const exportEarnings = () => {
    Alert.alert(
      'Exportar Ganancias',
      '¿En qué formato deseas exportar tus ganancias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PDF', onPress: () => showToast('Exportación PDF próximamente', 'info') },
        { text: 'Excel', onPress: () => showToast('Exportación Excel próximamente', 'info') },
        { text: 'CSV', onPress: () => showToast('Exportación CSV próximamente', 'info') },
      ]
    );
  };

  const requestPayment = () => {
    Alert.alert(
      'Solicitar Pago',
      '¿Deseas solicitar un pago anticipado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Solicitar', onPress: () => {
          showToast('Solicitud de pago enviada', 'success');
        }}
      ]
    );
  };

  useEffect(() => {
    loadEarningsData();
  }, [selectedPeriod]);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtitle,
    trend 
  }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        {trend && (
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
            size={16} 
            color={trend === 'up' ? '#34C759' : trend === 'down' ? '#FF3B30' : colors.textSecondary} 
          />
        )}
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      )}
    </View>
  );

  const PeriodButton = ({ period, label }: { period: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        { 
          backgroundColor: selectedPeriod === period ? colors.primary : colors.surface,
          borderColor: colors.border
        }
      ]}
      onPress={() => setSelectedPeriod(period as any)}
    >
      <Text style={[
        styles.periodButtonText,
        { color: selectedPeriod === period ? 'white' : colors.textPrimary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <View style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentDate, { color: colors.textPrimary }]}>
            {new Date(payment.date).toLocaleDateString('es-VE', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
          <View style={[styles.paymentTypeBadge, { backgroundColor: getPaymentTypeColor(payment.type) + '20' }]}>
            <Text style={[styles.paymentTypeText, { color: getPaymentTypeColor(payment.type) }]}>
              {getPaymentTypeText(payment.type)}
            </Text>
          </View>
        </View>
        <Text style={[styles.paymentAmount, { color: colors.primary }]}>
          ${payment.amount.toFixed(2)}
        </Text>
      </View>
      
      <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
        {payment.description}
      </Text>
      
      <View style={styles.paymentFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
            {getStatusText(payment.status)}
          </Text>
        </View>
        {payment.reference && (
          <Text style={[styles.paymentReference, { color: colors.textTertiary }]}>
            Ref: {payment.reference}
          </Text>
        )}
      </View>
    </View>
  );

  const CommissionCard = ({ commission }: { commission: Commission }) => (
    <View style={[styles.commissionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.commissionHeader}>
        <Text style={[styles.commissionOrder, { color: colors.textPrimary }]}>
          {commission.orderNumber}
        </Text>
        <Text style={[styles.commissionAmount, { color: colors.primary }]}>
          ${commission.totalAmount.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.commissionDetails}>
        <View style={styles.commissionDetail}>
          <Text style={[styles.commissionLabel, { color: colors.textSecondary }]}>
            Base:
          </Text>
          <Text style={[styles.commissionValue, { color: colors.textPrimary }]}>
            ${commission.baseAmount.toFixed(2)}
          </Text>
        </View>
        {commission.tipAmount > 0 && (
          <View style={styles.commissionDetail}>
            <Text style={[styles.commissionLabel, { color: colors.textSecondary }]}>
              Propina:
            </Text>
            <Text style={[styles.commissionValue, { color: '#34C759' }]}>
              ${commission.tipAmount.toFixed(2)}
            </Text>
          </View>
        )}
        {commission.bonusAmount > 0 && (
          <View style={styles.commissionDetail}>
            <Text style={[styles.commissionLabel, { color: colors.textSecondary }]}>
              Bono:
            </Text>
            <Text style={[styles.commissionValue, { color: '#FFD60A' }]}>
              ${commission.bonusAmount.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.commissionFooter}>
        <Text style={[styles.commissionDate, { color: colors.textTertiary }]}>
          {new Date(commission.date).toLocaleDateString('es-VE')}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(commission.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(commission.status) }]}>
            {getStatusText(commission.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return '#007AFF';
      case 'bonus': return '#FFD60A';
      case 'tip': return '#34C759';
      case 'adjustment': return '#FF9500';
      default: return colors.textSecondary;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'weekly': return 'Semanal';
      case 'bonus': return 'Bono';
      case 'tip': return 'Propina';
      case 'adjustment': return 'Ajuste';
      default: return 'Otro';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'pending': return '#FF9500';
      case 'failed': return '#FF3B30';
      case 'paid': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'paid': return 'Pagado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando ganancias...
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Ganancias y Comisiones
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.primary }]}
              onPress={exportEarnings}
            >
              <Ionicons name="download" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.success, borderColor: colors.border }]}
              onPress={requestPayment}
            >
              <Ionicons name="cash" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodButtons}>
          <PeriodButton period="week" label="Esta Semana" />
          <PeriodButton period="month" label="Este Mes" />
          <PeriodButton period="year" label="Este Año" />
        </ScrollView>
      </View>

      {/* Main Earnings Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Resumen de Ganancias
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Ganancias Totales"
            value={`$${earnings.totalEarnings.toFixed(2)}`}
            icon="cash"
            color="#34C759"
            trend="up"
          />
          <StatCard
            title="Ganancias Netas"
            value={`$${earnings.netEarnings.toFixed(2)}`}
            icon="trending-up"
            color="#34C759"
            trend="up"
          />
          <StatCard
            title="Total Entregas"
            value={earnings.totalDeliveries}
            icon="receipt"
            color="#007AFF"
            trend="up"
          />
          <StatCard
            title="Promedio por Entrega"
            value={`$${earnings.averagePerDelivery.toFixed(2)}`}
            icon="calculator"
            color="#FF9500"
            trend="up"
          />
        </View>
      </View>

      {/* Earnings Breakdown */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Desglose de Ganancias
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Ganancias Base"
            value={`$${earnings.baseEarnings.toFixed(2)}`}
            icon="card"
            color="#007AFF"
            subtitle={`${((earnings.baseEarnings / earnings.totalEarnings) * 100).toFixed(1)}%`}
          />
          <StatCard
            title="Propinas"
            value={`$${earnings.tips.toFixed(2)}`}
            icon="heart"
            color="#34C759"
            subtitle={`${((earnings.tips / earnings.totalEarnings) * 100).toFixed(1)}%`}
          />
          <StatCard
            title="Bonos"
            value={`$${earnings.bonuses.toFixed(2)}`}
            icon="gift"
            color="#FFD60A"
            subtitle={`${((earnings.bonuses / earnings.totalEarnings) * 100).toFixed(1)}%`}
          />
          <StatCard
            title="Deducciones"
            value={`$${earnings.deductions.toFixed(2)}`}
            icon="remove-circle"
            color="#FF3B30"
            subtitle={earnings.deductions > 0 ? `${((earnings.deductions / earnings.totalEarnings) * 100).toFixed(1)}%` : '0%'}
          />
        </View>
      </View>

      {/* Period Comparison */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Comparación de Períodos
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Esta Semana"
            value={`$${earnings.thisWeek.toFixed(2)}`}
            icon="calendar"
            color="#34C759"
            trend={earnings.thisWeek > earnings.lastWeek ? 'up' : 'down'}
            subtitle={`vs $${earnings.lastWeek.toFixed(2)}`}
          />
          <StatCard
            title="Este Mes"
            value={`$${earnings.thisMonth.toFixed(2)}`}
            icon="calendar"
            color="#007AFF"
            trend={earnings.thisMonth > earnings.lastMonth ? 'up' : 'down'}
            subtitle={`vs $${earnings.lastMonth.toFixed(2)}`}
          />
        </View>
      </View>

      {/* Recent Payments */}
      <View style={styles.paymentsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Pagos Recientes
        </Text>
        <FlatList
          data={payments.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PaymentCard payment={item} />}
          scrollEnabled={false}
          contentContainerStyle={styles.paymentsList}
        />
      </View>

      {/* Recent Commissions */}
      <View style={styles.commissionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Comisiones Recientes
        </Text>
        <FlatList
          data={commissions.slice(0, 5)}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => <CommissionCard commission={item} />}
          scrollEnabled={false}
          contentContainerStyle={styles.commissionsList}
        />
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
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  periodSelector: {
    padding: 16,
    borderBottomWidth: 1,
  },
  periodButtons: {
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
  },
  paymentsSection: {
    padding: 16,
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  paymentTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentDescription: {
    fontSize: 13,
    marginBottom: 12,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentReference: {
    fontSize: 11,
  },
  commissionsSection: {
    padding: 16,
  },
  commissionsList: {
    gap: 12,
  },
  commissionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commissionOrder: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commissionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commissionDetails: {
    marginBottom: 12,
  },
  commissionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commissionLabel: {
    fontSize: 13,
  },
  commissionValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  commissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commissionDate: {
    fontSize: 12,
  },
});

export default DeliveryEarningsScreen;
