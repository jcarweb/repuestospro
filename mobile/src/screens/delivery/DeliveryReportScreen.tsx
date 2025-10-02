import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { deliveryService } from '../../services/deliveryService';

interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  totalEarnings: number;
  averageRating: number;
  totalDistance: number;
  fuelCost: number;
  netEarnings: number;
}

interface DailyReport {
  date: string;
  deliveries: number;
  completed: number;
  failed: number;
  earnings: number;
  distance: number;
  rating: number;
}

interface WeeklyReport {
  week: string;
  totalDeliveries: number;
  completedDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  totalDistance: number;
}

const DeliveryReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    failedDeliveries: 0,
    averageDeliveryTime: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalDistance: 0,
    fuelCost: 0,
    netEarnings: 0,
  });
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = Dimensions.get('window');

  const getDateFromPeriod = (period: string): string => {
    const today = new Date();
    switch (period) {
      case 'today':
        return today.toISOString().split('T')[0];
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

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const response = await deliveryService.getDeliveryReports({ 
        dateFrom: getDateFromPeriod(selectedPeriod),
        dateTo: new Date().toISOString().split('T')[0]
      });
      
      if (response.success && response.data) {
        setStats(response.data.stats || {});
        setDailyReports(response.data.daily || []);
        setWeeklyReports(response.data.weekly || []);
        console.log('✅ Reportes del delivery cargados:', response.data);
      } else {
        console.warn('⚠️ No se pudieron cargar los reportes, usando datos por defecto');
        // Datos por defecto en caso de error
        setStats({
          totalDeliveries: 0,
          completedDeliveries: 0,
          failedDeliveries: 0,
          averageDeliveryTime: 0,
          totalEarnings: 0,
          averageRating: 0,
          totalDistance: 0,
          fuelCost: 0,
          netEarnings: 0,
        });
        setDailyReports([]);
        setWeeklyReports([]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      showToast('Error al cargar reportes', 'error');
      
      // Datos por defecto en caso de error
      setStats({
        totalDeliveries: 0,
        completedDeliveries: 0,
        failedDeliveries: 0,
        averageDeliveryTime: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalDistance: 0,
        fuelCost: 0,
        netEarnings: 0,
      });
      setDailyReports([]);
      setWeeklyReports([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const exportReport = () => {
    Alert.alert(
      'Exportar Reporte',
      '¿En qué formato deseas exportar el reporte?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PDF', onPress: () => showToast('Exportación PDF próximamente', 'info') },
        { text: 'Excel', onPress: () => showToast('Exportación Excel próximamente', 'info') },
        { text: 'CSV', onPress: () => showToast('Exportación CSV próximamente', 'info') },
      ]
    );
  };

  const shareReport = () => {
    Alert.alert(
      'Compartir Reporte',
      '¿Deseas compartir este reporte?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Compartir', onPress: () => showToast('Compartir reporte próximamente', 'info') },
      ]
    );
  };

  useEffect(() => {
    loadReports();
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

  const DailyReportCard = ({ report }: { report: DailyReport }) => (
    <View style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reportHeader}>
        <Text style={[styles.reportDate, { color: colors.textPrimary }]}>
          {new Date(report.date).toLocaleDateString('es-VE', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        <View style={[styles.ratingBadge, { backgroundColor: '#FFD60A' + '20' }]}>
          <Ionicons name="star" size={14} color="#FFD60A" />
          <Text style={[styles.ratingText, { color: '#FFD60A' }]}>
            {report.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.reportStats}>
        <View style={styles.reportStat}>
          <Text style={[styles.reportStatValue, { color: colors.textPrimary }]}>
            {report.deliveries}
          </Text>
          <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
            Entregas
          </Text>
        </View>
        <View style={styles.reportStat}>
          <Text style={[styles.reportStatValue, { color: '#34C759' }]}>
            {report.completed}
          </Text>
          <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
            Completadas
          </Text>
        </View>
        <View style={styles.reportStat}>
          <Text style={[styles.reportStatValue, { color: colors.primary }]}>
            ${report.earnings.toFixed(2)}
          </Text>
          <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
            Ganancias
          </Text>
        </View>
        <View style={styles.reportStat}>
          <Text style={[styles.reportStatValue, { color: colors.textSecondary }]}>
            {report.distance.toFixed(1)}km
          </Text>
          <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
            Distancia
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando reportes...
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
            Reportes de Delivery
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.primary }]}
              onPress={exportReport}
            >
              <Ionicons name="download" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={shareReport}
            >
              <Ionicons name="share" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodButtons}>
          <PeriodButton period="today" label="Hoy" />
          <PeriodButton period="week" label="Esta Semana" />
          <PeriodButton period="month" label="Este Mes" />
          <PeriodButton period="year" label="Este Año" />
        </ScrollView>
      </View>

      {/* Main Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Resumen General
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Entregas"
            value={stats.totalDeliveries}
            icon="receipt"
            color="#007AFF"
            trend="up"
          />
          <StatCard
            title="Completadas"
            value={stats.completedDeliveries}
            icon="checkmark-circle"
            color="#34C759"
            subtitle={`${((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1)}%`}
            trend="up"
          />
          <StatCard
            title="Tiempo Promedio"
            value={`${stats.averageDeliveryTime} min`}
            icon="time"
            color="#FF9500"
            trend="down"
          />
          <StatCard
            title="Calificación"
            value={`${stats.averageRating}/5`}
            icon="star"
            color="#FFD60A"
            trend="up"
          />
        </View>
      </View>

      {/* Earnings Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Ganancias y Costos
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Ganancias Totales"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon="cash"
            color="#34C759"
            trend="up"
          />
          <StatCard
            title="Costo Combustible"
            value={`$${stats.fuelCost.toFixed(2)}`}
            icon="car"
            color="#FF9500"
            trend="neutral"
          />
          <StatCard
            title="Ganancias Netas"
            value={`$${stats.netEarnings.toFixed(2)}`}
            icon="trending-up"
            color="#34C759"
            trend="up"
          />
          <StatCard
            title="Distancia Total"
            value={`${stats.totalDistance.toFixed(1)} km`}
            icon="location"
            color="#007AFF"
            trend="neutral"
          />
        </View>
      </View>

      {/* Daily Reports */}
      <View style={styles.reportsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Reporte Diario
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dailyReports}>
          {dailyReports.map((report, index) => (
            <DailyReportCard key={index} report={report} />
          ))}
        </ScrollView>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Métricas de Rendimiento
        </Text>
        <View style={[styles.metricsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metricRow}>
            <View style={styles.metricInfo}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Tasa de Éxito
              </Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: '#34C759',
                    width: `${(stats.completedDeliveries / stats.totalDeliveries) * 100}%`
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metricInfo}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Ganancias por Entrega
              </Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                ${(stats.totalEarnings / stats.totalDeliveries).toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metricInfo}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Distancia Promedio
              </Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {(stats.totalDistance / stats.totalDeliveries).toFixed(1)} km
              </Text>
            </View>
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
  reportsSection: {
    padding: 16,
  },
  dailyReports: {
    gap: 12,
  },
  reportCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  reportStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportStat: {
    width: '45%',
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reportStatLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  metricsSection: {
    padding: 16,
  },
  metricsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricRow: {
    marginBottom: 16,
  },
  metricInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default DeliveryReportScreen;
