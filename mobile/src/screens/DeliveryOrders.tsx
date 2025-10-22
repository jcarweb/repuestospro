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
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  UserIcon
} from 'react-native-heroicons/outline';
import { getBaseURL } from '../config/api';

const { width } = Dimensions.get('window');

interface DeliveryOrder {
  _id: string;
  orderId: string;
  customerId: string;
  storeId: string;
  pickupInfo: {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeCoordinates: {
      lat: number;
      lng: number;
    };
    contactPerson: string;
  };
  deliveryInfo: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCoordinates: {
      lat: number;
      lng: number;
    };
    deliveryInstructions?: string;
    estimatedDeliveryTime: string;
  };
  orderDetails: {
    totalValue: number;
    itemCount: number;
    items: Array<{
      name: string;
      quantity: number;
      value: number;
    }>;
  };
  paymentInfo: {
    deliveryFee: number;
    bonusAmount: number;
    totalPayment: number;
  };
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  performance: {
    distance: number;
    estimatedTime: number;
    actualTime?: number;
    rating?: number;
    feedback?: string;
    onTime: boolean;
  };
  metadata: {
    weatherCondition: string;
    peakHours: boolean;
    zone: string;
    priority: string;
  };
  createdAt: string;
}

const DeliveryOrders: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const baseURL = await getBaseURL();
      
      const params = new URLSearchParams({
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      });

      const response = await fetch(`${baseURL}/delivery/orders/delivery/delivery123?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const baseURL = await getBaseURL();
      
      let endpoint = '';
      switch (newStatus) {
        case 'picked_up':
          endpoint = `${baseURL}/delivery/orders/${orderId}/pickup`;
          break;
        case 'in_transit':
          endpoint = `${baseURL}/delivery/orders/${orderId}/transit`;
          break;
        case 'delivered':
          endpoint = `${baseURL}/delivery/orders/${orderId}/complete`;
          break;
        case 'cancelled':
          endpoint = `${baseURL}/delivery/orders/${orderId}/cancel`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryId: 'delivery123',
          ...(newStatus === 'in_transit' && {
            currentLocation: {
              lat: 10.4806,
              lng: -66.9036
            }
          }),
          ...(newStatus === 'delivered' && {
            rating: 5,
            feedback: 'Excelente servicio'
          })
        })
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Estado del pedido actualizado');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
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
      case 'assigned': return '#3B82F6';
      case 'picked_up': return '#F59E0B';
      case 'in_transit': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'failed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Asignado';
      case 'picked_up': return 'Recogido';
      case 'in_transit': return 'En Tránsito';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return TruckIcon;
      case 'picked_up': return CheckCircleIcon;
      case 'in_transit': return ClockIcon;
      case 'delivered': return CheckCircleIcon;
      case 'cancelled': return XCircleIcon;
      case 'failed': return ExclamationTriangleIcon;
      default: return TruckIcon;
    }
  };

  const getActionButton = (order: DeliveryOrder) => {
    switch (order.status) {
      case 'assigned':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => updateOrderStatus(order.orderId, 'picked_up')}
          >
            <Text style={styles.actionButtonText}>Marcar Recogido</Text>
          </TouchableOpacity>
        );
      case 'picked_up':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => updateOrderStatus(order.orderId, 'in_transit')}
          >
            <Text style={styles.actionButtonText}>En Tránsito</Text>
          </TouchableOpacity>
        );
      case 'in_transit':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => updateOrderStatus(order.orderId, 'delivered')}
          >
            <Text style={styles.actionButtonText}>Entregar</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const statusFilters = [
    { key: 'all', label: 'Todos' },
    { key: 'assigned', label: 'Asignados' },
    { key: 'picked_up', label: 'Recogidos' },
    { key: 'in_transit', label: 'En Tránsito' },
    { key: 'delivered', label: 'Entregados' },
    { key: 'cancelled', label: 'Cancelados' }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} pedido{orders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filtros de Estado */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedStatus === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(filter.key)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Pedidos */}
      <ScrollView 
        style={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <TruckIcon size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No hay pedidos</Text>
            <Text style={styles.emptyStateText}>
              {selectedStatus === 'all' 
                ? 'No tienes pedidos asignados'
                : `No hay pedidos con estado "${getStatusText(selectedStatus)}"`
              }
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <View key={order._id} style={styles.orderCard}>
                {/* Header del Pedido */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Pedido #{order.orderId}</Text>
                    <View style={styles.statusContainer}>
                      <StatusIcon size={16} color={getStatusColor(order.status)} />
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) }
                      ]}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderValue}>
                    {formatCurrency(order.orderDetails.totalValue)}
                  </Text>
                </View>

                {/* Información del Pedido */}
                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <MapPinIcon size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {order.pickupInfo.storeName} → {order.deliveryInfo.customerName}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <ClockIcon size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      Tiempo estimado: {order.performance.estimatedTime} min
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <TruckIcon size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      Distancia: {order.performance.distance.toFixed(1)} km
                    </Text>
                  </View>
                </View>

                {/* Información de Pago */}
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Tarifa de entrega:</Text>
                    <Text style={styles.paymentValue}>
                      {formatCurrency(order.paymentInfo.deliveryFee)}
                    </Text>
                  </View>
                  {order.paymentInfo.bonusAmount > 0 && (
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Bono:</Text>
                      <Text style={[styles.paymentValue, { color: '#10B981' }]}>
                        +{formatCurrency(order.paymentInfo.bonusAmount)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.paymentRow, styles.paymentTotal]}>
                    <Text style={styles.paymentTotalLabel}>Total:</Text>
                    <Text style={styles.paymentTotalValue}>
                      {formatCurrency(order.paymentInfo.totalPayment)}
                    </Text>
                  </View>
                </View>

                {/* Información de Contacto */}
                <View style={styles.contactInfo}>
                  <View style={styles.contactRow}>
                    <UserIcon size={16} color="#6B7280" />
                    <Text style={styles.contactText}>
                      Cliente: {order.deliveryInfo.customerName}
                    </Text>
                  </View>
                  <View style={styles.contactRow}>
                    <PhoneIcon size={16} color="#6B7280" />
                    <Text style={styles.contactText}>
                      {order.deliveryInfo.customerPhone}
                    </Text>
                  </View>
                </View>

                {/* Instrucciones de Entrega */}
                {order.deliveryInfo.deliveryInstructions && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsLabel}>Instrucciones:</Text>
                    <Text style={styles.instructionsText}>
                      {order.deliveryInfo.deliveryInstructions}
                    </Text>
                  </View>
                )}

                {/* Botón de Acción */}
                {getActionButton(order) && (
                  <View style={styles.actionContainer}>
                    {getActionButton(order)}
                  </View>
                )}

                {/* Fecha de Creación */}
                <Text style={styles.orderDate}>
                  Creado: {formatDate(order.createdAt)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  ordersList: {
    flex: 1,
    padding: 16,
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  paymentInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  paymentTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400E',
  },
  actionContainer: {
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default DeliveryOrders;
