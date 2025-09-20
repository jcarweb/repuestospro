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
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  store: {
    _id: string;
    name: string;
    city: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    total: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: {
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  notes?: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  ordersByStore: Array<{
    storeName: string;
    count: number;
    revenue: number;
  }>;
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminProducts: undefined;
  AdminStores: undefined;
  AdminOrders: undefined;
  OrderDetails: { orderId: string };
};

type AdminOrdersNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminOrders'>;

const AdminOrdersScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AdminOrdersNavigationProp>();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (token) {
      loadOrders();
      loadStats();
    }
  }, [token, currentPage, searchTerm, statusFilter, storeFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(storeFilter !== 'all' && { storeId: storeFilter })
      });

      const response = await fetch(`http://localhost:5000/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders || data.data);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalOrders(data.data.pagination?.total || data.data.length || 0);
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/orders/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadOrders(), loadStats()]);
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Estado de la orden actualizado');
        loadOrders();
        loadStats();
      } else {
        Alert.alert('Error', data.message || 'Error actualizando la orden');
      }
    } catch (error) {
      console.error('Error actualizando orden:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      preparing: '#8B5CF6',
      ready: '#10B981',
      delivered: '#059669',
      cancelled: '#EF4444'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      preparing: 'Preparando',
      ready: 'Lista',
      delivered: 'Entregada',
      cancelled: 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: '#F59E0B',
      paid: '#10B981',
      failed: '#EF4444',
      refunded: '#6B7280'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      paid: 'Pagado',
      failed: 'Fallido',
      refunded: 'Reembolsado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderStatCard = (icon: string, title: string, value: string, color: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon name={icon as any} size={20} color="white" />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
      </View>
    </View>
  );

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order._id}
      style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('OrderDetails', { orderId: order._id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>
            #{order.orderNumber}
          </Text>
          <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <View style={styles.orderStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.customerInfo}>
          <Icon name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.customerName, { color: colors.textPrimary }]}>
            {order.customer.name}
          </Text>
        </View>
        
        <View style={styles.storeInfo}>
          <Icon name="storefront-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.storeName, { color: colors.textSecondary }]}>
            {order.store.name} - {order.store.city}
          </Text>
        </View>

        <View style={styles.deliveryInfo}>
          <Icon 
            name={order.deliveryType === 'delivery' ? 'car-outline' : 'location-outline'} 
            size={16} 
            color={colors.textSecondary} 
          />
          <Text style={[styles.deliveryText, { color: colors.textSecondary }]}>
            {order.deliveryType === 'delivery' ? 'Delivery' : 'Recoger en tienda'}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.paymentInfo}>
          <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(order.paymentStatus) + '20' }]}>
            <Text style={[styles.paymentText, { color: getPaymentStatusColor(order.paymentStatus) }]}>
              {getPaymentStatusLabel(order.paymentStatus)}
            </Text>
          </View>
        </View>
        
        <View style={styles.totalInfo}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Total:
          </Text>
          <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
            {formatCurrency(order.total)}
          </Text>
        </View>
      </View>

      <View style={styles.orderActions}>
        {order.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => updateOrderStatus(order._id, 'confirmed')}
          >
            <Icon name="checkmark" size={16} color="white" />
            <Text style={styles.actionButtonText}>Confirmar</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => updateOrderStatus(order._id, 'preparing')}
          >
            <Icon name="construct-outline" size={16} color="white" />
            <Text style={styles.actionButtonText}>Preparar</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'preparing' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => updateOrderStatus(order._id, 'ready')}
          >
            <Icon name="checkmark-circle" size={16} color="white" />
            <Text style={styles.actionButtonText}>Lista</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'ready' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#059669' }]}
            onPress={() => updateOrderStatus(order._id, 'delivered')}
          >
            <Icon name="checkmark-done" size={16} color="white" />
            <Text style={styles.actionButtonText}>Entregada</Text>
          </TouchableOpacity>
        )}
        
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
            onPress={() => updateOrderStatus(order._id, 'cancelled')}
          >
            <Icon name="close" size={16} color="white" />
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando órdenes...
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
            Gestión de Órdenes
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Administra todas las órdenes del sistema
          </Text>
        </View>

        {/* Estadísticas */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Estadísticas de Órdenes
            </Text>
            
            <View style={styles.statsGrid}>
              {renderStatCard(
                'receipt-outline',
                'Total Órdenes',
                stats.totalOrders.toString(),
                colors.info
              )}
              {renderStatCard(
                'time-outline',
                'Pendientes',
                stats.pendingOrders.toString(),
                '#F59E0B'
              )}
              {renderStatCard(
                'checkmark-circle-outline',
                'Entregadas',
                stats.deliveredOrders.toString(),
                '#10B981'
              )}
              {renderStatCard(
                'cash-outline',
                'Ingresos',
                formatCurrency(stats.totalRevenue),
                colors.primary
              )}
            </View>
          </View>
        )}

        {/* Filtros */}
        <View style={[styles.filtersSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Filtros
          </Text>
          
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
                Estado:
              </Text>
              <View style={[styles.filterButtons, { backgroundColor: colors.background }]}>
                {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      { 
                        backgroundColor: statusFilter === status ? colors.primary : 'transparent',
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      { 
                        color: statusFilter === status ? '#000000' : colors.textSecondary 
                      }
                    ]}>
                      {status === 'all' ? 'Todos' : getStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Lista de órdenes */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Órdenes ({totalOrders})
            </Text>
          </View>
          
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay órdenes disponibles
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map(renderOrderCard)}
            </View>
          )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
  },
  filtersSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterItem: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ordersSection: {
    marginBottom: 24,
  },
  ordersHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ordersList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  orderStatus: {
    marginLeft: 12,
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
  orderDetails: {
    marginBottom: 12,
    gap: 6,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeName: {
    fontSize: 14,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryText: {
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
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

export default AdminOrdersScreen;
