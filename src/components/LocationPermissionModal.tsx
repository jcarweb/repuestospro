import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertCircle, CheckCircle, Smartphone, Globe } from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onLocationGranted: (location: { latitude: number; longitude: number }) => void;
  onLocationDenied: () => void;
  token: string;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onLocationGranted,
  onLocationDenied,
  token
}) => {
  const [step, setStep] = useState<'requesting' | 'success' | 'error'>('requesting');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Google Analytics hook
  const { trackLocationUpdate } = useGoogleAnalytics();

  useEffect(() => {
    if (isOpen) {
      requestLocationPermission();
    }
  }, [isOpen]);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Verificar si el navegador soporta geolocalización
      if (!navigator.geolocation) {
        setError('Tu navegador no soporta geolocalización');
        setStep('error');
        setIsLoading(false);
        return;
      }

      // Solicitar ubicación
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
                         // Enviar ubicación al servidor
             const response = await fetch('http://localhost:5000/api/location/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                latitude,
                longitude,
                enabled: true
              })
            });

            const result = await response.json();

            if (result.success) {
              setStep('success');
              onLocationGranted({ latitude, longitude });
              
              // Track location update in Google Analytics
              // We need to get the user ID from the token or context
              // For now, we'll track with a placeholder user ID
              trackLocationUpdate('user', true);
            } else {
              setError(result.message || 'Error guardando ubicación');
              setStep('error');
            }
          } catch (error) {
            setError('Error enviando ubicación al servidor');
            setStep('error');
          }
          setIsLoading(false);
        },
        (error) => {
          let errorMessage = 'Error obteniendo ubicación';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado. Necesitamos acceso a tu ubicación para mejorar la búsqueda de repuestos.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener ubicación';
              break;
            default:
              errorMessage = 'Error desconocido al obtener ubicación';
          }
          
          setError(errorMessage);
          setStep('error');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (error) {
      setError('Error inesperado');
      setStep('error');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setStep('requesting');
    setError('');
    requestLocationPermission();
  };

  const handleDeny = () => {
    onLocationDenied();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Ubicación GPS Requerida
          </h2>
          <button
            onClick={handleDeny}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'requesting' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <MapPin className="w-16 h-16 text-blue-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Necesitamos tu ubicación
            </h3>
            
            <p className="text-gray-600 mb-6">
              Para mejorar la búsqueda de repuestos y encontrar los más cercanos a ti, 
              necesitamos acceso a tu ubicación GPS.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 mb-1">En dispositivos móviles:</h4>
                  <p className="text-sm text-blue-700">
                    • Acepta el permiso cuando aparezca la notificación<br/>
                    • Si no aparece, ve a Configuración → Ubicación → Permitir
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-green-900 mb-1">En navegadores web:</h4>
                  <p className="text-sm text-green-700">
                    • Haz clic en "Permitir" cuando aparezca el diálogo<br/>
                    • O ve a Configuración del sitio → Ubicación → Permitir
                  </p>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Obteniendo ubicación...</span>
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¡Ubicación obtenida!
            </h3>
            
            <p className="text-gray-600 mb-6">
              Tu ubicación ha sido guardada correctamente. Ahora podrás encontrar 
              los repuestos más cercanos a ti.
            </p>

            <button
              onClick={() => onLocationGranted({ latitude: 0, longitude: 0 })}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Error al obtener ubicación
            </h3>
            
            <p className="text-gray-600 mb-6">
              {error}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Intentar de nuevo
              </button>
              
              <button
                onClick={handleDeny}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continuar sin ubicación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPermissionModal; 