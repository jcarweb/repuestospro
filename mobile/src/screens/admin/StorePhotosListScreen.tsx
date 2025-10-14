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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyBackendConfig, forceLocalBackend } from '../../utils/forceLocalBackend';
import { autoFixBackendConfig } from '../../utils/backendConnectivity';

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
  const [currentBackendUrl, setCurrentBackendUrl] = useState<string>('');
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  // Verificar configuración del backend al cargar la pantalla
  useEffect(() => {
    const initializeScreen = async () => {
      await verifyBackendConfig();
      // Obtener la URL actual del backend
      const { getBaseURL } = await import('../../config/api');
      const currentUrl = await getBaseURL();
      setCurrentBackendUrl(currentUrl);
      await loadData();
    };
    initializeScreen();
  }, []);

  const loadPhotos = async () => {
    try {
      console.log('📸 Cargando fotos de locales...');
      const { getBaseURL } = await import('../../config/api');
      const baseUrl = await getBaseURL();
      const url = `${baseUrl}/admin/store-photos`;
      console.log('🌐 URL de fotos:', url);
      
      // Obtener el token correcto del AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Datos recibidos:', result);
      
      if (result.success && result.data) {
        // Transformar los datos del backend al formato esperado
        const transformedPhotos: StorePhoto[] = result.data.photos.map((photo: any) => ({
          _id: photo.id,
          name: photo.name,
          phone: photo.phone,
          imageUrl: photo.imageUrl,
          lat: photo.location.latitude,
          lng: photo.location.longitude,
          status: photo.status === 'pending_processing' ? 'processing' : 
                 photo.status === 'enriched' ? 'enriched' : 
                 photo.status === 'error' ? 'error' : 'pending',
          uploadedBy: {
            _id: photo.uploadedBy || '1',
            name: 'Admin',
            email: 'admin@example.com'
          },
          createdAt: photo.uploadedAt,
          updatedAt: photo.uploadedAt,
          ocrText: photo.ocrText || null,
          errorMessage: photo.errorMessage || null,
          metrics: photo.metrics || {
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
        
        console.log(`✅ Cargadas ${transformedPhotos.length} fotos`);
        setPhotos(transformedPhotos);
      } else {
        console.warn('⚠️ No se pudieron cargar las fotos:', result.message);
        setPhotos([]);
      }
    } catch (error) {
      console.error('❌ Error loading photos:', error);
      showToast('Error cargando fotos', 'error');
      setPhotos([]);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Cargando estadísticas de enriquecimiento...');
      const { getBaseURL } = await import('../../config/api');
      const baseUrl = await getBaseURL();
      const url = `${baseUrl}/admin/store-photos/stats`;
      console.log('🌐 URL de estadísticas:', url);
      
      // Obtener el token correcto del AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Estadísticas recibidas:', result);
      
      if (result.success && result.data) {
        const statsData: EnrichmentStats = {
          total: result.data.total || 0,
          byStatus: {
            pending: result.data.byStatus?.pending || 0,
            processing: result.data.byStatus?.processing || 0,
            enriched: result.data.byStatus?.enriched || 0,
            error: result.data.byStatus?.error || 0
          },
          isRunning: result.data.isRunning || false
        };
        
        console.log('✅ Estadísticas cargadas:', statsData);
        setStats(statsData);
      } else {
        console.warn('⚠️ No se pudieron cargar las estadísticas:', result.message);
        // Usar estadísticas por defecto
        setStats({
          total: 0,
          byStatus: { pending: 0, processing: 0, enriched: 0, error: 0 },
          isRunning: false
        });
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      // Usar estadísticas por defecto en caso de error
      setStats({
        total: 0,
        byStatus: { pending: 0, processing: 0, enriched: 0, error: 0 },
        isRunning: false
      });
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
      console.log('🔄 Iniciando proceso de enriquecimiento...');
      console.log('👤 Usuario actual:', user ? `${user.email} (${user.role})` : 'null');
      
      const { getBaseURL } = await import('../../config/api');
      const baseUrl = await getBaseURL();
      const url = `${baseUrl}/admin/run-enrichment`;
      console.log('🌐 URL de enriquecimiento:', url);
      
      // Obtener el token correcto del AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔐 Token para enriquecimiento:', token ? `${token.substring(0, 20)}...` : 'null');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Resultado del enriquecimiento:', result);
      
      if (result.success) {
        showToast('Proceso de enriquecimiento iniciado', 'success');
        
        // Recargar datos después de un breve delay
        setTimeout(() => {
          refreshData();
        }, 1000);
      } else {
        throw new Error(result.message || 'Error iniciando enriquecimiento');
      }
      
    } catch (error) {
      console.error('❌ Error running enrichment:', error);
      let errorMessage = 'Error iniciando enriquecimiento';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Error de conexión. Verifica tu internet.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage = 'Error del servidor. Intenta nuevamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast(errorMessage, 'error');
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
              console.log('🗑️ Eliminando foto:', photoId);
              const { getBaseURL } = await import('../../config/api');
              const baseUrl = await getBaseURL();
              const url = `${baseUrl}/admin/store-photos/${photoId}`;
              console.log('🌐 URL de eliminación:', url);
              
              // Obtener el token correcto del AsyncStorage
              const token = await AsyncStorage.getItem('authToken');
              
              const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              console.log('📡 Respuesta del servidor:', response.status);
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();
              console.log('📊 Resultado de eliminación:', result);
              
              if (result.success) {
                setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
                showToast('Foto eliminada exitosamente', 'success');
                
                // Recargar datos para asegurar consistencia
                setTimeout(() => {
                  refreshData();
                }, 500);
              } else {
                throw new Error(result.message || 'Error eliminando foto');
              }
            } catch (error) {
              console.error('❌ Error deleting photo:', error);
              let errorMessage = 'Error eliminando foto';
              
              if (error instanceof Error) {
                if (error.message.includes('Network request failed')) {
                  errorMessage = 'Error de conexión. Verifica tu internet.';
                } else if (error.message.includes('HTTP error')) {
                  errorMessage = 'Error del servidor. Intenta nuevamente.';
                } else {
                  errorMessage = error.message;
                }
              }
              
              showToast(errorMessage, 'error');
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
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Fotos de Locales</Text>
            <Text style={styles.subtitle}>
              Gestión y enriquecimiento de datos de locales
            </Text>
            {currentBackendUrl && (
              <Text style={styles.debugText}>
                Backend: {currentBackendUrl.includes('render.com') ? '🌐 Producción' : '🏠 Local'}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={autoFixBackendConfig}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  debugButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    marginLeft: 10,
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
  debugText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
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