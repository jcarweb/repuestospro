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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { productService, Product, Store } from '../../services/productService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

type AdminStackParamList = {
  AdminProducts: undefined;
  AdminCreateProduct: { productId?: string };
};

type AdminProductsNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminProducts'>;

const AdminProductsScreen: React.FC = () => {
  const navigation = useNavigation<AdminProductsNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('name');
  
  // Estados para mejoras de UI
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  // Debug: Verificar estado del usuario
  console.log('👤 Usuario actual:', user);
  console.log('👤 Rol del usuario:', user?.role);
  console.log('👤 Usuario autenticado:', !!user);

  // Verificar permisos según el rol
  const canManageProducts = user?.role === 'admin' || user?.role === 'store_manager';
  const isAdmin = user?.role === 'admin';
  const isStoreManager = user?.role === 'store_manager';
  

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // Cargar productos desde el servicio
      const response = await productService.getProducts({
        page: 1,
        limit: 1000, // Aumentar límite para cargar todos los productos
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        brand: selectedBrand !== 'all' ? selectedBrand : undefined,
        vehicleType: selectedVehicleType !== 'all' ? selectedVehicleType : undefined,
        storeId: selectedStore !== 'all' ? selectedStore : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
      
      if (response.success && response.data) {
        // La respuesta real tiene la estructura: { data: { products: [...], pagination: {...} } }
        const productsData = (response.data as any).products || response.data || [];
        console.log('📦 Productos cargados:', productsData);
        console.log('📦 Primer producto:', productsData[0]);
        setProducts(productsData);
        console.log(`✅ Cargados ${(response.data as any).pagination?.total || productsData.length || 0} productos`);
      } else {
        console.error('❌ Error cargando productos:', response.error);
        showToast('Error al cargar productos', 'error');
      }
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      // Cargar tiendas desde el servicio
      const response = await productService.getStores();
      if (response.success && response.data) {
        setStores(response.data.stores || []);
        console.log(`✅ Cargadas ${response.data.stores?.length || 0} tiendas`);
      } else {
        console.error('❌ Error cargando tiendas:', response.error);
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

  const loadSubcategories = async () => {
    try {
      const subcategoriesData = await productService.getSubcategories(
        selectedCategory !== 'all' ? selectedCategory : undefined
      );
      setSubcategories(subcategoriesData);
      console.log(`✅ Cargadas ${subcategoriesData.length} subcategorías`);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };

  const loadBrands = async (vehicleType?: string) => {
    try {
      if (vehicleType && vehicleType !== 'all') {
        // Cargar marcas específicas para el tipo de vehículo seleccionado
        const brandsData = await productService.getBrandsByVehicleType(vehicleType);
        setBrands(brandsData);
        console.log(`✅ Cargadas ${brandsData.length} marcas para ${vehicleType}`);
      } else {
        // Si no hay tipo de vehículo seleccionado, cargar marcas generales
        const brandsData = await productService.getBrands();
        setBrands(brandsData);
        console.log(`✅ Cargadas ${brandsData.length} marcas generales`);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      setBrands([]);
    }
  };

  const loadVehicleTypes = async () => {
    try {
      const vehicleTypesData = await productService.getVehicleTypes();
      setVehicleTypes(vehicleTypesData);
      console.log(`✅ Cargados ${vehicleTypesData.length} tipos de vehículo`);
    } catch (error) {
      console.error('Error loading vehicle types:', error);
      setVehicleTypes([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Cargar datos secuencialmente para evitar rate limiting
    await loadProducts();
    await loadStores();
    await loadCategories();
    await loadSubcategories();
    // No cargar marcas automáticamente, se cargarán cuando se seleccione un tipo de vehículo
    await loadVehicleTypes();
    setIsRefreshing(false);
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedBrand, selectedVehicleType, selectedStore, selectedStatus]);

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await productService.toggleProductStatus(productId, !currentStatus);
      
      if (response.success) {
        setProducts(prev => prev.map(product =>
          product._id === productId ? { ...product, isActive: !currentStatus } : product
        ));
        showToast(`Producto ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
      } else {
        showToast(response.message || 'Error al actualizar producto', 'error');
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      showToast('Error al actualizar producto', 'error');
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await productService.deleteProduct(productId);
              
              if (response.success) {
                // Remover el producto de la lista local
                setProducts(prevProducts => 
                  prevProducts.filter(product => product._id !== productId)
                );
                showToast('Producto eliminado exitosamente', 'success');
              } else {
                showToast(response.error || 'Error al eliminar producto', 'error');
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

  const toggleProductFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const response = await productService.toggleProductFeatured(productId, !currentFeatured);
      
      if (response.success) {
        setProducts(prev => prev.map(product =>
          product._id === productId ? { ...product, isFeatured: !currentFeatured } : product
        ));
        showToast(`Producto ${!currentFeatured ? 'destacado' : 'no destacado'} exitosamente`, 'success');
      } else {
        showToast(response.message || 'Error al actualizar producto', 'error');
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      showToast('Error al actualizar producto', 'error');
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const response = await productService.updateProductStock(productId, newStock);
      
      if (response.success) {
        setProducts(prev => prev.map(product =>
          product._id === productId ? { ...product, stock: newStock } : product
        ));
        showToast('Stock actualizado exitosamente', 'success');
      } else {
        showToast(response.message || 'Error al actualizar stock', 'error');
      }
    } catch (error) {
      console.error('Error actualizando stock:', error);
      showToast('Error al actualizar stock', 'error');
    }
  };

  const updateProductPrice = async (productId: string, newPrice: number) => {
    try {
      const response = await productService.updateProductPrice(productId, newPrice);
      
      if (response.success) {
        setProducts(prev => prev.map(product =>
          product._id === productId ? { ...product, price: newPrice } : product
        ));
        showToast('Precio actualizado exitosamente', 'success');
      } else {
        showToast(response.message || 'Error al actualizar precio', 'error');
      }
    } catch (error) {
      console.error('Error actualizando precio:', error);
      showToast('Error al actualizar precio', 'error');
    }
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

    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    if (selectedVehicleType !== 'all') {
      filtered = filtered.filter(product => product.vehicleType === selectedVehicleType);
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

  const getPaginatedProducts = () => {
    const filtered = getFilteredProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredProducts();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  const renderTableRow = (item: Product, index: number) => (
    <View key={item._id} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText} numberOfLines={1}>{item.name || 'Sin nombre'}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{item.sku || 'N/A'}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>${item.price?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.tableCellText, { color: item.stock > 10 ? '#10B981' : item.stock > 0 ? '#F59E0B' : '#EF4444' }]}>
          {item.stock || 0}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{item.store?.name || 'N/A'}</Text>
      </View>
      <View style={styles.tableCell}>
        <View style={styles.tableActions}>
          <TouchableOpacity
            style={[styles.tableActionButton, { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }]}
            onPress={() => toggleProductStatus(item._id, item.isActive)}
          >
            <Ionicons
              name={item.isActive ? 'checkmark' : 'close'}
              size={14}
              color="white"
            />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.tableActionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => deleteProduct(item._id, item.name || 'Producto')}
            >
              <Ionicons name="trash" size={14} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name || 'Sin nombre'}</Text>
          <Text style={styles.productSku}>SKU: {item.sku || 'N/A'}</Text>
          <Text style={styles.productStore}>
            {item.store?.name || 'Sin tienda'} - {item.store?.city || 'Sin ciudad'}
            {item.store?.state && `, ${item.store.state}`}
          </Text>
        </View>
        <View style={styles.productActions}>
          {canManageProducts && (
            <>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
                ]}
                onPress={() => toggleProductStatus(item._id, item.isActive)}
              >
                <Ionicons
                  name={item.isActive ? 'checkmark' : 'close'}
                  size={16}
                  color="white"
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.featuredButton,
                  { backgroundColor: item.isFeatured ? '#F59E0B' : '#6B7280' }
                ]}
                onPress={() => toggleProductFeatured(item._id, item.isFeatured)}
              >
                <Ionicons
                  name="star"
                  size={16}
                  color="white"
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('AdminCreateProduct', { productId: item._id })}
              >
                <Ionicons name="pencil" size={16} color="#3B82F6" />
              </TouchableOpacity>
            </>
          )}
          
          {/* Botón de eliminar - Solo para admin */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProduct(item._id, item.name || 'Producto')}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
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
            <Ionicons name="star" size={12} color="#F59E0B" />
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
    const loadDataSequentially = async () => {
      // Solo cargar productos inicialmente, los demás se cargarán cuando se necesiten
      await loadProducts();
    };
    
    loadDataSequentially();
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedBrand, selectedVehicleType, selectedStore, selectedStatus]);

  // Recargar subcategorías cuando cambie la categoría
  useEffect(() => {
    if (selectedCategory !== 'all') {
      loadSubcategories();
      setSelectedSubcategory('all'); // Reset subcategory when category changes
    }
  }, [selectedCategory]);

  // Recargar marcas cuando cambie el tipo de vehículo
  useEffect(() => {
    if (selectedVehicleType !== 'all') {
      loadBrands(selectedVehicleType);
      setSelectedBrand('all'); // Reset brand when vehicle type changes
    } else {
      // Si se selecciona "Todos" en tipo de vehículo, cargar marcas generales
      loadBrands();
      setSelectedBrand('all');
    }
  }, [selectedVehicleType]);

  useFocusEffect(
    useCallback(() => {
      if (canManageProducts) {
        // Solo cargar productos al enfocar la pantalla
        loadProducts();
      }
    }, [canManageProducts])
  );

  if (!canManageProducts) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedMessage}>
            No tienes permisos para acceder a la gestión de productos.
          </Text>
          <Text style={styles.accessDeniedMessage}>
            Tu rol actual: {user?.role || 'No definido'}
          </Text>
        </View>
      </View>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {isAdmin ? 'Gestión de Productos (Todas las Tiendas)' : 
               isStoreManager ? 'Mis Productos' : 
               'Gestión de Productos'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {filteredProducts.length} productos encontrados
              {isStoreManager && ' (de mis tiendas)'}
            </Text>
          </View>
          {canManageProducts && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AdminCreateProduct')}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar and Controls */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, showFilters && styles.controlButtonActive]}
            onPress={async () => {
              if (!showFilters) {
                // Cargar datos de filtros solo cuando se abran
                await Promise.all([
                  loadStores(),
                  loadCategories(),
                  loadVehicleTypes()
                ]);
                // Cargar marcas solo si hay un tipo de vehículo seleccionado
                if (selectedVehicleType !== 'all') {
                  await loadBrands(selectedVehicleType);
                }
              }
              setShowFilters(!showFilters);
            }}
          >
            <Ionicons name="filter" size={20} color={showFilters ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, viewMode === 'table' && styles.controlButtonActive]}
            onPress={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
          >
            <Ionicons name={viewMode === 'table' ? 'grid' : 'list'} size={20} color={viewMode === 'table' ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Filters */}
      {showFilters && (
        <ScrollView 
          style={styles.filtersContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Tipo de Vehículo:</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('Todos', 'all', selectedVehicleType, () => setSelectedVehicleType('all'))}
            {(vehicleTypes || []).map(vehicleType => (
              <View key={vehicleType.name || vehicleType}>
                {renderFilterButton(
                  vehicleType.name || vehicleType, 
                  vehicleType.name || vehicleType, 
                  selectedVehicleType, 
                  () => setSelectedVehicleType(vehicleType.name || vehicleType)
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Marca:</Text>
          <View style={styles.filterButtons}>
            {selectedVehicleType === 'all' ? (
              <View style={styles.filterInfoContainer}>
                <Text style={styles.filterInfoText}>
                  Selecciona un tipo de vehículo para ver las marcas disponibles
                </Text>
              </View>
            ) : (
              <>
                {renderFilterButton('Todas', 'all', selectedBrand, () => setSelectedBrand('all'))}
                {(brands || []).map(brand => (
                  <View key={brand.name || brand}>
                    {renderFilterButton(
                      brand.name || brand, 
                      brand.name || brand, 
                      selectedBrand, 
                      () => setSelectedBrand(brand.name || brand)
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Categoría:</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('Todas', 'all', selectedCategory, () => setSelectedCategory('all'))}
            {(categories || []).map(category => (
              <View key={category.name || category}>
                {renderFilterButton(
                  category.name || category, 
                  category.name || category, 
                  selectedCategory, 
                  () => setSelectedCategory(category.name || category)
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Subcategoría:</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('Todas', 'all', selectedSubcategory, () => setSelectedSubcategory('all'))}
            {(subcategories || []).map(subcategory => (
              <View key={subcategory.name || subcategory}>
                {renderFilterButton(
                  subcategory.name || subcategory, 
                  subcategory.name || subcategory, 
                  selectedSubcategory, 
                  () => setSelectedSubcategory(subcategory.name || subcategory)
                )}
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Tienda:</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('Todas', 'all', selectedStore, () => setSelectedStore('all'))}
            {(stores || []).map(store => (
              <View key={store._id}>
                {renderFilterButton(store.name, store._id, selectedStore, () => setSelectedStore(store._id))}
              </View>
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
        </ScrollView>
      )}

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <View style={styles.productsContainer}>
          {viewMode === 'table' ? (
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Nombre</Text>
                <Text style={styles.tableHeaderText}>SKU</Text>
                <Text style={styles.tableHeaderText}>Precio</Text>
                <Text style={styles.tableHeaderText}>Stock</Text>
                <Text style={styles.tableHeaderText}>Tienda</Text>
                <Text style={styles.tableHeaderText}>Acciones</Text>
              </View>
              {/* Table Body */}
              <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
                {getPaginatedProducts().map((item, index) => renderTableRow(item, index))}
              </ScrollView>
            </View>
          ) : (
            <FlatList
              data={getPaginatedProducts()}
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
                  <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No se encontraron productos</Text>
                  <Text style={styles.emptyMessage}>
                    Intenta ajustar los filtros de búsqueda
                  </Text>
                </View>
              }
            />
          )}
          
          {/* Pagination */}
          {getTotalPages() > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#9CA3AF" : "#3B82F6"} />
              </TouchableOpacity>
              
              <Text style={styles.paginationText}>
                Página {currentPage} de {getTotalPages()}
              </Text>
              
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === getTotalPages() && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
              >
                <Ionicons name="chevron-forward" size={20} color={currentPage === getTotalPages() ? "#9CA3AF" : "#3B82F6"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    paddingVertical: 8,
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
    marginTop: 2,
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
    maxHeight: 400, // Limitar altura máxima para forzar scroll
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
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
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
  filterInfoContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
  },
  filterInfoText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
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
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FFB3B3',
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
  // Nuevos estilos para mejoras de UI
  controlButtons: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  controlButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  productsContainer: {
    flex: 1,
  },
  // Estilos para vista de tabla
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableCellText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tableActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  // Estilos para paginación
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paginationButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  paginationText: {
    fontSize: 14,
    color: '#374151',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  // Estilos para el header mejorado
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 12,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Estilos para botones de acción en productos
  featuredButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default AdminProductsScreen;
