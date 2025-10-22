import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Bonus {
  id: string;
  type: 'weekly' | 'performance' | 'loyalty' | 'speed' | 'volume' | 'special';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'paid';
  date: string;
  level: 'bronze' | 'silver' | 'gold' | 'elite';
}

interface BonusStats {
  totalBonuses: number;
  weeklyBonuses: number;
  monthlyBonuses: number;
  level: 'bronze' | 'silver' | 'gold' | 'elite';
  nextLevelProgress: number;
  nextLevelRequired: number;
}

interface LogisticBonusesProps {
  navigation: any;
}

const LogisticBonuses: React.FC<LogisticBonusesProps> = ({ navigation }) => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [stats, setStats] = useState<BonusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'weekly' | 'performance' | 'special'>('all');

  useEffect(() => {
    fetchBonuses();
  }, []);

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      // Simular datos de bonos
      const mockBonuses: Bonus[] = [
        {
          id: '1',
          type: 'weekly',
          amount: 36,
          description: 'Bono semanal nivel Silver',
          status: 'paid',
          date: '2024-01-15',
          level: 'silver'
        },
        {
          id: '2',
          type: 'performance',
          amount: 15,
          description: 'Bono por rendimiento excepcional',
          status: 'paid',
          date: '2024-01-14',
          level: 'silver'
        },
        {
          id: '3',
          type: 'speed',
          amount: 5,
          description: 'Bono por entrega rápida',
          status: 'paid',
          date: '2024-01-13',
          level: 'silver'
        },
        {
          id: '4',
          type: 'special',
          amount: 25,
          description: 'Bono especial por rating perfecto',
          status: 'approved',
          date: '2024-01-12',
          level: 'silver'
        },
        {
          id: '5',
          type: 'loyalty',
          amount: 10,
          description: 'Bono de fidelidad',
          status: 'pending',
          date: '2024-01-11',
          level: 'silver'
        }
      ];

      const mockStats: BonusStats = {
        totalBonuses: 91,
        weeklyBonuses: 36,
        monthlyBonuses: 150,
        level: 'silver',
        nextLevelProgress: 25,
        nextLevelRequired: 40
      };

      setBonuses(mockBonuses);
      setStats(mockStats);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los bonos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBonuses();
    setRefreshing(false);
  };

  const getBonusIcon = (type: string) => {
    switch (type) {
      case 'weekly': return 'calendar';
      case 'performance': return 'trending-up';
      case 'loyalty': return 'heart';
      case 'speed': return 'flash';
      case 'volume': return 'bar-chart';
      case 'special': return 'star';
      default: return 'gift';
    }
  };

  const getBonusColor = (type: string) => {
    switch (type) {
      case 'weekly': return '#3B82F6';
      case 'performance': return '#10B981';
      case 'loyalty': return '#F59E0B';
      case 'speed': return '#EF4444';
      case 'volume': return '#8B5CF6';
      case 'special': return '#F97316';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'approved': return '#3B82F6';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'elite': return '#8A2BE2';
      default: return '#6B7280';
    }
  };

  const filteredBonuses = bonuses.filter(bonus => {
    if (selectedFilter === 'all') return true;
    return bonus.type === selectedFilter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando bonos...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los datos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBonuses}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con estadísticas */}
      <LinearGradient
        colors={[getLevelColor(stats.level), getLevelColor(stats.level) + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>Nivel Actual</Text>
            <Text style={styles.levelText}>{stats.level.toUpperCase()}</Text>
          </View>
          <View style={styles.bonusInfo}>
            <Text style={styles.bonusLabel}>Bonos Totales</Text>
            <Text style={styles.bonusAmount}>${stats.totalBonuses}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Progreso al siguiente nivel */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Progreso al siguiente nivel</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(stats.nextLevelProgress / stats.nextLevelRequired) * 100}%`,
                backgroundColor: getLevelColor(stats.level)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {stats.nextLevelProgress} / {stats.nextLevelRequired} entregas
        </Text>
      </View>

      {/* Estadísticas de bonos */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>${stats.weeklyBonuses}</Text>
          <Text style={styles.statLabel}>Esta semana</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#10B981" />
          <Text style={styles.statValue}>${stats.monthlyBonuses}</Text>
          <Text style={styles.statLabel}>Este mes</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="gift" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{bonuses.length}</Text>
          <Text style={styles.statLabel}>Bonos totales</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtrar por tipo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {[
              { key: 'all', label: 'Todos', icon: 'list' },
              { key: 'weekly', label: 'Semanales', icon: 'calendar' },
              { key: 'performance', label: 'Rendimiento', icon: 'trending-up' },
              { key: 'special', label: 'Especiales', icon: 'star' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={16} 
                  color={selectedFilter === filter.key ? 'white' : '#6B7280'} 
                />
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Lista de bonos */}
      <View style={styles.bonusesContainer}>
        <Text style={styles.bonusesTitle}>Historial de Bonos</Text>
        
        {filteredBonuses.map((bonus) => (
          <View key={bonus.id} style={styles.bonusCard}>
            <View style={styles.bonusHeader}>
              <View style={styles.bonusIconContainer}>
                <Ionicons 
                  name={getBonusIcon(bonus.type) as any} 
                  size={20} 
                  color={getBonusColor(bonus.type)} 
                />
              </View>
              <View style={styles.bonusInfo}>
                <Text style={styles.bonusDescription}>{bonus.description}</Text>
                <Text style={styles.bonusDate}>{bonus.date}</Text>
              </View>
              <View style={styles.bonusAmountContainer}>
                <Text style={styles.bonusAmount}>+${bonus.amount}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(bonus.status) }
                ]}>
                  <Text style={styles.statusText}>{getStatusText(bonus.status)}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Información sobre bonos */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>¿Cómo funcionan los bonos?</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={20} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoItemTitle}>Bonos Semanales</Text>
            <Text style={styles.infoItemText}>
              Se calculan automáticamente cada domingo basados en tu nivel y entregas de la semana.
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="trending-up" size={20} color="#10B981" />
          <View style={styles.infoContent}>
            <Text style={styles.infoItemTitle}>Bonos de Rendimiento</Text>
            <Text style={styles.infoItemText}>
              Se otorgan por entregas rápidas, rating alto y confiabilidad excepcional.
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoItemTitle}>Bonos Especiales</Text>
            <Text style={styles.infoItemText}>
              Se otorgan por logros especiales como rating perfecto o volumen excepcional.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  levelText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  bonusInfo: {
    alignItems: 'flex-end',
  },
  bonusLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  bonusAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  bonusesContainer: {
    margin: 16,
  },
  bonusesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  bonusCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bonusInfo: {
    flex: 1,
  },
  bonusDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bonusDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bonusAmountContainer: {
    alignItems: 'flex-end',
  },
  bonusAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  infoContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoItemText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default LogisticBonuses;
