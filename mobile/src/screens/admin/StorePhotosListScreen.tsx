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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCryptoAuth } from '../../contexts/CryptoAuthContext';
import cryptoAuthService from '../../services/cryptoAuthService';
import { useToast } from '../../contexts/ToastContext';

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

const StorePhotosListScreen: React.FC = () => {
  const [photos, setPhotos] = useState<StorePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunningEnrichment, setIsRunningEnrichment] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  const { isAdmin } = useCryptoAuth();
  const { showToast } = useToast();

  const loadPhotos = async () => {
    try {
      const response = await cryptoAuthService.getStorePhotos({
        page: 1,
        limit: 50,
      });

      if (response.success && response.data) {
        setPhotos(response.data);
      } else {
        throw new Error(response.message || 'Error cargando fotos');
      }
    } catch (error: any) {
      console.error('Error loading photos:', error);
      showToast(error.message || 'Error cargando fotos', 'error');
    }
  };

  const loadStats = async () => {
    try {
      const response = await cryptoAuthService.getEnrichmentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
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
      const response = await cryptoAuthService.runEnrichment();
      
      if (response.success) {
        showToast('Proceso de enriquecimiento iniciado', 'success');
        // Recargar datos después de un breve delay
        setTimeout(() => {
          refreshData();
        }, 2000);
      } else {
        throw new Error(response.message || 'Error iniciando enriquecimiento');
      }
    } catch (error: any) {
      console.error('Error running enrichment:', error);
      showToast(error.message || 'Error iniciando enriquecimiento', 'error');
    } finally {
      setIsRunningEnrichment(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    Alert.alert(
      'Eliminar Foto',
      '¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await cryptoAuthService.deleteStorePhoto(photoId);
              if (response.success) {
                showToast('Foto eliminada exitosamente', 'success');
                loadPhotos();
              } else {
                throw new Error(response.message || 'Error eliminando foto');
              }
            } catch (error: any) {
              console.error('Error deleting photo:', error);
              showToast(error.message || 'Error eliminando foto', 'error');
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
        <Text style={styles.photoName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.photoImage} />

      <View style={styles.photoInfo}>
        <Text style={styles.infoText}>📍 {item.lat.toFixed(6)}, {item.lng.toFixed(6)}</Text>
        {item.phone && <Text style={styles.infoText}>📞 {item.phone}</Text>}
        <Text style={styles.infoText}>👤 {item.uploadedBy.name}</Text>
        <Text style={styles.infoText}>
          📅 {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {item.status === 'enriched' && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Métricas Encontradas:</Text>
          
          {item.metrics.mercadoLibre?.found && (
            <Text style={styles.metricText}>
              🛒 MercadoLibre: {item.metrics.mercadoLibre.results?.length || 0} resultados
            </Text>
          )}
          
          {item.metrics.duckduckgo?.found && (
            <Text style={styles.metricText}>
              🔍 DuckDuckGo: Información encontrada
            </Text>
          )}
          
          {item.metrics.instagram?.found && (
            <Text style={styles.metricText}>
              📸 Instagram: {item.metrics.instagram.followers || 0} seguidores
            </Text>
          )}
          
          {item.ocrText && (
            <Text style={styles.ocrText} numberOfLines={3}>
              📝 OCR: {item.ocrText}
            </Text>
          )}
        </View>
      )}

      {item.status === 'error' && item.errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {item.errorMessage}</Text>
        </View>
      )}

      <View style={styles.photoActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePhoto(item._id)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Verificar si el usuario es admin
  if (!isAdmin) {
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
      <View style={styles.header}>
        <Text style={styles.title}>Fotos de Locales</Text>
        <Text style={styles.subtitle}>
          Gestión y enriquecimiento de datos de locales
        </Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Estadísticas</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>Total: {stats.total || 0}</Text>
            <Text style={styles.statText}>Pendientes: {stats.byStatus?.pending || 0}</Text>
            <Text style={styles.statText}>Enriquecidas: {stats.byStatus?.enriched || 0}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isRunningEnrichment && styles.actionButtonDisabled]}
          onPress={runEnrichment}
          disabled={isRunningEnrichment}
        >
          {isRunningEnrichment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>🔄 Ejecutar Enriquecimiento</Text>
          )}
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
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  photoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  photoImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoInfo: {
    padding: 16,
    paddingTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metricText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  ocrText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
