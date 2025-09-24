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
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getBaseURL } from '../../config/api';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  total: number;
}

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
    address: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  notes?: string;
  deliveryInstructions?: string;
}

type AdminStackParamList = {
  AdminOrders: undefined;
  OrderDetails: { orderId: string };
};

type OrderDetailsRouteProp = RouteProp<AdminStackParamList, 'OrderDetails'>;
type OrderDetailsNavigationProp = StackNavigationProp<AdminStackParamList, 'OrderDetails'>;

const OrderDetailsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<OrderDetailsNavigationProp>();
  const route = useRoute<OrderDetailsRouteProp>();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && route.params.orderId) {
      loadOrderDetails();
    }
  }, [token, route.params.orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/orders/${route.params.orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        Alert.alert('Error', data.message || 'Error cargando los detalles de la orden');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error cargando detalles de la orden:', error);
      Alert.alert('Error', 'Error de conexión');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/orders/${route.params.orderId}/status`, {
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
        loadOrderDetails();
      } else {
        Alert.alert('Error', data.message || 'Error actualizando la orden');
      }
    } catch (error) {
      console.error('Error actualizando orden:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const callCustomer = () => {
    if (order?.customer.phone) {
      Linking.openURL(`tel:${order.customer.phone}`);
    }
  };

  const callStore = () => {
    if (order?.store.phone) {
      Linking.openURL(`tel:${order.store.phone}`);
    }
  };

  const openMaps = () => {
    if (order?.deliveryAddress?.coordinates) {
      const { latitude, longitude } = order.deliveryAddress.coordinates;
      const url = Platform.OS === 'ios' 
        ? `maps:0,0?q=${latitude},${longitude}`
        : `geo:0,0?q=${latitude},${longitude}`;
      Linking.openURL(url);
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

  const renderInfoCard = (title: string, children: React.ReactNode) => (
    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.infoCardTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderInfoRow = (icon: string, label: string, value: string, onPress?: () => void) => (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
          {label}:
        </Text>
      </View>
      <View style={styles.infoRowRight}>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStatusButton = (status: string, label: string, color: string, icon: string) => (
    <TouchableOpacity
      style={[styles.statusButton, { backgroundColor: color }]}
      onPress={() => updateOrderStatus(status)}
    >
      <Ionicons name={icon as any} size={20} color="white" />
      <Text style={styles.statusButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando detalles...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          No se pudo cargar la orden
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadOrderDetails}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
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
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>
                #{order.orderNumber}
              </Text>
              <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusLabel(order.status)}
              </Text>
            </View>
            <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(order.paymentStatus) + '20' }]}>
              <Text style={[styles.paymentText, { color: getPaymentStatusColor(order.paymentStatus) }]}>
                {getPaymentStatusLabel(order.paymentStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* Información del Cliente */}
        {renderInfoCard('Información del Cliente', (
          <View>
            {renderInfoRow('person-outline', 'Nombre', order.customer.name)}
            {renderInfoRow('mail-outline', 'Email', order.customer.email)}
            {renderInfoRow('call-outline', 'Teléfono', order.customer.phone, callCustomer)}
          </View>
        ))}

        {/* Información de la Tienda */}
        {renderInfoCard('Información de la Tienda', (
          <View>
            {renderInfoRow('storefront-outline', 'Tienda', order.store.name)}
            {renderInfoRow('location-outline', 'Ubicación', `${order.store.city} - ${order.store.address}`)}
            {renderInfoRow('call-outline', 'Teléfono', order.store.phone, callStore)}
          </View>
        ))}

        {/* Información de Entrega */}
        {renderInfoCard('Información de Entrega', (
          <View>
            {renderInfoRow(
              order.deliveryType === 'delivery' ? 'car-outline' : 'location-outline',
              'Tipo',
              order.deliveryType === 'delivery' ? 'Delivery' : 'Recoger en tienda'
            )}
            {order.deliveryAddress && (
              <>
                {renderInfoRow('home-outline', 'Dirección', order.deliveryAddress.address, openMaps)}
                {renderInfoRow('location-outline', 'Ciudad', `${order.deliveryAddress.city}, ${order.deliveryAddress.state}`)}
              </>
            )}
            {order.deliveryInstructions && (
              renderInfoRow('document-text-outline', 'Instrucciones', order.deliveryInstructions)
            )}
            {order.notes && (
              renderInfoRow('chatbubble-outline', 'Notas', order.notes)
            )}
          </View>
        ))}

        {/* Productos */}
        {renderInfoCard('Productos', (
          <View>
            {order.items.map((item, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.textPrimary }]}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.textSecondary }]}>
                    {formatCurrency(item.product.price)} x {item.quantity}
                  </Text>
                </View>
                <Text style={[styles.productTotal, { color: colors.textPrimary }]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Resumen de Pago */}
        {renderInfoCard('Resumen de Pago', (
          <View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Subtotal:
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textPrimary }]}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Impuestos:
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textPrimary }]}>
                {formatCurrency(order.tax)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Delivery:
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textPrimary }]}>
                {formatCurrency(order.deliveryFee)}
              </Text>
            </View>
            <View style={[styles.paymentRow, styles.paymentTotal]}>
              <Text style={[styles.paymentTotalLabel, { color: colors.textPrimary }]}>
                Total:
              </Text>
              <Text style={[styles.paymentTotalValue, { color: colors.textPrimary }]}>
                {formatCurrency(order.total)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Método de Pago:
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textPrimary }]}>
                {order.paymentMethod}
              </Text>
            </View>
          </View>
        ))}

        {/* Acciones de Estado */}
        <View style={[styles.actionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.actionsTitle, { color: colors.textPrimary }]}>
            Acciones de Estado
          </Text>
          <View style={styles.actionsGrid}>
            {order.status === 'pending' && (
              renderStatusButton('confirmed', 'Confirmar', '#10B981', 'checkmark')
            )}
            {order.status === 'confirmed' && (
              renderStatusButton('preparing', 'Preparar', '#8B5CF6', 'construct')
            )}
            {order.status === 'preparing' && (
              renderStatusButton('ready', 'Lista', '#10B981', 'checkmark-circle')
            )}
            {order.status === 'ready' && (
              renderStatusButton('delivered', 'Entregada', '#059669', 'checkmark-done')
            )}
            {(order.status === 'pending' || order.status === 'confirmed') && (
              renderStatusButton('cancelled', 'Cancelar', '#EF4444', 'close')
            )}
          </View>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;
