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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

interface Store {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  isActive: boolean;
  isVerified: boolean;
  logo?: string;
  coverImage?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
    rating: number;
    totalReviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminStoresScreen: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'sales' | 'revenue' | 'rating'>('name');
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const loadStores = async () => {
    try {
      // Simular carga de tiendas desde API
      const mockStores: Store[] = [
        {
          _id: '1',
          name: 'Repuestos El Motor',
          description: 'Especialistas en repuestos para motores y transmisiones',
          address: 'Av. Principal 123, Caracas',
          phone: '+584121234567',
          email: 'info@repuestoselmotor.com',
          lat: 10.4806,
          lng: -66.9036,
          isActive: true,
          isVerified: true,
          logo: 'https://via.placeholder.com/100',
          coverImage: 'https://via.placeholder.com/300x150',
          owner: {
            _id: '1',
            name: 'Juan Pérez',
            email: 'juan@repuestoselmotor.com',
          },
          stats: {
            totalProducts: 150,
            totalSales: 45,
            totalRevenue: 12500.50,
            rating: 4.5,
            totalReviews: 23,
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
        },
        {
          _id: '2',
          name: 'Auto Parts Center',
          description: 'Repuestos originales y alternativos para todas las marcas',
          address: 'Calle Comercio 456, Valencia',
          phone: '+584141234567',
          email: 'ventas@autopartscenter.com',
          lat: 10.1621,
          lng: -68.0077,
          isActive: true,
          isVerified: false,
          logo: 'https://via.placeholder.com/100',
          coverImage: 'https://via.placeholder.com/300x150',
          owner: {
            _id: '2',
            name: 'María García',
            email: 'maria@autopartscenter.com',
          },
          stats: {
            totalProducts: 89,
            totalSales: 23,
            totalRevenue: 8750.25,
            rating: 4.2,
            totalReviews: 15,
          },
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-20T14:20:00Z',
        },
        {
          _id: '3',
          name: 'Lubricantes Pro',
          description: 'Aceites y lubricantes de alta calidad',
          address: 'Zona Industrial, Maracay',
          phone: '+584431234567',
          email: 'info@lubricantespro.com',
          lat: 10.2353,
          lng: -67.5911,
          isActive: false,
          isVerified: true,
          logo: 'https://via.placeholder.com/100',
          coverImage: 'https://via.placeholder.com/300x150',
          owner: {
            _id: '3',
            name: 'Carlos López',
            email: 'carlos@lubricantespro.com',
          },
          stats: {
            totalProducts: 45,
            totalSales: 12,
            totalRevenue: 3200.75,
            rating: 4.8,
            totalReviews: 8,
          },
          createdAt: '2024-01-12T11:00:00Z',
          updatedAt: '2024-01-20T16:45:00Z',
        },
      ];
      
      setStores(mockStores);
    } catch (error) {
      console.error('Error loading stores:', error);
      showToast('Error cargando tiendas', 'error');
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadStores();
    setIsRefreshing(false);
  };

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Estás seguro de que quieres ${currentStatus ? 'desactivar' : 'activar'} esta tienda?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: currentStatus ? 'Desactivar' : 'Activar',
          style: currentStatus ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setStores(prevStores =>
                prevStores.map(store =>
                  store._id === storeId
                    ? { ...store, isActive: !currentStatus }
                    : store
                )
              );
              showToast(`Tienda ${!currentStatus ? 'activada' : 'desactivada'} exitosamente`, 'success');
            } catch (error) {
              console.error('Error changing store status:', error);
              showToast('Error cambiando estado de la tienda', 'error');
            }
          },
        },
      ]
    );
  };

  const toggleVerification = async (storeId: string, currentVerification: boolean) => {
    Alert.alert(
      'Verificación',
      `¿Estás seguro de que quieres ${currentVerification ? 'desverificar' : 'verificar'} esta tienda?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: currentVerification ? 'Desverificar' : 'Verificar',
          style: 'default',
          onPress: async () => {
            try {
              setStores(prevStores =>
                prevStores.map(store =>
                  store._id === storeId
                    ? { ...store, isVerified: !currentVerification }
                    : store
                )
              );
              showToast(`Tienda ${!currentVerification ? 'verificada' : 'desverificada'} exitosamente`, 'success');
            } catch (error) {
              console.error('Error changing store verification:', error);
              showToast('Error cambiando verificación de la tienda', 'error');
            }
          },
        },
      ]
    );
  };

  const deleteStore = async (storeId: string, storeName: string) => {
    Alert.alert(
      'Eliminar Tienda',
      `¿Estás seguro de que quieres eliminar "${storeName}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setStores(prevStores => prevStores.filter(store => store._id !== storeId));
              showToast('Tienda eliminada exitosamente', 'success');
            } catch (error) {
              console.error('Error deleting store:', error);
              showToast('Error eliminando tienda', 'error');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        await loadStores();
        setIsLoading(false);
      };
      loadData();
    }, [])
  );

  const filteredAndSortedStores = stores
    .filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           store.owner.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && store.isActive) ||
                           (selectedStatus === 'inactive' && !store.isActive) ||
                           (selectedStatus === 'verified' && store.isVerified) ||
                           (selectedStatus === 'unverified' && !store.isVerified);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'sales':
          return b.stats.totalSales - a.stats.totalSales;
        case 'revenue':
          return b.stats.totalRevenue - a.stats.totalRevenue;
        case 'rating':
          return b.stats.rating - a.stats.rating;
        default:
          return 0;
      }
    });

  const renderStoreItem = ({ item }: { item: Store }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <Image source={{ uri: item.logo }} style={styles.storeLogo} />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.storeAddress} numberOfLines={1}>{item.address}</Text>
          <Text style={styles.storeOwner}>Propietario: {item.owner.name}</Text>
        </View>
        <View style={styles.storeStatus}>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#34C759' : '#FF3B30' }]}>
            <Text style={styles.statusText}>{item.isActive ? 'Activa' : 'Inactiva'}</Text>
          </View>
          {item.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text style={styles.verifiedText}>Verificada</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.storeDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube" size={16} color="#007AFF" />
          <Text style={styles.detailText}>{item.stats.totalProducts} productos</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="trending-up" size={16} color="#34C759" />
          <Text style={styles.detailText}>
            {item.stats.totalSales} ventas - ${item.stats.totalRevenue.toFixed(2)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="star" size={16} color="#FF9500" />
          <Text style={styles.detailText}>
            ⭐ {item.stats.rating} ({item.stats.totalReviews} reseñas)
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
      </View>

      <View style={styles.storeActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isActive ? '#FF3B30' : '#34C759' }]}
          onPress={() => toggleStoreStatus(item._id, item.isActive)}
        >
          <Ionicons 
            name={item.isActive ? 'pause-circle' : 'play-circle'} 
            size={20} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isVerified ? '#FF9500' : '#007AFF' }]}
          onPress={() => toggleVerification(item._id, item.isVerified)}
        >
          <Ionicons 
            name={item.isVerified ? 'close-circle' : 'checkmark-circle'} 
            size={20} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {item.isVerified ? 'Desverificar' : 'Verificar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => {
            // Navegar a editar tienda
            // navigation.navigate('EditStore', { storeId: item._id });
          }}
        >
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => deleteStore(item._id, item.name)}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Verificar si el usuario es admin
  if (!isAdmin) {
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando tiendas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
        translucent={false}
      />
      
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }]}>
        <Text style={styles.title}>Gestión de Tiendas</Text>
        <Text style={styles.subtitle}>
          Administrar tiendas y sucursales
        </Text>
      </View>

      {/* Filtros y búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tiendas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.statusFilter}>
            <TouchableOpacity
              style={[styles.filterButton, selectedStatus === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedStatus('all')}
            >
              <Text style={[styles.filterButtonText, selectedStatus === 'all' && styles.filterButtonTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedStatus === 'active' && styles.filterButtonActive]}
              onPress={() => setSelectedStatus('active')}
            >
              <Text style={[styles.filterButtonText, selectedStatus === 'active' && styles.filterButtonTextActive]}>
                Activas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedStatus === 'verified' && styles.filterButtonActive]}
              onPress={() => setSelectedStatus('verified')}
            >
              <Text style={[styles.filterButtonText, selectedStatus === 'verified' && styles.filterButtonTextActive]}>
                Verificadas
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Ordenar por:</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                const sortOptions = ['name', 'sales', 'revenue', 'rating'];
                const currentIndex = sortOptions.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortBy(sortOptions[nextIndex] as any);
              }}
            >
              <Text style={styles.sortButtonText}>
                {sortBy === 'name' ? 'Nombre' : 
                 sortBy === 'sales' ? 'Ventas' :
                 sortBy === 'revenue' ? 'Ingresos' : 'Rating'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Lista de tiendas */}
      <FlatList
        data={filteredAndSortedStores}
        keyExtractor={(item) => item._id}
        renderItem={renderStoreItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No se encontraron tiendas</Text>
          </View>
        }
      />

      {/* Botón flotante para agregar tienda */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Navegar a crear tienda
          // navigation.navigate('CreateStore');
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Espacio para el FAB
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  storeOwner: {
    fontSize: 12,
    color: '#8E8E93',
  },
  storeStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  storeDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  storeActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AdminStoresScreen;
