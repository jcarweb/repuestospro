import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { deliveryService } from '../../services/deliveryService';

interface Rating {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  categories: {
    punctuality: number;
    service: number;
    communication: number;
    packaging: number;
  };
  isVerified: boolean;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categoryAverages: {
    punctuality: number;
    service: number;
    communication: number;
    packaging: number;
  };
  recentTrend: 'up' | 'down' | 'stable';
}

const DeliveryRatingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    categoryAverages: { punctuality: 0, service: 0, communication: 0, packaging: 0 },
    recentTrend: 'stable'
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRatings = async () => {
    try {
      setLoading(true);
      
      const response = await deliveryService.getDeliveryRatings();
      
      if (response.success && response.data) {
        setRatings(response.data.ratings || []);
        setStats(response.data.stats || {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          categoryAverages: { punctuality: 0, service: 0, communication: 0, packaging: 0 },
          recentTrend: 'stable'
        });
        console.log('✅ Calificaciones del delivery cargadas:', response.data);
      } else {
        console.warn('⚠️ No se pudieron cargar las calificaciones, usando datos por defecto');
        setRatings([]);
        setStats({
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          categoryAverages: { punctuality: 0, service: 0, communication: 0, packaging: 0 },
          recentTrend: 'stable'
        });
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      showToast('Error al cargar calificaciones', 'error');
      
      // Datos por defecto en caso de error
      setRatings([]);
      setStats({
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categoryAverages: { punctuality: 0, service: 0, communication: 0, packaging: 0 },
        recentTrend: 'stable'
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRatings();
    setRefreshing(false);
  };

  const replyToRating = (rating: Rating) => {
    Alert.alert(
      'Responder Calificación',
      `¿Deseas responder a la calificación de ${rating.customerName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Responder', onPress: () => {
          // TODO: Implementar respuesta a calificación
          showToast('Funcionalidad de respuesta próximamente', 'info');
        }}
      ]
    );
  };

  const reportRating = (rating: Rating) => {
    Alert.alert(
      'Reportar Calificación',
      '¿Deseas reportar esta calificación como inapropiada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reportar', style: 'destructive', onPress: () => {
          showToast('Calificación reportada', 'success');
        }}
      ]
    );
  };

  useEffect(() => {
    loadRatings();
  }, []);

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={size}
        color="#FFD60A"
        style={{ marginRight: 2 }}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#34C759';
    if (rating >= 3.5) return '#FF9500';
    if (rating >= 2.5) return '#FFD60A';
    return '#FF3B30';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#34C759';
      case 'down': return '#FF3B30';
      default: return colors.textSecondary;
    }
  };

  const filteredRatings = ratings.filter(rating => 
    selectedFilter === 'all' || rating.rating.toString() === selectedFilter
  );

  const RatingCard = ({ rating }: { rating: Rating }) => (
    <View style={[styles.ratingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.ratingHeader}>
        <View style={styles.customerInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {rating.customerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={[styles.customerName, { color: colors.textPrimary }]}>
              {rating.customerName}
            </Text>
            <Text style={[styles.orderNumber, { color: colors.textSecondary }]}>
              {rating.orderNumber}
            </Text>
          </View>
        </View>
        <View style={styles.ratingInfo}>
          <View style={styles.starsContainer}>
            {renderStars(rating.rating)}
          </View>
          <Text style={[styles.ratingValue, { color: getRatingColor(rating.rating) }]}>
            {rating.rating}/5
          </Text>
        </View>
      </View>

      {rating.comment && (
        <Text style={[styles.comment, { color: colors.textPrimary }]}>
          "{rating.comment}"
        </Text>
      )}

      <View style={styles.categoriesContainer}>
        <View style={styles.categoryRow}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Puntualidad
          </Text>
          <View style={styles.categoryRating}>
            {renderStars(rating.categories.punctuality, 12)}
            <Text style={[styles.categoryValue, { color: colors.textSecondary }]}>
              {rating.categories.punctuality}
            </Text>
          </View>
        </View>
        <View style={styles.categoryRow}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Servicio
          </Text>
          <View style={styles.categoryRating}>
            {renderStars(rating.categories.service, 12)}
            <Text style={[styles.categoryValue, { color: colors.textSecondary }]}>
              {rating.categories.service}
            </Text>
          </View>
        </View>
        <View style={styles.categoryRow}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Comunicación
          </Text>
          <View style={styles.categoryRating}>
            {renderStars(rating.categories.communication, 12)}
            <Text style={[styles.categoryValue, { color: colors.textSecondary }]}>
              {rating.categories.communication}
            </Text>
          </View>
        </View>
        <View style={styles.categoryRow}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Empaque
          </Text>
          <View style={styles.categoryRating}>
            {renderStars(rating.categories.packaging, 12)}
            <Text style={[styles.categoryValue, { color: colors.textSecondary }]}>
              {rating.categories.packaging}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.ratingFooter}>
        <View style={styles.ratingMeta}>
          <Text style={[styles.ratingDate, { color: colors.textTertiary }]}>
            {new Date(rating.date).toLocaleDateString('es-VE', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          {rating.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: '#34C759' + '20' }]}>
              <Ionicons name="checkmark-circle" size={12} color="#34C759" />
              <Text style={[styles.verifiedText, { color: '#34C759' }]}>
                Verificada
              </Text>
            </View>
          )}
        </View>
        <View style={styles.ratingActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => replyToRating(rating)}
          >
            <Ionicons name="chatbubble" size={14} color="white" />
            <Text style={styles.actionButtonText}>Responder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => reportRating(rating)}
          >
            <Ionicons name="flag" size={14} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Reportar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const FilterButton = ({ filter, label }: { filter: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { 
          backgroundColor: selectedFilter === filter ? colors.primary : colors.surface,
          borderColor: colors.border
        }
      ]}
      onPress={() => setSelectedFilter(filter as any)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: selectedFilter === filter ? 'white' : colors.textPrimary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtitle 
  }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    subtitle?: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando calificaciones...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Mis Calificaciones
            </Text>
            <View style={styles.headerStats}>
              <View style={styles.averageRating}>
                <Text style={[styles.averageValue, { color: getRatingColor(stats.averageRating) }]}>
                  {stats.averageRating.toFixed(1)}
                </Text>
                <View style={styles.starsContainer}>
                  {renderStars(Math.round(stats.averageRating))}
                </View>
              </View>
              <View style={styles.trendIndicator}>
                <Ionicons 
                  name={getTrendIcon(stats.recentTrend)} 
                  size={16} 
                  color={getTrendColor(stats.recentTrend)} 
                />
                <Text style={[styles.trendText, { color: getTrendColor(stats.recentTrend) }]}>
                  {stats.recentTrend === 'up' ? 'Subiendo' : stats.recentTrend === 'down' ? 'Bajando' : 'Estable'}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.totalRatings, { color: colors.textSecondary }]}>
            {stats.totalRatings} calificaciones
          </Text>
        </View>
      </View>

      {/* Stats Overview */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
      >
        <StatCard
          title="Calificación Promedio"
          value={`${stats.averageRating.toFixed(1)}/5`}
          icon="star"
          color="#FFD60A"
        />
        <StatCard
          title="Total Calificaciones"
          value={stats.totalRatings}
          icon="people"
          color="#007AFF"
        />
        <StatCard
          title="Calificaciones 5★"
          value={stats.ratingDistribution[5]}
          icon="thumbs-up"
          color="#34C759"
          subtitle={`${((stats.ratingDistribution[5] / stats.totalRatings) * 100).toFixed(0)}%`}
        />
        <StatCard
          title="Puntualidad"
          value={`${stats.categoryAverages.punctuality.toFixed(1)}/5`}
          icon="time"
          color="#FF9500"
        />
      </ScrollView>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterButton filter="all" label="Todas" />
        <FilterButton filter="5" label="5 Estrellas" />
        <FilterButton filter="4" label="4 Estrellas" />
        <FilterButton filter="3" label="3 Estrellas" />
        <FilterButton filter="2" label="2 Estrellas" />
        <FilterButton filter="1" label="1 Estrella" />
      </ScrollView>

      {/* Ratings List */}
      <FlatList
        data={filteredRatings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RatingCard rating={item} />}
        contentContainerStyle={styles.ratingsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay calificaciones {selectedFilter !== 'all' ? `con ${selectedFilter} estrellas` : 'disponibles'}
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  totalRatings: {
    fontSize: 14,
  },
  statsContainer: {
    maxHeight: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 9,
    textAlign: 'center',
  },
  filtersContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingsList: {
    padding: 16,
    gap: 16,
  },
  ratingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 12,
  },
  ratingInfo: {
    alignItems: 'flex-end',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    flex: 1,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingMeta: {
    flex: 1,
  },
  ratingDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  ratingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DeliveryRatingsScreen;
