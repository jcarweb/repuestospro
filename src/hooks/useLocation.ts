import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface UseLocationReturn {
  location: LocationState | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const { token, updateLocation } = useAuth();
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar ubicación guardada al inicializar
  useEffect(() => {
    const savedLocation = localStorage.getItem('location');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('location');
      }
    }
  }, []);

  const requestLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si el navegador soporta geolocalización
      if (!navigator.geolocation) {
        throw new Error('Tu navegador no soporta geolocalización');
      }

      // Solicitar ubicación
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      const locationData: LocationState = {
        latitude,
        longitude,
        accuracy,
        timestamp: Date.now()
      };

      setLocation(locationData);

      // Guardar en localStorage
      localStorage.setItem('location', JSON.stringify(locationData));

      // Enviar al servidor si hay token
      if (token) {
        try {
          const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""/api/location/update', {
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
          if (!result.success) {
            console.warn('Error guardando ubicación en servidor:', result.message);
          }
        } catch (error) {
          console.warn('Error enviando ubicación al servidor:', error);
        }
      }

      // Actualizar contexto
      updateLocation({ latitude, longitude });

    } catch (error) {
      let errorMessage = 'Error obteniendo ubicación';
      
      if (error instanceof GeolocationPositionError) {
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
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('location');
    // También limpiar en el servidor si hay token
    if (token) {
      fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/location/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: false })
      }).catch(error => {
        console.warn('Error deshabilitando ubicación en servidor:', error);
      });
    }
  };

  return {
    location,
    loading,
    error,
    requestLocation,
    clearLocation
  };
}; 