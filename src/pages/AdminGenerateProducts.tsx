import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Database, 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  RefreshCw,
  BarChart3
} from 'lucide-react';

const AdminGenerateProducts: React.FC = () => {
  const { user, token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<any>(null);

  const generateProducts = async () => {
    setIsGenerating(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/generate-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: `Generados ${result.data.count} productos de prueba exitosamente` });
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
          <h1 className="text-3xl font-bold text-gray-900">Generar Productos de Prueba</h1>
        </div>
        <p className="text-gray-600">
          Genera más de 100 productos de prueba para probar el sistema de búsqueda avanzada
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generación de productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Generar Productos</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">¿Qué se generará?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 150 productos de prueba</li>
                <li>• 15 marcas diferentes (Toyota, Honda, Ford, etc.)</li>
                <li>• 11 categorías principales</li>
                <li>• Múltiples subcategorías por categoría</li>
                <li>• Códigos de partes originales realistas</li>
                <li>• SKUs internos del gestor de tienda</li>
                <li>• Precios variados ($10 - $510)</li>
                <li>• Stock aleatorio (1-50 unidades)</li>
                <li>• Productos destacados (20%)</li>
              </ul>
            </div>

            <button
              onClick={generateProducts}
              disabled={isGenerating}
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
                  <span>Generar 150 Productos de Prueba</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              ⚠️ Esta acción reemplazará todos los productos existentes
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

      {/* Información adicional */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema de Prueba</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};

export default AdminGenerateProducts; 