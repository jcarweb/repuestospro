import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    image: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

const ReviewsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Datos de ejemplo
      const mockReviews: Review[] = [
        {
          _id: '1',
          product: {
            _id: 'p1',
            name: 'Filtro de Aceite Toyota Corolla',
            image: 'https://via.placeholder.com/80',
          },
          rating: 5,
          comment: 'Excelente producto, muy buena calidad y llegó en perfecto estado. Lo recomiendo totalmente.',
          createdAt: '2024-01-15T10:30:00Z',
          helpful: 12,
        },
        {
          _id: '2',
          product: {
            _id: 'p2',
            name: 'Pastillas de Freno Honda Civic',
            image: 'https://via.placeholder.com/80',
          },
          rating: 4,
          comment: 'Buen producto, funciona bien. La entrega fue rápida.',
          createdAt: '2024-01-14T15:45:00Z',
          helpful: 8,
        },
        {
          _id: '3',
          product: {
            _id: 'p3',
            name: 'Batería Automotriz 12V',
            image: 'https://via.placeholder.com/80',
          },
          rating: 5,
          comment: 'Perfecta, instalación fácil y funciona excelente. Muy recomendada.',
          createdAt: '2024-01-13T09:15:00Z',
          helpful: 15,
        },
        {
          _id: '4',
          product: {
            _id: 'p4',
            name: 'Aceite de Motor 5W-30',
            image: 'https://via.placeholder.com/80',
          },
          rating: 3,
          comment: 'Producto regular, cumple su función pero esperaba algo mejor.',
          createdAt: '2024-01-12T14:20:00Z',
          helpful: 3,
        },
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
      showToast('Error al cargar las reseñas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (selectedFilter === 'all') return true;
    return review.rating.toString() === selectedFilter;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color={colors.primary}
      />
    ));
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === filter ? colors.primary : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedFilter === filter ? '#000000' : colors.textPrimary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.textPrimary }]}>
            {item.product.name}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {item.rating}/5
            </Text>
          </View>
        </View>
        <Text style={[styles.reviewDate, { color: colors.textTertiary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={[styles.reviewComment, { color: colors.textPrimary }]}>
        {item.comment}
      </Text>
      
      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons name="thumbs-up-outline" size={16} color={colors.textTertiary} />
          <Text style={[styles.helpfulText, { color: colors.textTertiary }]}>
            Útil ({item.helpful})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando reseñas...
          </Text>
        </View>
      </View>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Mis Reseñas
          </Text>
          <View style={styles.ratingSummary}>
            <View style={styles.averageRating}>
              <Text style={[styles.averageRatingNumber, { color: colors.primary }]}>
                {averageRating}
              </Text>
              <View style={styles.averageStars}>
                {renderStars(Math.round(parseFloat(averageRating)))}
              </View>
            </View>
            <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>
              {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderFilterButton('all', 'Todas')}
            {renderFilterButton('5', '5 estrellas')}
            {renderFilterButton('4', '4 estrellas')}
            {renderFilterButton('3', '3 estrellas')}
            {renderFilterButton('2', '2 estrellas')}
            {renderFilterButton('1', '1 estrella')}
          </ScrollView>
        </View>

        {/* Lista de reseñas */}
        {filteredReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {selectedFilter === 'all' ? 'No tienes reseñas aún' : 'No hay reseñas con esta calificación'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              {selectedFilter === 'all' 
                ? 'Realiza compras y deja tus reseñas para verlas aquí'
                : 'Intenta con otro filtro'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.reviewsContainer}>
            <FlatList
              data={filteredReviews}
              renderItem={renderReviewItem}
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
    padding: 16,
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
  header: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingSummary: {
    alignItems: 'center',
  },
  averageRating: {
    alignItems: 'center',
    marginBottom: 8,
  },
  averageRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  averageStars: {
    flexDirection: 'row',
  },
  totalReviews: {
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 24,
  },
  reviewsContainer: {
    flex: 1,
  },
  reviewCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
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
  },
  helpfulText: {
    marginLeft: 4,
    fontSize: 12,
  },
});

export default ReviewsScreen;
