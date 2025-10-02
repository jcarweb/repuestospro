import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Store, Package } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  distance: number;
  storeInfo: {
    name: string;
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

interface Store {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const LocationBasedSearch: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(5);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Obtener ubicación del usuario
  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en este navegador');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        searchNearbyProducts(latitude, longitude);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setError('No se pudo obtener tu ubicación. Verifica que tengas permisos de ubicación habilitados.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  // Buscar productos cercanos
  const searchNearbyProducts = async (lat: number, lng: number) => {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        radius: searchRadius.toString(),
        limit: '50'
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);

      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""/api/products/nearby?${params}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data.products);
        setStores(result.data.stores);
      } else {
        setError(result.message || 'Error buscando productos');
      }
    } catch (error) {
      console.error('Error buscando productos:', error);
      setError('Error de conexión al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar productos cuando cambian los filtros
  useEffect(() => {
    if (userLocation) {
      searchNearbyProducts(userLocation.latitude, userLocation.longitude);
    }
  }, [searchRadius, selectedCategory, selectedBrand]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Buscar Repuestos Cercanos</h1>
        </div>
                 <p className="text-gray-600 mb-4">
           Encuentra repuestos automotrices en tiendas cercanas a tu ubicación usando GPS
         </p>
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <h4 className="font-medium text-blue-900 mb-2">💡 ¿Por qué usar ubicación GPS?</h4>
           <ul className="text-sm text-blue-800 space-y-1">
             <li>• <strong>Búsqueda precisa:</strong> Encuentra las tiendas más cercanas a tu ubicación</li>
             <li>• <strong>Rangos optimizados:</strong> 5-10 km para búsquedas rápidas y eficientes</li>
             <li>• <strong>Comparación de distancias:</strong> Los productos se ordenan por proximidad</li>
             <li>• <strong>Mejor experiencia:</strong> Reduce tiempo de búsqueda y costos de transporte</li>
           </ul>
         </div>
      </div>

      {/* Controles de búsqueda */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Botón de ubicación */}
          <div>
            <button
              onClick={getUserLocation}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Obteniendo ubicación...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  <span>Usar Mi Ubicación</span>
                </>
              )}
            </button>
          </div>

          {/* Radio de búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Radio de búsqueda (km)
            </label>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                             <option value={5}>5 km (Recomendado)</option>
               <option value={10}>10 km</option>
               <option value={15}>15 km</option>
               <option value={20}>20 km</option>
               <option value={30}>30 km</option>
               <option value={50}>50 km</option>
            </select>
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              <option value="motor">Motor</option>
              <option value="frenos">Frenos</option>
              <option value="suspensión">Suspensión</option>
              <option value="eléctrico">Eléctrico</option>
              <option value="transmisión">Transmisión</option>
              <option value="refrigeración">Refrigeración</option>
              <option value="combustible">Combustible</option>
              <option value="escape">Escape</option>
              <option value="dirección">Dirección</option>
              <option value="iluminación">Iluminación</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>

          {/* Filtro por marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las marcas</option>
              <option value="toyota">Toyota</option>
              <option value="honda">Honda</option>
              <option value="ford">Ford</option>
              <option value="chevrolet">Chevrolet</option>
              <option value="nissan">Nissan</option>
              <option value="bmw">BMW</option>
              <option value="mercedes">Mercedes</option>
              <option value="audi">Audi</option>
              <option value="volkswagen">Volkswagen</option>
              <option value="hyundai">Hyundai</option>
              <option value="kia">Kia</option>
              <option value="mazda">Mazda</option>
              <option value="subaru">Subaru</option>
              <option value="mitsubishi">Mitsubishi</option>
              <option value="lexus">Lexus</option>
            </select>
          </div>
        </div>

        {/* Información de ubicación */}
        {userLocation && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Ubicación: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-red-600">⚠️</div>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {products.length > 0 && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Package className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {products.length} productos encontrados
                  </h3>
                  <p className="text-sm text-blue-700">
                    En {stores.length} tiendas cercanas (radio: {searchRadius} km)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Ordenados por distancia</p>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Imagen del producto */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {/* Información de la tienda */}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Store className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {product.storeInfo.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{product.storeInfo.city}, {product.storeInfo.state}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.distance} km
                      </span>
                    </div>
                  </div>

                  {/* Categoría y marca */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {product.brand}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {!userLocation && !loading && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Busca repuestos cercanos
          </h3>
          <p className="text-gray-600 mb-6">
            Haz clic en "Usar Mi Ubicación" para encontrar repuestos en tiendas cercanas
          </p>
          <button
            onClick={getUserLocation}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Navigation className="w-5 h-5" />
            <span>Buscar Repuestos Cercanos</span>
          </button>
        </div>
      )}

      {/* Sin resultados */}
      {userLocation && products.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600">
            No hay productos disponibles en tiendas cercanas. Intenta aumentar el radio de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationBasedSearch;
