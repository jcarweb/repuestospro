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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  isActive: boolean;
  specifications: Record<string, string>;
  features: string[];
  warranty: string;
  shipping: string;
  rating: number;
  reviewCount: number;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  helpful: number;
  images?: string[];
}

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // Mock data
  const mockProduct: Product = {
    _id: '1',
    name: 'Filtro de Aceite Motor Premium',
    description: 'Filtro de aceite de alta calidad diseñado para motores de gasolina y diesel. Proporciona una filtración superior que protege el motor de partículas dañinas y prolonga la vida útil del aceite.',
    price: 25.99,
    originalPrice: 32.99,
    images: [
      'https://via.placeholder.com/400/FFC300/000000?text=Filtro+1',
      'https://via.placeholder.com/400/FFC300/000000?text=Filtro+2',
      'https://via.placeholder.com/400/FFC300/000000?text=Filtro+3',
    ],
    category: 'Filtros',
    brand: 'Bosch',
    stock: 50,
    isActive: true,
    specifications: {
      'Tipo de Filtro': 'Aceite Motor',
      'Material': 'Papel Sintético',
      'Capacidad': 'Hasta 5L',
      'Compatibilidad': 'Gasolina y Diesel',
      'Presión Máxima': '10 bar',
      'Temperatura': '-40°C a +120°C',
    },
    features: [
      'Filtración de alta eficiencia',
      'Resistente a altas temperaturas',
      'Válvula de bypass integrada',
      'Juntas de sellado premium',
      'Compatibilidad universal',
    ],
    warranty: '2 años de garantía',
    shipping: 'Envío gratis en pedidos superiores a $50',
    rating: 4.5,
    reviewCount: 127,
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Carlos M.',
      rating: 5,
      comment: 'Excelente filtro, muy buena calidad. Se nota la diferencia en el rendimiento del motor.',
      date: new Date(Date.now() - 86400000),
      helpful: 12,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'María L.',
      rating: 4,
      comment: 'Buen producto, fácil de instalar. El precio está bien para la calidad que ofrece.',
      date: new Date(Date.now() - 172800000),
      helpful: 8,
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Roberto S.',
      rating: 5,
      comment: 'Perfecto para mi Toyota. El motor funciona más suave y el aceite se mantiene limpio por más tiempo.',
      date: new Date(Date.now() - 259200000),
      helpful: 15,
    },
  ];

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProduct(mockProduct);
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error cargando producto:', error);
      showToast('Error al cargar el producto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (quantity > product!.stock) {
      showToast('Cantidad no disponible', 'error');
      return;
    }

    // Aquí se agregaría la lógica para añadir al carrito
    showToast(`${quantity} ${product!.name} agregado al carrito`, 'success');
  };

  const handleBuyNow = () => {
    if (quantity > product!.stock) {
      showToast('Cantidad no disponible', 'error');
      return;
    }

    // Aquí se navegaría al checkout
    showToast('Procediendo al pago...', 'success');
  };

  const handleChatWithCompany = () => {
    if (!product) return;
    
    // Navegar al chat con la empresa específica
    // navigation.navigate('Chat', { 
    //   companyId: product.brand,
    //   productId: product._id,
    //   productName: product.name 
    // });
    
    showToast(`Iniciando chat con ${product.brand} sobre ${product.name}...`, 'info');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(
      isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      'success'
    );
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? colors.primary : colors.textTertiary}
          />
        ))}
      </View>
    );
  };

  const renderImageCarousel = () => {
    if (!product) return null;

    return (
      <View style={styles.imageSection}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
        >
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {/* Indicadores de imagen */}
        <View style={styles.imageIndicators}>
          {product.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === selectedImageIndex ? colors.primary : colors.textTertiary,
                }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>
            {item.userName}
          </Text>
          <Text style={[styles.reviewDate, { color: colors.textTertiary }]}>
            {item.date.toLocaleDateString()}
          </Text>
        </View>
        {renderStars(item.rating)}
      </View>
      
      <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
        {item.comment}
      </Text>
      
      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Icon name="thumbs-up-outline" size={16} color={colors.textTertiary} />
          <Text style={[styles.helpfulText, { color: colors.textTertiary }]}>
            Útil ({item.helpful})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando producto...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Icon name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Producto no encontrado
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imágenes del producto */}
        {renderImageCarousel()}

        {/* Información del producto */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={[styles.productName, { color: colors.textPrimary }]}>
                {product.name}
              </Text>
              <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
                {product.brand}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <Icon
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? colors.error : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Precio y calificación */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.primary }]}>
                ${product.price.toFixed(2)}
              </Text>
              {product.originalPrice && (
                <Text style={[styles.originalPrice, { color: colors.textTertiary }]}>
                  ${product.originalPrice.toFixed(2)}
                </Text>
              )}
            </View>
            <View style={styles.ratingContainer}>
              {renderStars(product.rating)}
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                ({product.reviewCount})
              </Text>
            </View>
          </View>

          {/* Stock */}
          <View style={styles.stockContainer}>
            <View style={[styles.stockIndicator, { backgroundColor: product.stock > 0 ? colors.success : colors.error }]}>
              <Text style={styles.stockText}>
                {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
              </Text>
            </View>
          </View>

          {/* Selector de cantidad */}
          <View style={styles.quantitySection}>
            <Text style={[styles.quantityLabel, { color: colors.textPrimary }]}>
              Cantidad:
            </Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="remove" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.textPrimary }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Icon name="add" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
              onPress={handleAddToCart}
            >
              <Icon name="cart-outline" size={20} color={colors.primary} />
              <Text style={[styles.addToCartText, { color: colors.primary }]}>
                Agregar al Carrito
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.buyNowButton, { backgroundColor: colors.primary }]}
              onPress={handleBuyNow}
            >
              <Icon name="flash" size={20} color="white" />
              <Text style={styles.buyNowText}>
                Comprar Ahora
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón de Chat con la Empresa */}
          <TouchableOpacity
            style={[styles.chatButton, { backgroundColor: colors.success, borderColor: colors.success }]}
            onPress={handleChatWithCompany}
          >
            <Icon name="chatbubbles-outline" size={20} color="white" />
            <Text style={styles.chatButtonText}>
              Chat con {product.brand}
            </Text>
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>En línea</Text>
            </View>
            <View style={styles.chatIcon}>
              <Icon name="information-circle" size={16} color="white" />
            </View>
          </TouchableOpacity>

          {/* Tabs de información */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'description' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('description')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'description' ? colors.primary : colors.textSecondary }
              ]}>
                Descripción
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'specifications' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('specifications')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'specifications' ? colors.primary : colors.textSecondary }
              ]}>
                Especificaciones
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'reviews' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'reviews' ? colors.primary : colors.textSecondary }
              ]}>
                Reseñas ({reviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido de tabs */}
          <View style={styles.tabContent}>
            {activeTab === 'description' && (
              <View>
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  {product.description}
                </Text>
                
                <Text style={[styles.featuresTitle, { color: colors.textPrimary }]}>
                  Características principales:
                </Text>
                {product.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Icon name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
                
                <View style={styles.infoCards}>
                  <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Icon name="shield-checkmark" size={24} color={colors.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.textPrimary }]}>
                      Garantía
                    </Text>
                    <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                      {product.warranty}
                    </Text>
                  </View>
                  
                  <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Icon name="car" size={24} color={colors.primary} />
                    <Text style={[styles.infoCardTitle, { color: colors.textPrimary }]}>
                      Envío
                    </Text>
                    <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                      {product.shipping}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'specifications' && (
              <View>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specItem}>
                    <Text style={[styles.specKey, { color: colors.textPrimary }]}>
                      {key}
                    </Text>
                    <Text style={[styles.specValue, { color: colors.textSecondary }]}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'reviews' && (
              <View>
                <View style={styles.reviewsHeader}>
                  <View style={styles.overallRating}>
                    <Text style={[styles.overallRatingText, { color: colors.textPrimary }]}>
                      {product.rating.toFixed(1)}
                    </Text>
                    {renderStars(product.rating, 20)}
                    <Text style={[styles.overallRatingCount, { color: colors.textSecondary }]}>
                      {product.reviewCount} reseñas
                    </Text>
                  </View>
                </View>
                
                <FlatList
                  data={reviews}
                  renderItem={renderReview}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  imageSection: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 8,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
  },
  stockContainer: {
    marginBottom: 16,
  },
  stockIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stockText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buyNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 12,
    position: 'relative',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatBadge: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chatBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  chatIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 200,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 12,
    textAlign: 'center',
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  specKey: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  reviewsHeader: {
    marginBottom: 20,
  },
  overallRating: {
    alignItems: 'center',
  },
  overallRatingText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overallRatingCount: {
    fontSize: 14,
    marginTop: 8,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpfulText: {
    fontSize: 12,
  },
});

export default ProductDetailScreen;
