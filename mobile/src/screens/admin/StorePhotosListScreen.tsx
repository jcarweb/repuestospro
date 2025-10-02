import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

interface StorePhoto {
  _id: string;
  name: string;
  phone?: string;
  imageUrl: string;
  lat: number;
  lng: number;
  ocrText?: string;
  metrics: {
    mercadoLibre?: {
      found: boolean;
      results?: any[];
      searchTerm?: string;
      lastUpdated?: string;
    };
    duckduckgo?: {
      found: boolean;
      results?: any;
      searchTerm?: string;
      lastUpdated?: string;
    };
    instagram?: {
      found: boolean;
      followers?: number;
      username?: string;
      lastUpdated?: string;
    };
    whatsapp?: {
      found: boolean;
      businessInfo?: any;
      lastUpdated?: string;
    };
  };
  status: 'pending' | 'processing' | 'enriched' | 'error';
  errorMessage?: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EnrichmentStats {
  total: number;
  byStatus: {
    pending?: number;
    processing?: number;
    enriched?: number;
    error?: number;
  };
  isRunning: boolean;
}

const StorePhotosListScreen: React.FC = () => {
  const [photos, setPhotos] = useState<StorePhoto[]>([]);
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunningEnrichment, setIsRunningEnrichment] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const loadPhotos = async () => {
    try {
      const { getBaseURL } = await import('../../config/api');
      const baseUrl = await getBaseURL();
      
      const response = await fetch(`${baseUrl}/admin/store-photos`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transformar los datos del backend al formato esperado
        const transformedPhotos: StorePhoto[] = result.data.photos.map((photo: any) => ({
          _id: photo.id,
          name: photo.name,
          phone: photo.phone,
          imageUrl: photo.imageUrl,
          lat: photo.location.latitude,
          lng: photo.location.longitude,
          status: photo.status === 'pending_processing' ? 'processing' : 'enriched',
          uploadedBy: {
            _id: photo.uploadedBy || '1',
            name: 'Admin',
            email: 'admin@example.com'
          },
          createdAt: photo.uploadedAt,
          updatedAt: photo.uploadedAt,
          metrics: {
            mercadoLibre: {
              found: false,
              results: [],
              searchTerm: photo.name,
              lastUpdated: photo.uploadedAt
            },
            duckduckgo: {
              found: false,
              results: null,
              searchTerm: photo.name,
              lastUpdated: photo.uploadedAt
            },
            instagram: {
              found: false,
              followers: 0,
              username: null,
              lastUpdated: photo.uploadedAt
            }
          }
        }));
        
        setPhotos(transformedPhotos);
      } else {
        throw new Error(result.message || 'Error cargando fotos');
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      showToast('Error cargando fotos', 'error');
      
      // Fallback a datos mock en caso de error
      const mockPhotos: StorePhoto[] = [
        {
          _id: '1',
          name: 'Repuestos El Motor',
          phone: '+584121234567',
          imageUrl: 'https://via.placeholder.com/300x200',
          lat: 10.4806,
          lng: -66.9036,
          ocrText: 'REPUESTOS EL MOTOR - Especialistas en repuestos para motores',
          metrics: {
            mercadoLibre: {
              found: true,
              results: [
                { title: 'Repuestos Motor', price: 25.99, currency_id: 'USD' }
              ],
              searchTerm: 'repuestos motor',
              lastUpdated: '2024-01-20T15:30:00Z'
            },
            duckduckgo: {
              found: true,
              results: { title: 'Repuestos El Motor - Caracas' },
              searchTerm: 'repuestos el motor caracas',
              lastUpdated: '2024-01-20T15:30:00Z'
            },
            instagram: {
              found: true,
              followers: 1250,
              username: 'repuestoselmotor',
              lastUpdated: '2024-01-20T15:30:00Z'
            }
          },
          status: 'enriched',
          uploadedBy: {
            _id: '1',
            name: 'Juan Pérez',
            email: 'juan@example.com'
          },
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z'
        }
      ];
      
      setPhotos(mockPhotos);
    }
  };

  const loadStats = async () => {
    try {
      // Simular carga de estadísticas
      const mockStats: EnrichmentStats = {
        total: 3,
        byStatus: {
          pending: 1,
          processing: 1,
          enriched: 1,
          error: 0
        },
        isRunning: false
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([loadPhotos(), loadStats()]);
    setIsRefreshing(false);
  };

  const runEnrichment = async () => {
    try {
      setIsRunningEnrichment(true);
      
      // Simular ejecución de enriquecimiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('Proceso de enriquecimiento iniciado', 'success');
      
      // Recargar datos después de un breve delay
      setTimeout(() => {
        refreshData();
      }, 1000);
      
    } catch (error) {
      console.error('Error running enrichment:', error);
      showToast('Error iniciando enriquecimiento', 'error');
    } finally {
      setIsRunningEnrichment(false);
    }
  };

  const deletePhoto = async (photoId: string, photoName: string) => {
    Alert.alert(
      'Eliminar Foto',
      `¿Estás seguro de que quieres eliminar la foto de "${photoName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
              showToast('Foto eliminada exitosamente', 'success');
            } catch (error) {
              console.error('Error deleting photo:', error);
              showToast('Error eliminando foto', 'error');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([loadPhotos(), loadStats()]);
        setIsLoading(false);
      };
      loadData();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'processing': return '#007AFF';
      case 'enriched': return '#34C759';
      case 'error': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'enriched': return 'Enriquecida';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const renderPhotoItem = ({ item }: { item: StorePhoto }) => (
    <View style={styles.photoCard}>
      <View style={styles.photoHeader}>
        <Image source={{ uri: item.imageUrl }} style={styles.photoImage} />
        <View style={styles.photoInfo}>
          <Text style={styles.photoName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.photoLocation}>
            📍 {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
          </Text>
          {item.phone && (
            <Text style={styles.photoPhone}>📞 {item.phone}</Text>
          )}
          <Text style={styles.photoUploader}>
            👤 {item.uploadedBy.name}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.status === 'enriched' && item.ocrText && (
        <View style={styles.ocrContainer}>
          <Text style={styles.ocrTitle}>📝 Texto extraído (OCR):</Text>
          <Text style={styles.ocrText} numberOfLines={3}>
            {item.ocrText}
          </Text>
        </View>
      )}

      {item.status === 'enriched' && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>📊 Métricas:</Text>
          <View style={styles.metricsRow}>
            {item.metrics.mercadoLibre?.found && (
              <View style={styles.metricItem}>
                <Ionicons name="storefront" size={16} color="#FFC300" />
                <Text style={styles.metricText}>
                  ML: {item.metrics.mercadoLibre.results?.length || 0} resultados
                </Text>
              </View>
            )}
            {item.metrics.duckduckgo?.found && (
              <View style={styles.metricItem}>
                <Ionicons name="search" size={16} color="#007AFF" />
                <Text style={styles.metricText}>DDG: Encontrado</Text>
              </View>
            )}
            {item.metrics.instagram?.found && (
              <View style={styles.metricItem}>
                <Ionicons name="logo-instagram" size={16} color="#E4405F" />
                <Text style={styles.metricText}>
                  IG: {item.metrics.instagram.followers} seguidores
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {item.status === 'error' && item.errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {item.errorMessage}</Text>
        </View>
      )}

      <View style={styles.photoActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Navegar a detalles de la foto
            // navigation.navigate('PhotoDetails', { photoId: item._id });
          }}
        >
          <Ionicons name="eye" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Ver Detalles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => deletePhoto(item._id, item.name)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Verificar si el usuario es admin
  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedTitle}>Acceso Restringido</Text>
          <Text style={styles.restrictedText}>
            Solo los administradores pueden acceder a esta funcionalidad.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando fotos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
        translucent={false}
      />
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }]}>
        <Text style={styles.title}>Fotos de Locales</Text>
        <Text style={styles.subtitle}>
          Gestión y enriquecimiento de datos de locales
        </Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Estadísticas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9500' }]}>{stats.byStatus.pending || 0}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#34C759' }]}>{stats.byStatus.enriched || 0}</Text>
              <Text style={styles.statLabel}>Enriquecidas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{stats.byStatus.error || 0}</Text>
              <Text style={styles.statLabel}>Errores</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.enrichmentButton, isRunningEnrichment && styles.disabledButton]}
          onPress={runEnrichment}
          disabled={isRunningEnrichment}
        >
          {isRunningEnrichment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="refresh" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>
            {isRunningEnrichment ? 'Procesando...' : 'Ejecutar Enriquecimiento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.refreshButton]}
          onPress={refreshData}
        >
          <Ionicons name="reload" size={20} color="#007AFF" />
          <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item._id}
        renderItem={renderPhotoItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No hay fotos de locales disponibles</Text>
            <Text style={styles.emptySubtext}>
              Usa la función de captura para agregar fotos de locales
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  enrichmentButton: {
    backgroundColor: '#007AFF',
  },
  refreshButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  listContainer: {
    padding: 16,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  photoImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  photoInfo: {
    flex: 1,
  },
  photoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  photoLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  photoPhone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  photoUploader: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ocrContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  ocrTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ocrText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  metricsContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StorePhotosListScreen;