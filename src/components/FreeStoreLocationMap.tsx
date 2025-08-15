import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StoreLocationMapProps {
  onLocationSelect: (coordinates: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  height?: string;
}

// Componente para manejar eventos del mapa
const MapEvents: React.FC<{
  onLocationSelect: (coordinates: { latitude: number; longitude: number; address: string }) => void;
  setSelectedLocation: (location: any) => void;
}> = ({ onLocationSelect, setSelectedLocation }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        // Usar Nominatim (OpenStreetMap) para geocodificación gratuita
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const address = data.display_name || 'Ubicación seleccionada';
        const locationData = {
          latitude: lat,
          longitude: lng,
          address
        };
        
        setSelectedLocation(locationData);
        onLocationSelect(locationData);
      } catch (error) {
        console.error('Error obteniendo dirección:', error);
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: 'Ubicación seleccionada'
        };
        setSelectedLocation(locationData);
        onLocationSelect(locationData);
      }
    },
  });

  return null;
};

const FreeStoreLocationMap: React.FC<StoreLocationMapProps> = ({
  onLocationSelect,
  initialLocation,
  height = '400px'
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>((initialLocation && 
    typeof initialLocation.latitude === 'number' && 
    typeof initialLocation.longitude === 'number' &&
    !isNaN(initialLocation.latitude) && 
    !isNaN(initialLocation.longitude)) ? {
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    address: ''
  } : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState('');

  // Ubicación inicial (Caracas, Venezuela) - Validar que las coordenadas sean válidas
  const defaultLocation = (initialLocation && 
    typeof initialLocation.latitude === 'number' && 
    typeof initialLocation.longitude === 'number' &&
    !isNaN(initialLocation.latitude) && 
    !isNaN(initialLocation.longitude)) 
    ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
    : { lat: 10.4806, lng: -66.9036 };

  // Función para buscar dirección usando Nominatim
  const searchLocation = async () => {
    if (!searchAddress.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&countrycodes=ve&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        const locationData = {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
          address: location.display_name
        };
        
        setSelectedLocation(locationData);
        onLocationSelect(locationData);
      } else {
        setError('No se encontró la dirección especificada');
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      setError('Error al buscar la ubicación');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en este navegador');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Obtener dirección usando Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          const locationData = {
            latitude,
            longitude,
            address: data.display_name || 'Mi ubicación actual'
          };
          
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
        } catch (error) {
          console.error('Error obteniendo dirección:', error);
          const locationData = {
            latitude,
            longitude,
            address: 'Mi ubicación actual'
          };
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setError('No se pudo obtener tu ubicación actual');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Controles de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Buscar dirección en Venezuela..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <button
          onClick={searchLocation}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <Navigation className="w-4 h-4" />
          <span>Mi Ubicación</span>
        </button>
      </div>

      {/* Mapa */}
      <div className="relative">
        <div style={{ height }} className="w-full rounded-lg border border-gray-300">
          <MapContainer
            center={[defaultLocation.lat, defaultLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            {/* Tile Layer de OpenStreetMap */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Marcador si hay ubicación seleccionada */}
            {selectedLocation && (
              <Marker
                position={[selectedLocation.latitude, selectedLocation.longitude]}
                draggable={true}
                eventHandlers={{
                  dragend: async (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    
                    try {
                      const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`
                      );
                      const data = await response.json();
                      
                      const locationData = {
                        latitude: position.lat,
                        longitude: position.lng,
                        address: data.display_name || 'Ubicación seleccionada'
                      };
                      
                      setSelectedLocation(locationData);
                      onLocationSelect(locationData);
                    } catch (error) {
                      console.error('Error obteniendo dirección:', error);
                    }
                  }
                }}
              />
            )}
            
            {/* Eventos del mapa */}
            <MapEvents
              onLocationSelect={onLocationSelect}
              setSelectedLocation={setSelectedLocation}
            />
          </MapContainer>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-red-600">⚠️</div>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Información de ubicación seleccionada */}
      {selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-1">Ubicación seleccionada</h4>
              <p className="text-sm text-green-800 mb-2">{selectedLocation.address}</p>
              <div className="text-xs text-green-700">
                <span className="font-medium">Coordenadas:</span> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🗺️ Mapa Gratuito - OpenStreetMap</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Haz clic en el mapa para seleccionar la ubicación exacta de tu tienda</li>
          <li>• Arrastra el marcador para ajustar la posición</li>
          <li>• Usa la búsqueda para encontrar una dirección específica en Venezuela</li>
          <li>• Haz clic en "Mi Ubicación" para usar tu posición actual</li>
          <li>• <strong>Gratuito:</strong> Sin límites de uso ni API keys requeridas</li>
        </ul>
      </div>

      {/* Información sobre OpenStreetMap */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">ℹ️ Sobre OpenStreetMap</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• <strong>Completamente gratuito</strong> - Sin costos ni límites</p>
          <p>• <strong>Datos actualizados</strong> por la comunidad</p>
          <p>• <strong>Cobertura completa</strong> de Venezuela</p>
          <p>• <strong>Geocodificación gratuita</strong> con Nominatim</p>
          <p>• <strong>Sin API keys</strong> - Listo para usar inmediatamente</p>
        </div>
      </div>
    </div>
  );
};

export default FreeStoreLocationMap;
