import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Cloud,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DiagnosticData {
  total: number;
  stats: { [key: string]: number };
  recentPhotos: any[];
  cloudinaryConfigured: boolean;
}

const EnrichmentDiagnostic: React.FC = () => {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""/api/store-photos/test');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos de diagnóstico:', data);
      
      if (data.success) {
        setDiagnosticData(data.data);
        toast.success('Diagnóstico completado');
      } else {
        toast.error('Error en el diagnóstico');
      }
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      toast.error('Error al ejecutar diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (condition: boolean) => {
    return condition ? 'Configurado' : 'No configurado';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-[#FFC300] animate-spin mr-2" />
          <span>Ejecutando diagnóstico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#333333] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#FFC300]" />
          Diagnóstico del Sistema
        </h3>
        <button
          onClick={runDiagnostic}
          className="bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Ejecutar Diagnóstico
        </button>
      </div>

      {diagnosticData && (
        <div className="space-y-6">
          {/* Estado de Cloudinary */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-[#333333] flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Configuración de Cloudinary
              </h4>
              {getStatusIcon(diagnosticData.cloudinaryConfigured)}
            </div>
            <p className="text-sm text-gray-600">
              {getStatusText(diagnosticData.cloudinaryConfigured)}
              {!diagnosticData.cloudinaryConfigured && (
                <span className="block mt-1 text-red-600">
                  ⚠️ Las imágenes no se guardarán en Cloudinary. Configura las variables de entorno.
                </span>
              )}
            </p>
          </div>

          {/* Estado de la base de datos */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-[#333333] flex items-center gap-2">
                <Database className="w-5 h-5" />
                Base de Datos
              </h4>
              {getStatusIcon(diagnosticData.total >= 0)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#333333]">{diagnosticData.total}</p>
                <p className="text-sm text-gray-600">Total Fotos</p>
              </div>
              {Object.entries(diagnosticData.stats).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold text-[#333333]">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fotos recientes */}
          {diagnosticData.recentPhotos.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-[#333333] mb-3">Fotos Recientes</h4>
              <div className="space-y-2">
                {diagnosticData.recentPhotos.map((photo, index) => (
                  <div key={photo._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <img
                        src={photo.imageUrl}
                        alt={photo.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-[#333333]">{photo.name}</p>
                        <p className="text-sm text-gray-600">
                          {photo.uploadedBy?.name || 'Usuario desconocido'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      photo.status === 'enriched' ? 'bg-green-100 text-green-800' :
                      photo.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {photo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recomendaciones
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              {!diagnosticData.cloudinaryConfigured && (
                <li>• Configura las variables de entorno de Cloudinary para guardar imágenes</li>
              )}
              {diagnosticData.total === 0 && (
                <li>• Sube algunas fotos de locales para probar el sistema</li>
              )}
              {diagnosticData.stats.pending > 0 && (
                <li>• Ejecuta el proceso de enriquecimiento para procesar las fotos pendientes</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrichmentDiagnostic;
