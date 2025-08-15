import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Database, 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  RefreshCw,
  BarChart3,
  Store,
  Package,
  Users
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  city: string;
  state: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const AdminGenerateProducts: React.FC = () => {
  const { user, token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingStores, setIsGeneratingStores] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [generatedStores, setGeneratedStores] = useState<Store[]>([]);

  // Cargar tiendas disponibles
  const fetchStores = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setStores(result.data.stores || result.data);
        if (result.data.stores && result.data.stores.length > 0) {
          setSelectedStore(result.data.stores[0]._id);
        }
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchStores();
    }
  }, [user, token]);

  const generateStores = async () => {
    setIsGeneratingStores(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/generate-stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: `Generadas ${result.data.count} tiendas de prueba exitosamente` });
        // Guardar las tiendas generadas para mostrar detalles
        setGeneratedStores(result.data.stores || []);
        // Recargar tiendas después de generarlas
        await fetchStores();
      } else {
        setMessage({ type: 'error', text: result.message || 'Error generando tiendas' });
      }
    } catch (error) {
      console.error('Error generando tiendas:', error);
      setMessage({ type: 'error', text: 'Error de conexión al generar tiendas' });
    } finally {
      setIsGeneratingStores(false);
    }
  };

  const generateProducts = async () => {
    if (!selectedStore) {
      setMessage({ type: 'error', text: 'Debes seleccionar una tienda para generar productos' });
      return;
    }

    setIsGenerating(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/generate-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storeId: selectedStore })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: `Generados ${result.data.count} productos de prueba exitosamente para la tienda seleccionada` });
        setStats(result.data.stats);
      } else {
        setMessage({ type: 'error', text: result.message || 'Error generando productos' });
      }
    } catch (error) {
      console.error('Error generando productos:', error);
      setMessage({ type: 'error', text: 'Error de conexión al generar productos' });
    } finally {
      setIsGenerating(false);
    }
  };

  const getProductStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/product-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Generar Datos de Prueba</h1>
        </div>
        <p className="text-gray-600">
          Genera tiendas y productos de prueba para probar el sistema multi-tienda
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Panel principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generación de tiendas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Store className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Generar Tiendas</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">¿Qué se generará?</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 5 tiendas de prueba</li>
                <li>• Diferentes ciudades de Venezuela</li>
                <li>• Propietarios y managers asignados</li>
                <li>• Configuración completa de negocio</li>
                <li>• Horarios de atención</li>
                <li>• Coordenadas GPS realistas</li>
              </ul>
            </div>

            <button
              onClick={generateStores}
              disabled={isGeneratingStores}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingStores ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generando tiendas...</span>
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  <span>Generar 5 Tiendas de Prueba</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              ⚠️ Esta acción creará nuevas tiendas de prueba
            </p>
          </div>
        </div>

        {/* Generación de productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Generar Productos</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">¿Qué se generará?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 150 productos de prueba</li>
                <li>• 15 marcas diferentes</li>
                <li>• 11 categorías principales</li>
                <li>• Múltiples subcategorías</li>
                <li>• SKUs únicos por tienda</li>
                <li>• Precios variados ($10 - $510)</li>
                <li>• Stock aleatorio (1-50 unidades)</li>
                <li>• Productos destacados (20%)</li>
              </ul>
            </div>

            {/* Selector de tienda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Tienda:
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={stores.length === 0}
              >
                <option value="">Seleccionar una tienda</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name} - {store.city}, {store.state}
                  </option>
                ))}
              </select>
              {stores.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No hay tiendas disponibles. Genera tiendas primero.
                </p>
              )}
            </div>

            <button
              onClick={generateProducts}
              disabled={isGenerating || !selectedStore}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generando productos...</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  <span>Generar 150 Productos</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              ⚠️ Los productos se generarán para la tienda seleccionada
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Estadísticas</h2>
            </div>
            <button
              onClick={getProductStats}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Actualizar
            </button>
          </div>
          
          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
                  <div className="text-sm text-blue-800">Total Productos</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{stats.totalCategories}</div>
                  <div className="text-sm text-green-800">Categorías</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalBrands}</div>
                  <div className="text-sm text-purple-800">Marcas</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-2xl font-bold text-orange-600">{stats.featuredProducts}</div>
                  <div className="text-sm text-orange-800">Destacados</div>
                </div>
              </div>

              {stats.categoryStats && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Por Categoría:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {stats.categoryStats.map((stat: any) => (
                      <div key={stat.category} className="flex justify-between text-sm">
                        <span className="text-gray-600">{stat.category}</span>
                        <span className="font-medium">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay estadísticas disponibles</p>
              <button
                onClick={getProductStats}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Cargar Estadísticas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tiendas generadas recientemente */}
      {generatedStores.length > 0 && (
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Tiendas Generadas Recientemente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedStores.map((store) => (
              <div key={store.id} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <h4 className="font-medium text-gray-900 mb-2">{store.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{store.city}, {store.state}</p>
                {store.description && (
                  <p className="text-xs text-gray-500 mb-2">{store.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ID: {store.id}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Nueva</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema de Prueba</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tiendas Generadas:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• AutoParts Express - Caracas</li>
              <li>• Repuestos Pro - Valencia</li>
              <li>• Mega Parts - Maracaibo</li>
              <li>• Auto Supply - Barquisimeto</li>
              <li>• Parts Center - Maracay</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Categorías Incluidas:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Motor (Aceites, Filtros, Bujías)</li>
              <li>• Frenos (Pastillas, Discos, Líquidos)</li>
              <li>• Suspensión (Amortiguadores, Resortes)</li>
              <li>• Eléctrico (Baterías, Alternadores)</li>
              <li>• Transmisión (Aceites, Embragues)</li>
              <li>• Refrigeración (Radiadores, Bombas)</li>
              <li>• Combustible (Bombas, Filtros)</li>
              <li>• Escape (Silenciadores, Catalizadores)</li>
              <li>• Dirección (Cremalleras, Bombas)</li>
              <li>• Iluminación (Bombillas, Faros)</li>
              <li>• Accesorios (Alfombras, Cubiertas)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Marcas Incluidas:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Toyota, Honda, Ford, Chevrolet</li>
              <li>• Nissan, BMW, Mercedes, Audi</li>
              <li>• Volkswagen, Hyundai, Kia</li>
              <li>• Mazda, Subaru, Mitsubishi</li>
              <li>• Lexus</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Instrucciones de uso */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Instrucciones de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Flujo Recomendado:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. <strong>Generar Tiendas:</strong> Crea las tiendas de prueba primero</li>
              <li>2. <strong>Seleccionar Tienda:</strong> Elige una tienda del dropdown</li>
              <li>3. <strong>Generar Productos:</strong> Crea productos para esa tienda</li>
              <li>4. <strong>Repetir:</strong> Puedes generar productos para otras tiendas</li>
              <li>5. <strong>Gestionar:</strong> Los gestores pueden acceder con sus credenciales</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Características del Sistema:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>SKUs únicos por tienda:</strong> Mismo SKU en diferentes tiendas</li>
              <li>• <strong>Gestores asignados:</strong> Usuarios con rol store_manager</li>
              <li>• <strong>Configuración completa:</strong> Horarios, impuestos, entrega</li>
              <li>• <strong>Geolocalización:</strong> Coordenadas GPS realistas</li>
              <li>• <strong>Estadísticas por tienda:</strong> Filtros automáticos</li>
              <li>• <strong>Credenciales de gestores:</strong> manager1@test.com - password123</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Credenciales de gestores */}
      {generatedStores.length > 0 && (
        <div className="mt-6 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Credenciales de Gestores Generados
          </h3>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800 mb-3">
              Se han creado automáticamente gestores para las tiendas. Puedes usar estas credenciales para acceder como gestor:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">Manager {num}</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Email:</strong> manager{num}@test.com</p>
                    <p><strong>Contraseña:</strong> password123</p>
                    <p><strong>Rol:</strong> store_manager</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Estos gestores pueden acceder al panel de gestión de tiendas y administrar productos, 
                pedidos y configuraciones específicas de su tienda asignada.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenerateProducts; 