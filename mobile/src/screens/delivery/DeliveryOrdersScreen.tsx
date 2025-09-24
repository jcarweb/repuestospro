import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryAddress: string;
  totalAmount: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  assignedAt: string;
  estimatedDeliveryTime: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  specialInstructions?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const DeliveryOrdersScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered'>('all');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDeliveryOrders({ 
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
        limit: 50,
        page: 1
      });
      
      if (response.success) {
        // Transformar los datos del backend al formato esperado por el frontend
        const transformedOrders: DeliveryOrder[] = response.data.map((delivery: any) => ({
          id: delivery._id,
          orderNumber: delivery.orderId?.orderNumber || 'N/A',
          customerName: delivery.customerId?.name || 'Cliente',
          customerPhone: delivery.customerId?.phone || '+58 000 000 0000',
          customerAddress: delivery.deliveryLocation?.address || 'Dirección no disponible',
          deliveryAddress: delivery.deliveryLocation?.address || 'Dirección no disponible',
          totalAmount: delivery.deliveryFee || 0,
          status: delivery.status,
          assignedAt: delivery.createdAt,
          estimatedDeliveryTime: delivery.estimatedDeliveryTime,
          items: delivery.orderId?.items || [],
          specialInstructions: delivery.deliveryLocation?.instructions,
          paymentMethod: delivery.orderId?.paymentMethod || 'cash',
          coordinates: delivery.deliveryLocation?.coordinates
        }));
        
        setOrders(transformedOrders);
      } else {
        throw new Error(response.message || 'Error al cargar órdenes');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Error al cargar órdenes', 'error');
      
      // Fallback a datos mock en caso de error
      const mockOrders: DeliveryOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'Juan Pérez',
          customerPhone: '+58 412 123 4567',
          customerAddress: 'Av. Principal, Caracas',
          deliveryAddress: 'Calle 5, Edificio Los Rosales, Apto 3B, Caracas',
          totalAmount: 125.50,
          status: 'assigned',
          assignedAt: '2024-01-15T10:30:00Z',
          estimatedDeliveryTime: '2024-01-15T12:00:00Z',
          items: [
            { name: 'Filtro de Aceite', quantity: 2, price: 25.00 },
            { name: 'Pastillas de Freno', quantity: 1, price: 75.50 }
          ],
          specialInstructions: 'Llamar antes de llegar',
          paymentMethod: 'cash',
          coordinates: {
            latitude: 10.4806,
            longitude: -66.9036
          }
        }
      ];
      
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus as any } : order
        ));
        
        const statusText = {
          'picked_up': 'Recogida',
          'in_transit': 'En Tránsito',
          'delivered': 'Entregada',
          'failed': 'Fallida'
        }[newStatus] || newStatus;
        
        showToast(`Orden marcada como: ${statusText}`, 'success');
      } else {
        throw new Error(response.message || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Error al actualizar estado', 'error');
    }
  };

  const showStatusUpdateDialog = (order: DeliveryOrder) => {
    const statusOptions = {
      'assigned': [
        { text: 'Marcar como Recogida', value: 'picked_up', icon: 'checkmark-circle' },
        { text: 'Marcar como Fallida', value: 'failed', icon: 'close-circle' }
      ],
      'picked_up': [
        { text: 'Marcar como En Tránsito', value: 'in_transit', icon: 'car' },
        { text: 'Marcar como Fallida', value: 'failed', icon: 'close-circle' }
      ],
      'in_transit': [
        { text: 'Marcar como Entregada', value: 'delivered', icon: 'checkmark-done' },
        { text: 'Marcar como Fallida', value: 'failed', icon: 'close-circle' }
      ]
    };

    const options = statusOptions[order.status] || [];
    
    if (options.length === 0) {
      showToast('Esta orden no puede cambiar de estado', 'info');
      return;
    }

    Alert.alert(
      `Actualizar Orden ${order.orderNumber}`,
      'Selecciona el nuevo estado:',
      [
        { text: 'Cancelar', style: 'cancel' },
        ...options.map(option => ({
          text: option.text,
          onPress: () => updateOrderStatus(order.id, option.value)
        }))
      ]
    );
  };

  const callCustomer = (phone: string) => {
    Alert.alert(
      'Llamar Cliente',
      `¿Deseas llamar a ${phone}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: () => {
          // TODO: Implementar llamada telefónica
          showToast('Funcionalidad de llamada próximamente', 'info');
        }}
      ]
    );
  };

  const navigateToOrder = (order: DeliveryOrder) => {
    if (order.coordinates) {
      // TODO: Implementar navegación GPS
      showToast('Navegación GPS próximamente', 'info');
    } else {
      showToast('No hay coordenadas disponibles para esta orden', 'warning');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return '#007AFF';
      case 'picked_up': return '#FF9500';
      case 'in_transit': return '#5856D6';
      case 'delivered': return '#34C759';
      case 'failed': return '#FF3B30';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Asignada';
      case 'picked_up': return 'Recogida';
      case 'in_transit': return 'En Tránsito';
      case 'delivered': return 'Entregada';
      case 'failed': return 'Fallida';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return 'time';
      case 'picked_up': return 'checkmark-circle';
      case 'in_transit': return 'car';
      case 'delivered': return 'checkmark-done';
      case 'failed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const filteredOrders = orders.filter(order => 
    selectedFilter === 'all' || order.status === selectedFilter
  );

  const OrderCard = ({ order }: { order: DeliveryOrder }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>
            {order.orderNumber}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(order.status) as any} 
              size={14} 
              color={getStatusColor(order.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
        <Text style={[styles.orderAmount, { color: colors.primary }]}>
          ${order.totalAmount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={[styles.customerName, { color: colors.textPrimary }]}>
          {order.customerName}
        </Text>
        <TouchableOpacity
          style={styles.phoneButton}
          onPress={() => callCustomer(order.customerPhone)}
        >
          <Ionicons name="call" size={16} color={colors.primary} />
          <Text style={[styles.phoneText, { color: colors.primary }]}>
            {order.customerPhone}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deliveryInfo}>
        <View style={styles.deliveryRow}>
          <Ionicons name="location" size={16} color={colors.textSecondary} />
          <Text style={[styles.deliveryAddress, { color: colors.textSecondary }]} numberOfLines={2}>
            {order.deliveryAddress}
          </Text>
        </View>
        <View style={styles.deliveryRow}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={[styles.deliveryTime, { color: colors.textSecondary }]}>
            Entrega estimada: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('es-VE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        {order.specialInstructions && (
          <View style={styles.deliveryRow}>
            <Ionicons name="information-circle" size={16} color={colors.warning} />
            <Text style={[styles.specialInstructions, { color: colors.warning }]}>
              {order.specialInstructions}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.orderItems}>
        <Text style={[styles.itemsTitle, { color: colors.textPrimary }]}>
          Productos ({order.items.length}):
        </Text>
        {order.items.map((item, index) => (
          <Text key={index} style={[styles.itemText, { color: colors.textSecondary }]}>
            • {item.name} x{item.quantity} - ${item.price.toFixed(2)}
          </Text>
        ))}
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => showStatusUpdateDialog(order)}
        >
          <Ionicons name="checkmark" size={16} color="white" />
          <Text style={styles.actionButtonText}>Actualizar Estado</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => navigateToOrder(order)}
        >
          <Ionicons name="navigate" size={16} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Navegar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FilterButton = ({ filter, label }: { filter: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { 
          backgroundColor: selectedFilter === filter ? colors.primary : colors.surface,
          borderColor: colors.border
        }
      ]}
      onPress={() => setSelectedFilter(filter as any)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: selectedFilter === filter ? 'white' : colors.textPrimary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando órdenes...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Mis Entregas
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {filteredOrders.length} órdenes {selectedFilter !== 'all' ? `(${selectedFilter})` : ''}
        </Text>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterButton filter="all" label="Todas" />
        <FilterButton filter="assigned" label="Asignadas" />
        <FilterButton filter="picked_up" label="Recogidas" />
        <FilterButton filter="in_transit" label="En Tránsito" />
        <FilterButton filter="delivered" label="Entregadas" />
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay órdenes {selectedFilter !== 'all' ? `con estado "${selectedFilter}"` : 'asignadas'}
            </Text>
          </View>
        }
      />
    </View>
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
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  filtersContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ordersList: {
    padding: 16,
    gap: 16,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 14,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  deliveryInfo: {
    marginBottom: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  deliveryTime: {
    fontSize: 14,
    marginLeft: 8,
  },
  specialInstructions: {
    fontSize: 14,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  orderItems: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    marginLeft: 8,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DeliveryOrdersScreen;
