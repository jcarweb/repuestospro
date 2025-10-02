import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  estimatedDelivery?: string;
}

const OrdersScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Aquí cargarías los pedidos desde el backend
      // Por ahora usamos datos de ejemplo
      const mockOrders: Order[] = [
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          items: [
            {
              _id: '1',
              product: {
                _id: 'p1',
                name: 'Filtro de Aceite Toyota',
                price: 25.99,
                image: 'https://via.placeholder.com/100',
              },
              quantity: 2,
            },
            {
              _id: '2',
              product: {
                _id: 'p2',
                name: 'Pastillas de Freno Honda',
                price: 45.50,
                image: 'https://via.placeholder.com/100',
              },
              quantity: 1,
            },
          ],
          total: 97.48,
          status: 'delivered',
          createdAt: '2024-01-10T10:30:00Z',
          updatedAt: '2024-01-12T14:20:00Z',
          shippingAddress: {
            street: 'Av. Principal 123',
            city: 'Caracas',
            state: 'Distrito Capital',
            zipCode: '1010',
          },
          paymentMethod: 'Tarjeta de crédito',
          estimatedDelivery: '2024-01-12T18:00:00Z',
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          items: [
            {
              _id: '3',
              product: {
                _id: 'p3',
                name: 'Batería Automotriz 12V',
                price: 89.99,
                image: 'https://via.placeholder.com/100',
              },
              quantity: 1,
            },
          ],
          total: 89.99,
          status: 'shipped',
          createdAt: '2024-01-14T15:45:00Z',
          updatedAt: '2024-01-15T09:30:00Z',
          shippingAddress: {
            street: 'Calle Comercial 456',
            city: 'Valencia',
            state: 'Carabobo',
            zipCode: '2001',
          },
          paymentMethod: 'Transferencia bancaria',
          estimatedDelivery: '2024-01-17T12:00:00Z',
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          items: [
            {
              _id: '4',
              product: {
                _id: 'p4',
                name: 'Aceite de Motor 5W-30',
                price: 35.00,
                image: 'https://via.placeholder.com/100',
              },
              quantity: 3,
            },
          ],
          total: 105.00,
          status: 'pending',
          createdAt: '2024-01-15T11:20:00Z',
          updatedAt: '2024-01-15T11:20:00Z',
          shippingAddress: {
            street: 'Urbanización Los Rosales 789',
            city: 'Maracay',
            state: 'Aragua',
            zipCode: '2101',
          },
          paymentMethod: 'Efectivo',
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', color: colors.warning, icon: 'time-outline' };
      case 'confirmed':
        return { text: 'Confirmado', color: colors.info, icon: 'checkmark-circle-outline' };
      case 'processing':
        return { text: 'Procesando', color: colors.info, icon: 'settings-outline' };
      case 'shipped':
        return { text: 'Enviado', color: colors.primary, icon: 'car-outline' };
      case 'delivered':
        return { text: 'Entregado', color: colors.success, icon: 'checkmark-done-circle-outline' };
      case 'cancelled':
        return { text: 'Cancelado', color: colors.error, icon: 'close-circle-outline' };
      default:
        return { text: 'Desconocido', color: colors.textTertiary, icon: 'help-outline' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = selectedStatus 
    ? orders.filter(order => order.status === selectedStatus)
    : orders;

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => {
          // Navegar al detalle del pedido
          Alert.alert('Detalle del Pedido', `Ver detalles de ${item.orderNumber}`);
        }}
      >
        {/* Header del pedido */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>
              {item.orderNumber}
            </Text>
            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color="white" />
            <Text style={styles.statusText}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* Items del pedido */}
        <View style={styles.orderItems}>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <View key={orderItem._id} style={styles.orderItem}>
              <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                {orderItem.product.name}
              </Text>
              <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                x{orderItem.quantity}
              </Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={[styles.moreItems, { color: colors.textTertiary }]}>
              +{item.items.length - 2} más productos
            </Text>
          )}
        </View>

        {/* Footer del pedido */}
        <View style={styles.orderFooter}>
          <View style={styles.orderTotal}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Total:
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              ${item.total.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.orderActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                // Ver detalles del pedido
                Alert.alert('Detalle del Pedido', `Ver detalles de ${item.orderNumber}`);
              }}
            >
              <Ionicons name="eye-outline" size={16} color={colors.textPrimary} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>
                Ver
              </Text>
            </TouchableOpacity>
            
            {item.status === 'delivered' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  // Navegar a reseñas
                  (navigation as any).navigate('Reviews');
                }}
              >
                <Ionicons name="star-outline" size={16} color="#000000" />
                <Text style={[styles.actionText, { color: '#000000' }]}>
                  Reseñar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatusFilter = (status: string, label: string) => {
    const statusInfo = getStatusInfo(status);
    const isSelected = selectedStatus === status;
    
    return (
      <TouchableOpacity
        style={[
          styles.statusFilter,
          { 
            backgroundColor: isSelected ? statusInfo.color : colors.surfaceSecondary,
            borderColor: colors.border 
          }
        ]}
        onPress={() => setSelectedStatus(isSelected ? null : status)}
      >
        <Ionicons 
          name={statusInfo.icon as any} 
          size={16} 
          color={isSelected ? 'white' : colors.textPrimary} 
        />
        <Text style={[
          styles.statusFilterText, 
          { color: isSelected ? 'white' : colors.textPrimary }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando pedidos...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Mis Pedidos
          </Text>
          <Text style={[styles.orderCount, { color: colors.textSecondary }]}>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
          </Text>
        </View>

        {/* Filtros de estado */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderStatusFilter('', 'Todos')}
            {renderStatusFilter('pending', 'Pendientes')}
            {renderStatusFilter('processing', 'Procesando')}
            {renderStatusFilter('shipped', 'Enviados')}
            {renderStatusFilter('delivered', 'Entregados')}
          </ScrollView>
        </View>

        {/* Lista de pedidos */}
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {selectedStatus ? 'No hay pedidos con este estado' : 'No tienes pedidos aún'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              {selectedStatus 
                ? 'Intenta con otro filtro o realiza tu primera compra'
                : 'Realiza tu primera compra para ver tus pedidos aquí'
              }
            </Text>
            {!selectedStatus && (
              <TouchableOpacity
                style={[styles.shopButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  // Navegar a productos
                  (navigation as any).navigate('ClientTabs', { screen: 'Products' });
                }}
              >
                <Text style={[styles.shopButtonText, { color: '#000000' }]}>
                  Ir a Productos
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            <FlatList
              data={filteredOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
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
  header: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderCount: {
    fontSize: 14,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  statusFilterText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ordersContainer: {
    paddingHorizontal: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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

export default OrdersScreen;
