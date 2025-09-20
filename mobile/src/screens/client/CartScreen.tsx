import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Icon';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  quantity: number;
}

const CartScreen: React.FC = () => {
  const { colors } = useTheme();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      // Aquí cargarías el carrito desde el backend
      // Por ahora usamos datos de ejemplo
      const mockCartItems: CartItem[] = [
        {
          _id: '1',
          product: {
            _id: 'p1',
            name: 'Filtro de Aceite Toyota',
            price: 25.99,
            image: 'https://via.placeholder.com/100',
            stock: 10,
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
            stock: 5,
          },
          quantity: 1,
        },
      ];
      setCartItems(mockCartItems);
    } catch (error) {
      console.error('Error cargando carrito:', error);
      Alert.alert('Error', 'No se pudo cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item._id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setCartItems(prev => prev.filter(item => item._id !== itemId));
          },
        },
      ]
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 50 ? 0 : 5.99; // Envío gratis sobre $50
    const tax = subtotal * 0.16; // 16% IVA
    return subtotal + shipping + tax;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de continuar');
      return;
    }
    
    Alert.alert(
      'Proceder al checkout',
      '¿Deseas continuar con la compra?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => {
          // Navegar al checkout
          // navigation.navigate('Checkout');
        }},
      ]
    );
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item._id} style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Image
        source={{ uri: item.product.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          ${item.product.price.toFixed(2)}
        </Text>
        <Text style={[styles.stockInfo, { color: colors.textSecondary }]}>
          Stock: {item.product.stock} disponibles
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => updateQuantity(item._id, item.quantity - 1)}
        >
          <Icon name="remove" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.quantityText, { color: colors.textPrimary }]}>
          {item.quantity}
        </Text>
        
        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => updateQuantity(item._id, item.quantity + 1)}
          disabled={item.quantity >= item.product.stock}
        >
          <Icon name="add" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemActions}>
        <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
          ${(item.product.price * item.quantity).toFixed(2)}
        </Text>
        
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error }]}
          onPress={() => removeItem(item._id)}
        >
          <Icon name="trash-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando carrito...
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
            Carrito de Compras
          </Text>
          <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
          </Text>
        </View>

        {/* Lista de productos */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="cart-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tu carrito está vacío
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Agrega productos para comenzar a comprar
            </Text>
            <TouchableOpacity
              style={[styles.shopButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Navegar a productos
                // navigation.navigate('Products');
              }}
            >
              <Text style={[styles.shopButtonText, { color: '#000000' }]}>
                Ir a Productos
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cartItemsContainer}>
              {cartItems.map(renderCartItem)}
            </View>

            {/* Resumen de compra */}
            <View style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                Resumen de Compra
              </Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Subtotal
                </Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                  ${calculateSubtotal().toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Envío
                </Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                  {calculateSubtotal() > 50 ? 'Gratis' : '$5.99'}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  IVA (16%)
                </Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                  ${(calculateSubtotal() * 0.16).toFixed(2)}
                </Text>
              </View>
              
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  ${calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Botón de checkout */}
      {cartItems.length > 0 && (
        <View style={[styles.checkoutContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
            onPress={handleCheckout}
          >
            <Text style={[styles.checkoutButtonText, { color: '#000000' }]}>
              Proceder al Checkout
            </Text>
            <Text style={[styles.checkoutTotal, { color: '#000000' }]}>
              ${calculateTotal().toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  cartItemsContainer: {
    paddingHorizontal: 16,
  },
  cartItem: {
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
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutTotal: {
    fontSize: 18,
    fontWeight: 'bold',
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

export default CartScreen;
