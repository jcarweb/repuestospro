import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface ReportData {
  sales: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueByPeriod: Array<{
      period: string;
      revenue: number;
      orders: number;
    }>;
    revenueByStore: Array<{
      storeName: string;
      revenue: number;
      orders: number;
    }>;
  };
  users: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    usersByRole: Array<{
      role: string;
      count: number;
    }>;
    usersByPeriod: Array<{
      period: string;
      count: number;
    }>;
  };
  products: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    topSellingProducts: Array<{
      productName: string;
      sales: number;
      revenue: number;
    }>;
    productsByCategory: Array<{
      category: string;
      count: number;
      revenue: number;
    }>;
  };
  stores: {
    totalStores: number;
    activeStores: number;
    topPerformingStores: Array<{
      storeName: string;
      revenue: number;
      orders: number;
    }>;
    storesByCity: Array<{
      city: string;
      count: number;
    }>;
  };
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminReports: undefined;
  SalesReport: undefined;
  UsersReport: undefined;
  ProductsReport: undefined;
  StoresReport: undefined;
};

type AdminReportsNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminReports'>;

const { width } = Dimensions.get('window');

const AdminReportsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AdminReportsNavigationProp>();
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    if (token) {
      loadReportData();
    }
  }, [token, selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/reports?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE').format(num);
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días',
      '1y': 'Último año'
    };
    return labels[period as keyof typeof labels] || period;
  };

  const renderStatCard = (icon: string, title: string, value: string, subtitle: string, color: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon name={icon as any} size={24} color="white" />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
        <Text style={[styles.statTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );

  const renderChartCard = (title: string, children: React.ReactNode) => (
    <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderBarChart = (data: Array<{ label: string; value: number; color?: string }>, maxValue: number) => (
    <View style={styles.barChart}>
      {data.map((item, index) => (
        <View key={index} style={styles.barItem}>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: (item.value / maxValue) * 100,
                  backgroundColor: item.color || colors.primary,
                }
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.label}
          </Text>
          <Text style={[styles.barValue, { color: colors.textPrimary }]}>
            {formatNumber(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderReportCard = (icon: string, title: string, description: string, onPress: () => void) => (
    <TouchableOpacity
      style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.reportIcon, { backgroundColor: colors.primary }]}>
        <Icon name={icon as any} size={24} color="#000000" />
      </View>
      <View style={styles.reportContent}>
        <Text style={[styles.reportTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.reportDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando reportes...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colors.textPrimary === '#000000' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.surface}
        translucent={false}
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Reportes y Analytics
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Análisis completo del sistema
          </Text>
        </View>

        {/* Selector de Período */}
        <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.periodLabel, { color: colors.textPrimary }]}>
            Período:
          </Text>
          <View style={styles.periodButtons}>
            {['7d', '30d', '90d', '1y'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: selectedPeriod === period ? colors.primary : 'transparent',
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === period ? '#000000' : colors.textSecondary }
                ]}>
                  {getPeriodLabel(period)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estadísticas Generales */}
        {reportData && (
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Resumen General
            </Text>
            
            <View style={styles.statsGrid}>
              {renderStatCard(
                'trending-up-outline',
                'Ingresos Totales',
                formatCurrency(reportData.sales.totalRevenue),
                `${reportData.sales.totalOrders} órdenes`,
                '#10B981'
              )}
              {renderStatCard(
                'people-outline',
                'Usuarios Activos',
                formatNumber(reportData.users.activeUsers),
                `${reportData.users.newUsers} nuevos`,
                '#3B82F6'
              )}
              {renderStatCard(
                'cube-outline',
                'Productos Activos',
                formatNumber(reportData.products.activeProducts),
                `${reportData.products.lowStockProducts} bajo stock`,
                '#8B5CF6'
              )}
              {renderStatCard(
                'storefront-outline',
                'Tiendas Activas',
                formatNumber(reportData.stores.activeStores),
                `${reportData.stores.totalStores} total`,
                '#F59E0B'
              )}
            </View>
          </View>
        )}

        {/* Gráficos de Ventas */}
        {reportData && (
          <View style={styles.chartsSection}>
            {renderChartCard(
              'Ventas por Período',
              renderBarChart(
                reportData.sales.revenueByPeriod.map(item => ({
                  label: item.period,
                  value: item.revenue,
                  color: '#10B981'
                })),
                Math.max(...reportData.sales.revenueByPeriod.map(item => item.revenue))
              )
            )}

            {renderChartCard(
              'Ventas por Tienda',
              renderBarChart(
                reportData.sales.revenueByStore.map(item => ({
                  label: item.storeName,
                  value: item.revenue,
                  color: '#3B82F6'
                })),
                Math.max(...reportData.sales.revenueByStore.map(item => item.revenue))
              )
            )}

            {renderChartCard(
              'Usuarios por Rol',
              renderBarChart(
                reportData.users.usersByRole.map(item => ({
                  label: item.role,
                  value: item.count,
                  color: '#8B5CF6'
                })),
                Math.max(...reportData.users.usersByRole.map(item => item.count))
              )
            )}
          </View>
        )}

        {/* Reportes Detallados */}
        <View style={styles.reportsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Reportes Detallados
          </Text>
          
          <View style={styles.reportsList}>
            {renderReportCard(
              'trending-up-outline',
              'Reporte de Ventas',
              'Análisis detallado de ventas y ingresos',
              () => navigation.navigate('SalesReport')
            )}
            
            {renderReportCard(
              'people-outline',
              'Reporte de Usuarios',
              'Estadísticas de usuarios y crecimiento',
              () => navigation.navigate('UsersReport')
            )}
            
            {renderReportCard(
              'cube-outline',
              'Reporte de Productos',
              'Análisis de productos y inventario',
              () => navigation.navigate('ProductsReport')
            )}
            
            {renderReportCard(
              'storefront-outline',
              'Reporte de Tiendas',
              'Rendimiento de tiendas y ubicaciones',
              () => navigation.navigate('StoresReport')
            )}
          </View>
        </View>

        {/* Productos Más Vendidos */}
        {reportData && reportData.products.topSellingProducts.length > 0 && (
          <View style={styles.topProductsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Productos Más Vendidos
            </Text>
            
            <View style={[styles.topProductsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {reportData.products.topSellingProducts.slice(0, 5).map((product, index) => (
                <View key={index} style={styles.topProductItem}>
                  <View style={styles.topProductRank}>
                    <Text style={[styles.topProductRankText, { color: colors.textSecondary }]}>
                      #{index + 1}
                    </Text>
                  </View>
                  <View style={styles.topProductInfo}>
                    <Text style={[styles.topProductName, { color: colors.textPrimary }]}>
                      {product.productName}
                    </Text>
                    <Text style={[styles.topProductStats, { color: colors.textSecondary }]}>
                      {formatNumber(product.sales)} ventas • {formatCurrency(product.revenue)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  periodSelector: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
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
    width: (width - 44) / 2,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
  },
  chartsSection: {
    marginBottom: 24,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barContainer: {
    height: 80,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  reportsSection: {
    marginBottom: 24,
  },
  reportsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
  },
  topProductsSection: {
    marginBottom: 24,
  },
  topProductsCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topProductRank: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  topProductRankText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  topProductStats: {
    fontSize: 12,
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
});

export default AdminReportsScreen;
