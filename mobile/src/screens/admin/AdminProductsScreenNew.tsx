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
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { productService, Product, Store } from '../../services/productService';
import Icon from 'react-native-vector-icons/Icon';

const AdminProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('name');
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  // Verificar permisos según el rol
  const canManageProducts = user?.role === 'admin' || user?.role === 'store_manager' || user?.role === 'delivery';
  const isAdmin = user?.role === 'admin';

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // Cargar productos desde el servicio
      const response = await productService.getProducts({
        page: 1,
        limit: 1000, // Aumentar límite para cargar todos los productos
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        storeId: selectedStore !== 'all' ? selectedStore : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
      
      if (response.success && response.data) {
        // La respuesta real tiene la estructura: { data: { products: [...], pagination: {...} } }
        const productsData = response.data.products || response.data || [];
        setProducts(productsData);
        console.log(`✅ Cargados ${response.data.pagination?.total || productsData.length || 0} productos`);
      } else {
        console.error('❌ Error cargando productos:', response.error);
        showToast('Error al cargar productos', 'error');
        
        // Fallback a datos mock si falla la API
        const mockProducts: Product[] = [
          {
            _id: '1',
            name: 'Filtro de Aceite Motor',
            description: 'Filtro de aceite para motor de vehículo',
            price: 25.50,
            category: 'Filtros',
            brand: 'Bosch',
            sku: 'FIL-001',
            stock: 50,
            isActive: true,
            isFeatured: false,
            images: ['https://via.placeholder.com/150'],
            tags: ['filtro', 'aceite', 'motor'],
            store: {
              _id: 'store1',
              name: 'Repuestos Central',
              city: 'Caracas'
            },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            _id: '2',
            name: 'Pastillas de Freno Delanteras',
            description: 'Pastillas de freno para sistema delantero',
            price: 45.00,
            category: 'Frenos',
            brand: 'Brembo',
            sku: 'PAS-002',
            stock: 30,
            isActive: true,
            isFeatured: true,
            images: ['https://via.placeholder.com/150'],
            tags: ['frenos', 'pastillas', 'delantero'],
            store: {
              _id: 'store1',
              name: 'Repuestos Central',
              city: 'Caracas'
            },
            createdAt: '2024-01-14T09:30:00Z',
            updatedAt: '2024-01-14T09:30:00Z'
          },
          {
            _id: '3',
            name: 'Bujía de Encendido',
            description: 'Bujía de encendido para motor',
            price: 15.75,
            category: 'Encendido',
            brand: 'NGK',
            sku: 'BUJ-003',
            stock: 100,
            isActive: true,
            isFeatured: false,
            images: ['https://via.placeholder.com/150'],
            tags: ['bujía', 'encendido', 'motor'],
            store: {
              _id: 'store2',
              name: 'Auto Parts Plus',
              city: 'Valencia'
            },
            createdAt: '2024-01-13T14:20:00Z',
            updatedAt: '2024-01-13T14:20:00Z'
          }
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const response = await productService.getStores();
      if (response.success && response.data) {
        setStores(response.data.stores || []);
        console.log(`✅ Cargadas ${response.data.stores?.length || 0} tiendas`);
      } else {
        console.error('❌ Error cargando tiendas:', response.error);
        // Fallback a datos mock
        const mockStores: Store[] = [
          {
            _id: 'store1',
            name: 'Repuestos Central',
            description: 'Tienda principal de repuestos automotrices',
            address: 'Av. Principal 123',
            city: 'Caracas',
            state: 'Distrito Capital',
            zipCode: '1010',
            country: 'Venezuela',
            phone: '+584121234567',
            email: 'info@repuestoscentral.com',
            isActive: true,
            isMainStore: true,
            coordinates: {
              latitude: 10.4806,
              longitude: -66.9036
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: 'store2',
            name: 'Auto Parts Plus',
            description: 'Sucursal de repuestos especializados',
            address: 'Calle Comercial 456',
            city: 'Valencia',
            state: 'Carabobo',
            zipCode: '2001',
            country: 'Venezuela',
            phone: '+584121234568',
            email: 'valencia@autopartsplus.com',
            isActive: true,
            isMainStore: false,
            coordinates: {
              latitude: 10.1621,
              longitude: -68.0077
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ];
        setStores(mockStores);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
      console.log(`✅ Cargadas ${categoriesData.length} categorías`);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadProducts(), loadStores(), loadCategories()]);
    setIsRefreshing(false);
  }, [searchQuery, selectedCategory, selectedStore, selectedStatus]);

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await productService.updateProduct(productId, {
        isActive: !currentStatus
      });
      
      if (response.success) {
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === productId 
              ? { ...product, isActive: !currentStatus }
              : product
          )
        );
        showToast(
          `Producto ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`,
          'success'
        );
      } else {
        showToast('Error al cambiar estado del producto', 'error');
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      showToast('Error al cambiar estado del producto', 'error');
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${productName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await productService.deleteProduct(productId);
              
              if (response.success) {
                setProducts(prevProducts => 
                  prevProducts.filter(product => product._id !== productId)
                );
                showToast('Producto eliminado exitosamente', 'success');
              } else {
                showToast('Error al eliminar producto', 'error');
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              showToast('Error al eliminar producto', 'error');
            }
          }
        }
      ]
    );
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    // Aplicar filtros
    if (searchQuery) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStore !== 'all') {
      filtered = filtered.filter(product => product.store._id === selectedStore);
    }

    if (selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(product => product.isActive === isActive);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price':
          return a.price - b.price;
        case 'stock':
          return a.stock - b.stock;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name || 'Sin nombre'}</Text>
          <Text style={styles.productSku}>SKU: {item.sku || 'N/A'}</Text>
          <Text style={styles.productStore}>
            {item.store?.name || 'Sin tienda'} - {item.store?.city || 'Sin ciudad'}
          </Text>
        </View>
        <View style={styles.productActions}>
          {canManageProducts && (
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
              ]}
              onPress={() => toggleProductStatus(item._id, item.isActive)}
            >
              <Icon
                name={item.isActive ? 'checkmark' : 'close'}
                size={16}
                color="white"
              />
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProduct(item._id, item.name || 'Producto')}
            >
              <Icon name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Text style={styles.productDescription} numberOfLines={2}>
        {item.description || 'Sin descripción'}
      </Text>
      
      <View style={styles.productDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Precio:</Text>
          <Text style={styles.detailValue}>${item.price?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Stock:</Text>
          <Text style={[
            styles.detailValue,
            { color: item.stock === 0 ? '#EF4444' : item.stock < 10 ? '#F59E0B' : '#10B981' }
          ]}>
            {item.stock || 0}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Categoría:</Text>
          <Text style={styles.detailValue}>{item.category || 'Sin categoría'}</Text>
        </View>
      </View>
      
      {item.brand && (
        <View style={styles.productTags}>
          <Text style={styles.tag}>Marca: {item.brand}</Text>
        </View>
      )}
      
      <View style={styles.productFooter}>
        <Text style={styles.productDate}>
          Creado: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={12} color="#F59E0B" />
            <Text style={styles.featuredText}>Destacado</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (label: string, value: string, currentValue: string, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentValue === value && styles.filterButtonActive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        currentValue === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadProducts();
    loadStores();
    loadCategories();
  }, [searchQuery, selectedCategory, selectedStore, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      if (canManageProducts) {
        loadProducts();
        loadStores();
        loadCategories();
      }
    }, [canManageProducts])
  );

  if (!canManageProducts) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.accessDeniedContainer}>
          <Icon name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedMessage}>
            No tienes permisos para acceder a la gestión de productos.
          </Text>
        </View>
      </View>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Productos</Text>
        <Text style={styles.headerSubtitle}>
          {filteredProducts.length} productos encontrados
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Categoría:</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('Todas', 'all', selectedCategory, () => setSelectedCategory('all'))}
            {(categories || []).map(category => (
              renderFilterButton(
                category.name || category, 
                category.name || category, 
                selectedCategory, 
                () => setSelectedCategory(category.name || category)
              )
            ))}
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Tienda:</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('Todas', 'all', selectedStore, () => setSelectedStore('all'))}
            {(stores || []).map(store => (
              renderFilterButton(store.name, store._id, selectedStore, () => setSelectedStore(store._id))
            ))}
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Estado:</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('Todos', 'all', selectedStatus, () => setSelectedStatus('all'))}
            {renderFilterButton('Activos', 'active', selectedStatus, () => setSelectedStatus('active'))}
            {renderFilterButton('Inactivos', 'inactive', selectedStatus, () => setSelectedStatus('inactive'))}
          </View>
        </View>
      </View>

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.productsList}
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
              <Icon name="cube-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No se encontraron productos</Text>
              <Text style={styles.emptyMessage}>
                Intenta ajustar los filtros de búsqueda
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
  filtersContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  productStore: {
    fontSize: 12,
    color: '#6B7280',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 12,
    color: '#D97706',
    marginLeft: 4,
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
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AdminProductsScreen;
