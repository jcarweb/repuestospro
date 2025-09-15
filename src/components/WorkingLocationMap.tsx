import React, { useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorkingLocationMapProps {
  onLocationSelect: (coordinates: { latitude: number; longitude: number; address: string }) => void;
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
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
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

const WorkingLocationMap: React.FC<WorkingLocationMapProps> = ({
  onLocationSelect,
  height = '400px'
}) => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Ubicación por defecto (Venezuela) - Siempre válida
  const defaultLocation = { lat: 10.4806, lng: -66.9036 }; // Caracas

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no está disponible en tu navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (isNaN(latitude) || isNaN(longitude)) {
          setError('No se pudieron obtener coordenadas válidas');
          return;
        }
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=es`
          );
          const data = await response.json();
          
          const locationData = {
            latitude,
            longitude,
            address: data.display_name || 'Mi ubicación actual'
          };
          
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
          setError(null);
        } catch (error) {
          console.error('Error obteniendo dirección:', error);
          const locationData = {
            latitude,
            longitude,
            address: 'Mi ubicación actual'
          };
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setError('No se pudo obtener tu ubicación actual');
      }
    );
  };

  // Limpiar ubicación seleccionada
  const clearLocation = () => {
    setSelectedLocation(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex gap-2">
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          title="Usar mi ubicación actual"
        >
          <Navigation className="h-5 w-5 inline mr-2" />
          Mi ubicación actual
        </button>
        
        {selectedLocation && (
          <button
            onClick={clearLocation}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            title="Limpiar ubicación"
          >
            <X className="h-5 w-5 inline mr-2" />
            Limpiar
          </button>
        )}
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
            {selectedLocation && 
             typeof selectedLocation.latitude === 'number' && 
             typeof selectedLocation.longitude === 'number' &&
             !isNaN(selectedLocation.latitude) && 
             !isNaN(selectedLocation.longitude) && (
              <Marker
                position={[selectedLocation.latitude, selectedLocation.longitude]}
                draggable={true}
                eventHandlers={{
                  dragend: async (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    
                    try {
                      const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1&accept-language=es`
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

            <MapEvents onLocationSelect={onLocationSelect} setSelectedLocation={setSelectedLocation} />
          </MapContainer>
        </div>
      </div>

      {/* Información de ubicación seleccionada */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">Ubicación seleccionada:</h4>
              <p className="text-sm text-blue-800 mb-2">{selectedLocation.address}</p>
              <div className="text-xs text-blue-600">
                Coordenadas: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
        <div className="flex items-start gap-2">
          <div className="h-2 w-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Instrucciones:</p>
            <ul className="text-xs space-y-1">
              <li>• Haz clic en el mapa para seleccionar tu ubicación</li>
              <li>• Usa el botón "Mi ubicación actual" para obtener tu posición GPS</li>
              <li>• Arrastra el marcador para ajustar la ubicación</li>
              <li>• La ubicación se guardará automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingLocationMap;
