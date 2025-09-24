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
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';


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

interface SearchConfig {
  semanticSearchEnabled: boolean;
  semanticThreshold: number;
  typoCorrectionEnabled: boolean;
  maxEditDistance: number;
  minWordLength: number;
  searchableFields: string[];
  fieldWeights: Record<string, number>;
  maxResults: number;
  minRelevanceScore: number;
  autocompleteEnabled: boolean;
  autocompleteMinLength: number;
  autocompleteMaxSuggestions: number;
}

const ClientHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchConfig, setSearchConfig] = useState<SearchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Datos mock para evitar errores de red
  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Filtro de Aceite Motor',
      description: 'Filtro de aceite de alta calidad para motores de gasolina y diesel',
      price: 25.99,
      image: 'https://via.placeholder.com/150/FFC300/000000?text=Filtro',
      category: 'Filtros',
      brand: 'Bosch',
      stock: 50,
      isActive: true,
    },
    {
      _id: '2',
      name: 'Pastillas de Freno Delanteras',
      description: 'Pastillas de freno cerámicas para mejor rendimiento',
      price: 45.50,
      image: 'https://via.placeholder.com/150/FFC300/000000?text=Pastillas',
      category: 'Frenos',
      brand: 'Brembo',
      stock: 30,
      isActive: true,
    },
    {
      _id: '3',
      name: 'Batería Automotriz 12V',
      description: 'Batería de 60Ah con garantía de 2 años',
      price: 89.99,
      image: 'https://via.placeholder.com/150/FFC300/000000?text=Bateria',
      category: 'Baterías',
      brand: 'ACDelco',
      stock: 15,
      isActive: true,
    },
    {
      _id: '4',
      name: 'Aceite de Motor 5W-30',
      description: 'Aceite sintético de alto rendimiento',
      price: 32.75,
      image: 'https://via.placeholder.com/150/FFC300/000000?text=Aceite',
      category: 'Lubricantes',
      brand: 'Mobil',
      stock: 100,
      isActive: true,
    },
    {
      _id: '5',
      name: 'Radiador de Motor',
      description: 'Radiador de aluminio para mejor disipación de calor',
      price: 120.00,
      image: 'https://via.placeholder.com/150/FFC300/000000?text=Radiador',
      category: 'Sistema de Enfriamiento',
      brand: 'Denso',
      stock: 8,
      isActive: true,
    },
    {
      _id: '6',
      name: 'Amortiguadores Delanteros',
      description: 'Amortiguadores de gas para mejor estabilidad',
      price: 85.25,
      image: 'https://via.placeholder.com/150/FFC300/000000?text=Amortiguadores',
      category: 'Suspensión',
      brand: 'KYB',
      stock: 20,
      isActive: true,
    },
  ];

  const mockSearchConfig: SearchConfig = {
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
      brand: 0.7,
    },
    maxResults: 50,
    minRelevanceScore: 0.3,
    autocompleteEnabled: true,
    autocompleteMinLength: 2,
    autocompleteMaxSuggestions: 5,
  };

  // Cargar configuración de búsqueda y productos al iniciar
  useEffect(() => {
    loadSearchConfig();
    loadProducts();
  }, []);

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
      setShowSuggestions(false);
    } else {
      performSearch(searchQuery);
      generateSuggestions(searchQuery);
    }
  }, [searchQuery, products, searchConfig]);

  const loadSearchConfig = async () => {
    try {
      // Usar configuración mock en lugar de hacer request
      setSearchConfig(mockSearchConfig);
    } catch (error) {
      console.error('Error cargando configuración de búsqueda:', error);
      // Fallback a configuración básica
      setSearchConfig(mockSearchConfig);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Usar el servicio de API real para obtener productos
      const response = await apiService.getProducts({ limit: 20 });
      
      if (response.success && response.data) {
        setProducts(response.data);
        setFilteredProducts(response.data);
        console.log('✅ Productos cargados desde la base de datos:', response.data.length);
      } else {
        console.warn('⚠️ No se pudieron cargar productos, usando fallback');
        // Fallback a productos mock solo si falla la conexión
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      // Fallback a productos mock solo en caso de error
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    if (!searchConfig || query.trim().length < searchConfig.autocompleteMinLength) {
      setFilteredProducts(products);
      return;
    }

    try {
      setSearching(true);
      
      // Usar el servicio de API real para buscar productos
      const response = await apiService.getProducts({ 
        search: query,
        limit: searchConfig.maxResults || 20
      });

      if (response.success && response.data) {
        setFilteredProducts(response.data);
        console.log('✅ Búsqueda exitosa:', response.data.length, 'productos encontrados');
      } else {
        // Si falla la búsqueda, usar búsqueda simple local
        performSimpleSearch(query);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      // Fallback a búsqueda simple local
      performSimpleSearch(query);
    } finally {
      setSearching(false);
    }
  };

  const performSimpleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = products.filter(product => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.brand,
      ].join(' ').toLowerCase();
      
      return searchableText.includes(lowerQuery);
    });
    
    setFilteredProducts(filtered);
  };

  const generateSuggestions = (query: string) => {
    if (!searchConfig?.autocompleteEnabled || query.length < searchConfig.autocompleteMinLength) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = products
      .map(product => product.name)
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, searchConfig.autocompleteMaxSuggestions);

    setSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => {
        // Navegar al detalle del producto
        // navigation.navigate('ProductDetail', { productId: item._id });
        showToast(`Navegando a ${item.name}`, 'info');
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

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: colors.surfaceSecondary }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons name="search" size={16} color={colors.textTertiary} />
      <Text style={[styles.suggestionText, { color: colors.textPrimary }]} numberOfLines={1}>
        {item}
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
      {/* Barra de búsqueda */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => setShowSuggestions(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Sugerencias de autocompletado */}
        {showSuggestions && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface }]}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => `suggestion-${index}`}
              style={styles.suggestionsList}
            />
          </View>
        )}
      </View>

      

      {/* Contenido principal con FlatList única */}
      {searching ? (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.searchingText, { color: colors.textSecondary }]}>
            Buscando productos...
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
          ListHeaderComponent={
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
              <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>
                ¡Bienvenido a PiezasYA!
              </Text>
              <Text style={[styles.statsText, { color: colors.textSecondary }]}>
                {filteredProducts.length} productos encontrados
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No se encontraron productos
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Intenta con otros términos de búsqueda
              </Text>
            </View>
          }
        />
      )}
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 8,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchingText: {
    marginTop: 12,
    fontSize: 16,
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

export default ClientHomeScreen;
