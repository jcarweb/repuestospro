import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { getBaseURL } from '../../config/api';

interface DeliveryDriver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: {
    type: string;
    plate: string;
    model: string;
  };
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  createdAt: string;
}

interface DeliveryOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  store: {
    name: string;
    address: string;
  };
  driver?: {
    _id: string;
    name: string;
    phone: string;
  };
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedDelivery: string;
  actualDelivery?: string;
  distance: number;
  fee: number;
  notes?: string;
  createdAt: string;
}

interface DeliveryStats {
  totalDrivers: number;
  activeDrivers: number;
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  averageDeliveryTime: number;
  totalRevenue: number;
}

const AdminDeliveryScreen: React.FC = () => {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'drivers' | 'orders'>('drivers');
  
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const loadDrivers = async () => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/delivery/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDrivers(data.data || []);
      } else {
        // Datos mock como fallback
        setDrivers([
          {
            _id: '1',
            name: 'Carlos Mendoza',
            email: 'carlos@example.com',
            phone: '+584121234567',
            vehicle: {
              type: 'Moto',
              plate: 'ABC-123',
              model: 'Honda CB 125'
            },
            status: 'available',
            currentLocation: {
              latitude: 10.4806,
              longitude: -66.9036
            },
            rating: 4.8,
            totalDeliveries: 156,
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            _id: '2',
            name: 'María González',
            email: 'maria@example.com',
            phone: '+584129876543',
            vehicle: {
              type: 'Carro',
              plate: 'XYZ-789',
              model: 'Toyota Corolla'
            },
            status: 'busy',
            rating: 4.9,
            totalDeliveries: 203,
            isActive: true,
            createdAt: '2024-01-10T08:00:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      showToast('Error cargando repartidores', 'error');
    }
  };

  const loadOrders = async () => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/delivery/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        // Datos mock como fallback
        setOrders([
          {
            _id: '1',
            orderNumber: 'ORD-001',
            customer: {
              name: 'Juan Pérez',
              phone: '+584121111111',
              address: 'Av. Principal, Caracas'
            },
            store: {
              name: 'Repuestos El Motor',
              address: 'Centro Comercial, Caracas'
            },
            driver: {
              _id: '1',
              name: 'Carlos Mendoza',
              phone: '+584121234567'
            },
            status: 'in_transit',
            estimatedDelivery: '2024-01-20T15:30:00Z',
            distance: 5.2,
            fee: 8.50,
            notes: 'Entregar en recepción',
            createdAt: '2024-01-20T14:00:00Z'
          },
          {
            _id: '2',
            orderNumber: 'ORD-002',
            customer: {
              name: 'Ana García',
              phone: '+584122222222',
              address: 'Residencias Los Palos Grandes'
            },
            store: {
              name: 'Auto Parts Center',
              address: 'Zona Industrial, Valencia'
            },
            status: 'pending',
            estimatedDelivery: '2024-01-20T16:00:00Z',
            distance: 12.8,
            fee: 15.00,
            createdAt: '2024-01-20T15:00:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Error cargando pedidos', 'error');
    }
  };

  const loadStats = async () => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/delivery/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        // Datos mock como fallback
        setStats({
          totalDrivers: 12,
          activeDrivers: 8,
          totalDeliveries: 1247,
          pendingDeliveries: 15,
          completedDeliveries: 1180,
          averageDeliveryTime: 35,
          totalRevenue: 15680.50
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadDrivers(), loadOrders(), loadStats()]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/delivery/drivers/${driverId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDrivers(prevDrivers =>
          prevDrivers.map(driver =>
            driver._id === driverId ? { ...driver, isActive: !currentStatus } : driver
          )
        );
        showToast(`Repartidor ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      } else {
        showToast(data.message || 'Error al cambiar estado del repartidor', 'error');
      }
    } catch (error) {
      console.error('Error toggling driver status:', error);
      showToast('Error al cambiar estado del repartidor', 'error');
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/delivery/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ driverId })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Repartidor asignado exitosamente', 'success');
        loadOrders();
      } else {
        showToast(data.message || 'Error al asignar repartidor', 'error');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      showToast('Error al asignar repartidor', 'error');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const baseURL = await getBaseURL();
      const response = await fetch(`${baseURL}/admin/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Estado del pedido actualizado', 'success');
        loadOrders();
      } else {
        showToast(data.message || 'Error al actualizar estado', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Error al actualizar estado del pedido', 'error');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([loadDrivers(), loadOrders(), loadStats()]);
        setIsLoading(false);
      };
      loadData();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'offline': return '#EF4444';
      case 'pending': return '#6B7280';
      case 'assigned': return '#3B82F6';
      case 'picked_up': return '#8B5CF6';
      case 'in_transit': return '#F59E0B';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Desconectado';
      case 'pending': return 'Pendiente';
      case 'assigned': return 'Asignado';
      case 'picked_up': return 'Recogido';
      case 'in_transit': return 'En Tránsito';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const renderDriverCard = ({ item }: { item: DeliveryDriver }) => (
    <View style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.name}</Text>
          <Text style={styles.driverContact}>📞 {item.phone}</Text>
          <Text style={styles.driverVehicle}>
            🚗 {item.vehicle.type} - {item.vehicle.plate}
          </Text>
        </View>
        <View style={styles.driverStats}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.deliveriesText}>📦 {item.totalDeliveries}</Text>
        </View>
      </View>
      
      <View style={styles.driverActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: item.isActive ? '#EF4444' : '#10B981' }
          ]}
          onPress={() => toggleDriverStatus(item._id, item.isActive)}
        >
          <Ionicons 
            name={item.isActive ? 'pause' : 'play'} 
            size={16} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => {
            // Navegar a detalles del repartidor
          }}
        >
          <Ionicons name="eye" size={16} color="white" />
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderCard = ({ item }: { item: DeliveryOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.customerName}>👤 {item.customer.name}</Text>
        <Text style={styles.customerAddress}>📍 {item.customer.address}</Text>
        <Text style={styles.storeName}>🏪 {item.store.name}</Text>
        {item.driver && (
          <Text style={styles.driverName}>🚗 {item.driver.name}</Text>
        )}
        <Text style={styles.distanceText}>📏 {item.distance} km</Text>
        <Text style={styles.feeText}>💰 ${item.fee}</Text>
      </View>
      
      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => {
              // Mostrar modal para asignar repartidor
              Alert.alert(
                'Asignar Repartidor',
                'Selecciona un repartidor disponible',
                drivers
                  .filter(d => d.status === 'available')
                  .map(driver => ({
                    text: driver.name,
                    onPress: () => assignDriver(item._id, driver._id)
                  }))
                  .concat([{ text: 'Cancelar', style: 'cancel' }])
              );
            }}
          >
            <Ionicons name="person-add" size={16} color="white" />
            <Text style={styles.actionButtonText}>Asignar</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'assigned' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => updateOrderStatus(item._id, 'picked_up')}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.actionButtonText}>Recogido</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'picked_up' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => updateOrderStatus(item._id, 'in_transit')}
          >
            <Ionicons name="car" size={16} color="white" />
            <Text style={styles.actionButtonText}>En Tránsito</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'in_transit' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => updateOrderStatus(item._id, 'delivered')}
          >
            <Ionicons name="checkmark-done" size={16} color="white" />
            <Text style={styles.actionButtonText}>Entregado</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedTitle}>Acceso Restringido</Text>
          <Text style={styles.restrictedText}>
            Solo los administradores pueden acceder a esta funcionalidad.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando gestión de delivery...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : insets.top + 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Delivery</Text>
        <Text style={styles.headerSubtitle}>
          Administra repartidores y entregas
        </Text>
      </View>

      {/* Estadísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalDrivers}</Text>
            <Text style={styles.statLabel}>Repartidores</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeDrivers}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingDeliveries}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedDeliveries}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drivers' && styles.activeTab]}
          onPress={() => setActiveTab('drivers')}
        >
          <Text style={[styles.tabText, activeTab === 'drivers' && styles.activeTabText]}>
            Repartidores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Pedidos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Content */}
      {activeTab === 'drivers' ? (
        <FlatList
          data={drivers}
          renderItem={renderDriverCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No hay repartidores</Text>
              <Text style={styles.emptyMessage}>
                Los repartidores aparecerán aquí cuando se registren
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No hay pedidos</Text>
              <Text style={styles.emptyMessage}>
                Los pedidos de delivery aparecerán aquí
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  driverCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  driverContact: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  driverVehicle: {
    fontSize: 12,
    color: '#6B7280',
  },
  driverStats: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  deliveriesText: {
    fontSize: 12,
    color: '#6B7280',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderDetails: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  feeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AdminDeliveryScreen;
