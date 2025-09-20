import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Search } from 'lucide-react';

interface StoreLocationMapProps {
  onLocationSelect: (coordinates: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  height?: string;
}

const StoreLocationMap: React.FC<StoreLocationMapProps> = ({
  onLocationSelect,
  initialLocation,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(initialLocation ? {
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    address: ''
  } : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState('');

  // Inicializar el mapa
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY', // Reemplazar con tu API key
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;

        if (!mapRef.current) return;

        // Ubicación inicial (Venezuela)
        const defaultLocation = initialLocation || { lat: 10.4806, lng: -66.9036 }; // Caracas

        const mapInstance = new Map(mapRef.current, {
          center: defaultLocation,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(mapInstance);

        // Crear marcador inicial si hay ubicación inicial
        if (initialLocation) {
          const initialMarker = new google.maps.Marker({
            position: defaultLocation,
            map: mapInstance,
            draggable: true,
            title: 'Ubicación de la tienda'
          });
          setMarker(initialMarker);

          // Obtener dirección inicial
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: defaultLocation }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;
              setSelectedLocation({
                latitude: defaultLocation.lat,
                longitude: defaultLocation.lng,
                address
              });
              onLocationSelect({
                latitude: defaultLocation.lat,
                longitude: defaultLocation.lng,
                address
              });
            }
          });
        }

        // Evento de clic en el mapa
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          const position = event.latLng;
          if (!position) return;

          // Eliminar marcador anterior
          if (marker) {
            marker.setMap(null);
          }

          // Crear nuevo marcador
          const newMarker = new google.maps.Marker({
            position,
            map: mapInstance,
            draggable: true,
            title: 'Ubicación de la tienda'
          });
          setMarker(newMarker);

          // Obtener dirección
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;
              const locationData = {
                latitude: position.lat(),
                longitude: position.lng(),
                address
              };
              setSelectedLocation(locationData);
              onLocationSelect(locationData);
            }
          });
        });

        // Evento de arrastre del marcador
        if (marker) {
          marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
            const position = event.latLng;
            if (!position) return;

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: position }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                const locationData = {
                  latitude: position.lat(),
                  longitude: position.lng(),
                  address
                };
                setSelectedLocation(locationData);
                onLocationSelect(locationData);
              }
            });
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error inicializando mapa:', error);
        setError('Error al cargar el mapa. Verifica tu conexión a internet.');
        setLoading(false);
      }
    };

    initMap();
  }, [initialLocation, onLocationSelect]);

  // Función para buscar dirección
  const searchLocation = async () => {
    if (!map || !searchAddress.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          
          // Centrar mapa en la ubicación encontrada
          map.setCenter(location);
          map.setZoom(15);

          // Eliminar marcador anterior
          if (marker) {
            marker.setMap(null);
          }

          // Crear nuevo marcador
          const newMarker = new google.maps.Marker({
            position: location,
            map: map,
            draggable: true,
            title: 'Ubicación de la tienda'
          });
          setMarker(newMarker);

          // Actualizar ubicación seleccionada
          const locationData = {
            latitude: location.lat(),
            longitude: location.lng(),
            address: results[0].formatted_address
          };
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
        } else {
          setError('No se encontró la dirección especificada');
        }
      });
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      setError('Error al buscar la ubicación');
    }
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (!map) return;

        const location = new google.maps.LatLng(latitude, longitude);
        
        // Centrar mapa en la ubicación actual
        map.setCenter(location);
        map.setZoom(15);

        // Eliminar marcador anterior
        if (marker) {
          marker.setMap(null);
        }

        // Crear nuevo marcador
        const newMarker = new google.maps.Marker({
          position: location,
          map: map,
          draggable: true,
          title: 'Ubicación de la tienda'
        });
        setMarker(newMarker);

        // Obtener dirección
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            const locationData = {
              latitude,
              longitude,
              address
            };
            setSelectedLocation(locationData);
            onLocationSelect(locationData);
          }
        });
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setError('No se pudo obtener tu ubicación actual');
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
              placeholder="Buscar dirección..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <button
          onClick={searchLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Navigation className="w-4 h-4" />
          <span>Mi Ubicación</span>
        </button>
      </div>

      {/* Mapa */}
      <div className="relative">
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-lg border border-gray-300"
        />
        
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
        <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Haz clic en el mapa para seleccionar la ubicación exacta de tu tienda</li>
          <li>• Arrastra el marcador para ajustar la posición</li>
          <li>• Usa la búsqueda para encontrar una dirección específica</li>
          <li>• Haz clic en "Mi Ubicación" para usar tu posición actual</li>
        </ul>
      </div>
    </div>
  );
};

export default StoreLocationMap;
