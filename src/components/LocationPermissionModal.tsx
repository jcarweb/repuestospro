import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onLocationGranted: () => void;
  onLocationDenied: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onLocationGranted,
  onLocationDenied
}) => {
  const { location, loading, error, requestLocation } = useLocation();
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (location && hasRequested) {
      onLocationGranted();
    }
  }, [location, hasRequested, onLocationGranted]);

  const handleRequestLocation = async () => {
    setHasRequested(true);
    await requestLocation();
  };

  const handleDenyLocation = () => {
    onLocationDenied();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Permiso de Ubicación Requerido
          </h2>
          
          <p className="text-gray-600 mb-6">
            Para brindarte la mejor experiencia y encontrar repuestos cerca de ti, 
            necesitamos acceso a tu ubicación GPS. Este permiso es obligatorio para 
            usar la aplicación.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700 text-sm">Obteniendo ubicación...</span>
              </div>
            </div>
          )}

          {location && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span className="text-green-700 text-sm">
                  Ubicación obtenida exitosamente
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleRequestLocation}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Obteniendo ubicación...' : 'Permitir acceso a ubicación'}
            </button>
            
            <button
              onClick={handleDenyLocation}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              No permitir
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p className="mb-2">
              <strong>¿Por qué necesitamos tu ubicación?</strong>
            </p>
            <ul className="text-left space-y-1">
              <li>• Encontrar repuestos disponibles cerca de ti</li>
              <li>• Calcular costos de envío precisos</li>
              <li>• Mostrar tiendas y talleres cercanos</li>
              <li>• Optimizar las rutas de entrega</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal; 