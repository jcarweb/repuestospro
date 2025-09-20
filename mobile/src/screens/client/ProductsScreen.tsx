import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Icon';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

const ProductsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'brand'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, searchQuery, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar productos y categorías en paralelo
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('http://192.168.0.110:5000/api/products'),
        fetch('http://192.168.0.110:5000/api/categories')
      ]);

      const productsResult = await productsResponse.json();
      const categoriesResult = await categoriesResponse.json();

      if (productsResult.success) {
        setProducts(productsResult.data);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
      );
    }

    // Ordenar productos
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'brand':
          aValue = a.brand.toLowerCase();
          bValue = b.brand.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => {
        // Navegar al detalle del producto
        // navigation.navigate('ProductDetail', { productId: item._id });
      }}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
          {item.brand}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          ${item.price.toFixed(2)}
        </Text>
        <View style={styles.productMeta}>
          <Text style={[styles.productCategory, { color: colors.textTertiary }]}>
            {item.category}
          </Text>
          <View style={[styles.stockIndicator, { backgroundColor: item.stock > 0 ? colors.success : colors.error }]}>
            <Text style={styles.stockText}>
              {item.stock > 0 ? `${item.stock} disponibles` : 'Sin stock'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { 
          backgroundColor: selectedCategory === item._id ? colors.primary : colors.surface,
          borderColor: colors.border 
        }
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item._id ? null : item._id)}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <Text 
        style={[
          styles.categoryName, 
          { color: selectedCategory === item._id ? '#000000' : colors.textPrimary }
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text 
        style={[
          styles.categoryCount, 
          { color: selectedCategory === item._id ? '#000000' : colors.textSecondary }
        ]}
      >
        {item.productCount} productos
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando productos...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Barra de búsqueda y filtros */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Icon name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtros de ordenamiento */}
        <View style={styles.filterContainer}>
          <View style={styles.sortContainer}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
              Ordenar por:
            </Text>
            <TouchableOpacity
              style={[styles.sortButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.sortButtonText, { color: sortBy === 'name' ? colors.primary : colors.textPrimary }]}>
                Nombre
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setSortBy('price')}
            >
              <Text style={[styles.sortButtonText, { color: sortBy === 'price' ? colors.primary : colors.textPrimary }]}>
                Precio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setSortBy('brand')}
            >
              <Text style={[styles.sortButtonText, { color: sortBy === 'brand' ? colors.primary : colors.textPrimary }]}>
                Marca
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: colors.primary }]}
            onPress={toggleSortOrder}
          >
            <Icon 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color="#000000" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categorías */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Categorías
          </Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Productos */}
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Productos
            </Text>
            <Text style={[styles.productCount, { color: colors.textSecondary }]}>
              {filteredProducts.length} productos
            </Text>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="grid-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No se encontraron productos
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Intenta cambiar los filtros o la búsqueda
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderButton: {
    padding: 8,
    borderRadius: 6,
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 10,
    textAlign: 'center',
  },
  productsSection: {
    flex: 1,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productCount: {
    fontSize: 14,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategory: {
    fontSize: 10,
    flex: 1,
  },
  stockIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
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

export default ProductsScreen;
