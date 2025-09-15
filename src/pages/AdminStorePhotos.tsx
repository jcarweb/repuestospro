import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

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

const AdminStorePhotos: React.FC = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<StorePhoto[]>([]);
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningEnrichment, setIsRunningEnrichment] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');

  // Verificar si el usuario es admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">
            Solo los administradores pueden acceder a esta funcionalidad.
          </p>
        </div>
      </div>
    );
  }

  const loadPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/store-photos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.data.photos || []);
      } else {
        throw new Error('Error cargando fotos');
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Error cargando fotos');
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/store-photos/admin/enrichment/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const runEnrichment = async () => {
    try {
      setIsRunningEnrichment(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/store-photos/admin/enrichment/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        toast.success('Proceso de enriquecimiento iniciado');
        setTimeout(() => {
          loadPhotos();
          loadStats();
        }, 2000);
      } else {
        throw new Error('Error iniciando enriquecimiento');
      }
    } catch (error) {
      console.error('Error running enrichment:', error);
      toast.error('Error iniciando enriquecimiento');
    } finally {
      setIsRunningEnrichment(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/store-photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Foto eliminada exitosamente');
        loadPhotos();
      } else {
        throw new Error('Error eliminando foto');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error eliminando foto');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadPhotos(), loadStats()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'enriched': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando fotos de locales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fotos de Locales</h1>
          <p className="mt-2 text-gray-600">
            Sistema de enriquecimiento de datos con OCR y APIs externas
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending || 0}</div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.byStatus.enriched || 0}</div>
                <div className="text-sm text-gray-600">Enriquecidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.byStatus.error || 0}</div>
                <div className="text-sm text-gray-600">Errores</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runEnrichment}
              disabled={isRunningEnrichment}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {isRunningEnrichment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  🔄 Ejecutar Enriquecimiento
                </>
              )}
            </button>
            <button
              onClick={() => {
                loadPhotos();
                loadStats();
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Photos List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Fotos de Locales</h2>
          </div>
          <div className="p-6">
            {photos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📸</div>
                <p className="text-gray-600">No hay fotos de locales disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{photo.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(photo.status)}`}>
                          {getStatusText(photo.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📍 {photo.lat.toFixed(6)}, {photo.lng.toFixed(6)}</p>
                        {photo.phone && <p>📞 {photo.phone}</p>}
                        <p>👤 {photo.uploadedBy.name}</p>
                        <p>📅 {new Date(photo.createdAt).toLocaleDateString()}</p>
                      </div>

                      {photo.status === 'enriched' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Métricas:</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            {photo.metrics.mercadoLibre?.found && (
                              <p>🛒 MercadoLibre: {photo.metrics.mercadoLibre.results?.length || 0} resultados</p>
                            )}
                            {photo.metrics.duckduckgo?.found && (
                              <p>🔍 DuckDuckGo: Información encontrada</p>
                            )}
                            {photo.metrics.instagram?.found && (
                              <p>📸 Instagram: {photo.metrics.instagram.followers || 0} seguidores</p>
                            )}
                            {photo.ocrText && (
                              <p className="text-xs text-gray-500 italic mt-2">
                                📝 OCR: {photo.ocrText.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {photo.status === 'error' && photo.errorMessage && (
                        <div className="mt-3 p-3 bg-red-50 rounded">
                          <p className="text-sm text-red-600">❌ {photo.errorMessage}</p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => deletePhoto(photo._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStorePhotos;
