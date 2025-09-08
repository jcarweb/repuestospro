import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Camera, 
  Image, 
  Upload, 
  MapPin, 
  Phone, 
  Building, 
  Eye, 
  Play,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StorePhoto {
  _id: string;
  name: string;
  phone: string;
  imageUrl: string;
  lat: number;
  lng: number;
  ocrText: string;
  metrics: {
    mercadoLibre: any;
    duckduckgo: any;
    instagram: any;
    whatsapp: any;
  };
  status: 'pending' | 'enriched' | 'error';
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminDataEnrichment: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [storePhotos, setStorePhotos] = useState<StorePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    fetchStorePhotos();
  }, []);

  const fetchStorePhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/store-photos');
      const data = await response.json();
      setStorePhotos(data.data || []);
    } catch (error) {
      console.error('Error fetching store photos:', error);
      toast.error('Error al cargar las fotos de locales');
    } finally {
      setLoading(false);
    }
  };

  const runEnrichment = async () => {
    try {
      setEnriching(true);
      const response = await fetch('http://localhost:5000/api/admin/enrichment/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Proceso de enriquecimiento iniciado');
        // Refrescar la lista después de un momento
        setTimeout(() => {
          fetchStorePhotos();
        }, 2000);
      } else {
        toast.error('Error al iniciar el enriquecimiento');
      }
    } catch (error) {
      console.error('Error running enrichment:', error);
      toast.error('Error al ejecutar el enriquecimiento');
    } finally {
      setEnriching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enriched':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enriched':
        return 'Enriquecido';
      case 'error':
        return 'Error';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-[#FFC300] animate-spin mx-auto mb-4" />
              <p className="text-[#333333]">Cargando fotos de locales...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#333333] flex items-center gap-3">
                <Camera className="w-8 h-8 text-[#FFC300]" />
                Enriquecimiento de Datos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona el enriquecimiento de datos de locales con OCR y APIs externas
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/data-enrichment/upload"
                className="bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir Fotos
              </Link>
              <button
                onClick={runEnrichment}
                disabled={enriching}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {enriching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {enriching ? 'Ejecutando...' : 'Ejecutar Enriquecimiento'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-[#333333]">
                  {storePhotos.filter(photo => photo.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enriquecidos</p>
                <p className="text-2xl font-bold text-[#333333]">
                  {storePhotos.filter(photo => photo.status === 'enriched').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Error</p>
                <p className="text-2xl font-bold text-[#333333]">
                  {storePhotos.filter(photo => photo.status === 'error').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Image className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-[#333333]">
                  {storePhotos.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de fotos */}
        {storePhotos.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#333333] mb-2">
              No hay fotos de locales
            </h3>
            <p className="text-gray-600 mb-4">
              Sube fotos de locales para comenzar el proceso de enriquecimiento
            </p>
            <Link
              to="/admin/data-enrichment/upload"
              className="bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Subir Primera Foto
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-[#333333]">
                Fotos de Locales ({storePhotos.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {storePhotos.map((photo) => (
                <div key={photo._id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={photo.imageUrl}
                        alt={photo.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-[#333333] truncate">
                          {photo.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(photo.status)}
                          <span className="text-sm text-gray-600">
                            {getStatusText(photo.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {photo.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {photo.lat}, {photo.lng}
                        </div>
                      </div>
                      {photo.ocrText && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Texto OCR:
                          </p>
                          <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                            {photo.ocrText}
                          </p>
                        </div>
                      )}
                      {photo.status === 'enriched' && photo.metrics && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Datos Enriquecidos:
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(photo.metrics).map(([key, value]) => (
                              <div key={key} className="bg-blue-50 p-2 rounded text-xs">
                                <p className="font-medium text-blue-800 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-blue-600">
                                  {value ? 'Encontrado' : 'No encontrado'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataEnrichment;