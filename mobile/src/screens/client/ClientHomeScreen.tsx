import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { productService } from '../../services/productService';
import type { Product } from '../../services/productService';

interface SearchConfig {
  semanticSearchEnabled: boolean;
  semanticThreshold: number;
  typoCorrectionEnabled: boolean;
  maxEditDistance: number;
  minWordLength: number;
  searchableFields: string[];
  fieldWeights: Record<string, number>;
  filters: {
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
  };
}

const ClientHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchConfig, setSearchConfig] = useState<SearchConfig | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cargar productos y configuración de búsqueda
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar productos
      const productsResponse = await productService.getProducts({ limit: 50 });
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
        setFilteredProducts(productsResponse.data);
      } else {
        console.error('Error loading products:', productsResponse.error);
        showToast('Error al cargar productos', 'error');
      }
      
      // Cargar configuración de búsqueda (si está disponible)
      // Por ahora, usar configuración por defecto
      const defaultSearchConfig: SearchConfig = {
        semanticSearchEnabled: true,
        semanticThreshold: 0.7,
        typoCorrectionEnabled: true,
        maxEditDistance: 2,
        minWordLength: 3,
        searchableFields: ['name', 'description', 'category', 'brand'],
        fieldWeights: {
          name: 1.0,
          description: 0.8,
          category: 0.6,
          brand: 0.7
        },
        filters: {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 1000 }
        }
      };
      setSearchConfig(defaultSearchConfig);
      
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Función de búsqueda
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredProducts(products);
      setShowSuggestions(false);
      return;
    }

    // Búsqueda simple por ahora
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.brand?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProducts(filtered);
    setShowSuggestions(true);
  }, [products]);

  // Función de refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Navegar a detalles del producto
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail' as never, { product } as never);
  };

  // Renderizar item del producto
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productDetails}>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            ${item.price.toFixed(2)}
          </Text>
          <Text style={[styles.productStock, { color: colors.textSecondary }]}>
            Stock: {item.stock}
          </Text>
        </View>
        <View style={styles.productMeta}>
          <Text style={[styles.productCategory, { color: colors.textSecondary }]}>
            {item.category}
          </Text>
          {item.brand && (
            <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
              {item.brand}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renderizar header con búsqueda
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>
            ¡Hola, {user?.name || 'Usuario'}! 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Encuentra las mejores piezas para tu vehículo
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <Ionicons name="cart-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar productos..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Renderizar loading
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
            Cargando productos...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
              {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.primary }]}
                onPress={() => handleSearch('')}
              >
                <Text style={styles.clearButtonText}>Limpiar búsqueda</Text>
              </TouchableOpacity>
            )}
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
  header: {
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productStock: {
    fontSize: 12,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  productBrand: {
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClientHomeScreen;