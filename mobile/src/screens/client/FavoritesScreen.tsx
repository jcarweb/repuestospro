import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Icon';

interface FavoriteProduct {
  _id: string;
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    brand: string;
    stock: number;
    isActive: boolean;
  };
  addedAt: string;
}

const FavoritesScreen: React.FC = () => {
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Aquí cargarías los favoritos desde el backend
      // Por ahora usamos datos de ejemplo
      const mockFavorites: FavoriteProduct[] = [
        {
          _id: 'f1',
          product: {
            _id: 'p1',
            name: 'Filtro de Aceite Toyota Corolla',
            description: 'Filtro de aceite de alta calidad para Toyota Corolla',
            price: 25.99,
            image: 'https://via.placeholder.com/150',
            category: 'Filtros',
            brand: 'Toyota',
            stock: 10,
            isActive: true,
          },
          addedAt: '2024-01-15T10:30:00Z',
        },
        {
          _id: 'f2',
          product: {
            _id: 'p2',
            name: 'Pastillas de Freno Honda Civic',
            description: 'Pastillas de freno cerámicas para Honda Civic',
            price: 45.50,
            image: 'https://via.placeholder.com/150',
            category: 'Frenos',
            brand: 'Honda',
            stock: 5,
            isActive: true,
          },
          addedAt: '2024-01-14T15:45:00Z',
        },
        {
          _id: 'f3',
          product: {
            _id: 'p3',
            name: 'Batería Automotriz 12V',
            description: 'Batería de 12V con 60 meses de garantía',
            price: 89.99,
            image: 'https://via.placeholder.com/150',
            category: 'Baterías',
            brand: 'Bosch',
            stock: 8,
            isActive: true,
          },
          addedAt: '2024-01-13T09:15:00Z',
        },
      ];
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (favoriteId: string) => {
    Alert.alert(
      'Eliminar de favoritos',
      '¿Estás seguro de que quieres eliminar este producto de tus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setFavorites(prev => prev.filter(fav => fav._id !== favoriteId));
          },
        },
      ]
    );
  };

  const addToCart = (product: any) => {
    Alert.alert(
      'Agregar al carrito',
      `¿Deseas agregar "${product.name}" al carrito?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar',
          onPress: () => {
            // Aquí agregarías el producto al carrito
            Alert.alert('Éxito', 'Producto agregado al carrito');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteProduct }) => (
    <View style={[styles.favoriteItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Image
        source={{ uri: item.product.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
          {item.product.brand}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          ${item.product.price.toFixed(2)}
        </Text>
        
        <View style={styles.productMeta}>
          <Text style={[styles.productCategory, { color: colors.textTertiary }]}>
            {item.product.category}
          </Text>
          <View style={[styles.stockIndicator, { backgroundColor: item.product.stock > 0 ? colors.success : colors.error }]}>
            <Text style={styles.stockText}>
              {item.product.stock > 0 ? `${item.product.stock} disponibles` : 'Sin stock'}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.addedDate, { color: colors.textTertiary }]}>
          Agregado el {formatDate(item.addedAt)}
        </Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => addToCart(item.product)}
          disabled={item.product.stock === 0}
        >
          <Icon name="cart-outline" size={16} color="#000000" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => removeFavorite(item._id)}
        >
          <Icon name="heart-dislike-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando favoritos...
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
            Mis Favoritos
          </Text>
          <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
            {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'} guardados
          </Text>
        </View>

        {/* Lista de favoritos */}
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="heart-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tienes favoritos aún
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Guarda productos que te gusten para encontrarlos fácilmente
            </Text>
            <TouchableOpacity
              style={[styles.shopButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Navegar a productos
                // navigation.navigate('Products');
              }}
            >
              <Text style={[styles.shopButtonText, { color: '#000000' }]}>
                Explorar Productos
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.favoritesContainer}>
            <FlatList
              data={favorites}
              renderItem={renderFavoriteItem}
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
  itemCount: {
    fontSize: 14,
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
  favoritesContainer: {
    paddingHorizontal: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
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
  addedDate: {
    fontSize: 11,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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

export default FavoritesScreen;
