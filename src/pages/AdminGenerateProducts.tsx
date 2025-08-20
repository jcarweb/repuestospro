import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t, tWithParams } = useLanguage();
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
        setMessage({ type: 'success', text: tWithParams('adminGenerateProducts.storesGenerated', { count: result.data.count.toString() }) });
        // Guardar las tiendas generadas para mostrar detalles
        setGeneratedStores(result.data.stores || []);
        // Recargar tiendas después de generarlas
        await fetchStores();
      } else {
        setMessage({ type: 'error', text: result.message || t('adminGenerateProducts.errorGeneratingStores') });
      }
    } catch (error) {
      console.error('Error generando tiendas:', error);
      setMessage({ type: 'error', text: t('adminGenerateProducts.connectionErrorStores') });
    } finally {
      setIsGeneratingStores(false);
    }
  };

  const generateProducts = async () => {
    if (!selectedStore) {
      setMessage({ type: 'error', text: t('adminGenerateProducts.selectStoreRequired') });
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
        setMessage({ type: 'success', text: tWithParams('adminGenerateProducts.productsGenerated', { count: result.data.count.toString() }) });
        setStats(result.data.stats);
      } else {
        setMessage({ type: 'error', text: result.message || t('adminGenerateProducts.errorGeneratingProducts') });
      }
    } catch (error) {
      console.error('Error generando productos:', error);
      setMessage({ type: 'error', text: t('adminGenerateProducts.connectionErrorProducts') });
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminGenerateProducts.accessDenied')}</h2>
          <p className="text-gray-600">{t('adminGenerateProducts.accessDeniedMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Database className="w-8 h-8 text-[#FFC300]" />
          <h1 className="text-3xl font-bold text-gray-900">{t('adminGenerateProducts.title')}</h1>
        </div>
        <p className="text-gray-600">
          {t('adminGenerateProducts.subtitle')}
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
            <h2 className="text-lg font-semibold text-gray-900">{t('adminGenerateProducts.generateStores')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">{t('adminGenerateProducts.whatWillBeGenerated')}</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>{t('adminGenerateProducts.storesList')}</li>
                <li>{t('adminGenerateProducts.storesList2')}</li>
                <li>{t('adminGenerateProducts.storesList3')}</li>
                <li>{t('adminGenerateProducts.storesList4')}</li>
                <li>{t('adminGenerateProducts.storesList5')}</li>
                <li>{t('adminGenerateProducts.storesList6')}</li>
              </ul>
            </div>

            <button
              onClick={generateStores}
              disabled={isGeneratingStores}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingStores ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{t('adminGenerateProducts.generatingStores')}</span>
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  <span>{t('adminGenerateProducts.generate5Stores')}</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {t('adminGenerateProducts.warningCreateStores')}
            </p>
          </div>
        </div>

        {/* Generación de productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('adminGenerateProducts.generateProducts')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{t('adminGenerateProducts.whatWillBeGenerated')}</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>{t('adminGenerateProducts.productsList')}</li>
                <li>{t('adminGenerateProducts.productsList2')}</li>
                <li>{t('adminGenerateProducts.productsList3')}</li>
                <li>{t('adminGenerateProducts.productsList4')}</li>
                <li>{t('adminGenerateProducts.productsList5')}</li>
                <li>{t('adminGenerateProducts.productsList6')}</li>
                <li>{t('adminGenerateProducts.productsList7')}</li>
                <li>{t('adminGenerateProducts.productsList8')}</li>
              </ul>
            </div>

            {/* Selector de tienda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('adminGenerateProducts.selectStore')}
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                disabled={stores.length === 0}
              >
                <option value="">{t('adminGenerateProducts.selectStoreOption')}</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name} - {store.city}, {store.state}
                  </option>
                ))}
              </select>
              {stores.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {t('adminGenerateProducts.noStoresAvailable')}
                </p>
              )}
            </div>

            <button
              onClick={generateProducts}
              disabled={isGenerating || !selectedStore}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{t('adminGenerateProducts.generatingProducts')}</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  <span>{t('adminGenerateProducts.generate150Products')}</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {t('adminGenerateProducts.warningStoreProducts')}
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('adminGenerateProducts.statistics')}</h2>
            </div>
            <button
              onClick={getProductStats}
              className="px-3 py-1 text-sm bg-[#FFC300] text-white rounded hover:bg-[#E6B000] transition-colors"
            >
              {t('adminGenerateProducts.update')}
            </button>
          </div>
          
          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
                  <div className="text-sm text-blue-800">{t('adminGenerateProducts.totalProducts')}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{stats.totalCategories}</div>
                  <div className="text-sm text-green-800">{t('adminGenerateProducts.categories')}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalBrands}</div>
                  <div className="text-sm text-purple-800">{t('adminGenerateProducts.brands')}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-2xl font-bold text-orange-600">{stats.featuredProducts}</div>
                  <div className="text-sm text-orange-800">{t('adminGenerateProducts.featured')}</div>
                </div>
              </div>

              {stats.categoryStats && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('adminGenerateProducts.byCategory')}</h4>
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
              <p>{t('adminGenerateProducts.noStatisticsAvailable')}</p>
              <button
                onClick={getProductStats}
                className="mt-2 px-4 py-2 bg-[#FFC300] text-white rounded hover:bg-[#E6B000]"
              >
                {t('adminGenerateProducts.loadStatistics')}
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
            {t('adminGenerateProducts.recentlyGeneratedStores')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedStores.map((store) => (
              <div key={store._id} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <h4 className="font-medium text-gray-900 mb-2">{store.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{store.city}, {store.state}</p>
                {store.description && (
                  <p className="text-xs text-gray-500 mb-2">{store.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ID: {store._id}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{t('adminGenerateProducts.new')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminGenerateProducts.systemTestInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('adminGenerateProducts.generatedStores')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• AutoParts Express - Caracas</li>
              <li>• Repuestos Pro - Valencia</li>
              <li>• Mega Parts - Maracaibo</li>
              <li>• Auto Supply - Barquisimeto</li>
              <li>• Parts Center - Maracay</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('adminGenerateProducts.includedCategories')}</h4>
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
            <h4 className="font-medium text-gray-900 mb-2">{t('adminGenerateProducts.includedBrands')}</h4>
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
        <h3 className="text-lg font-semibold text-blue-900 mb-4">{t('adminGenerateProducts.usageInstructions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">{t('adminGenerateProducts.recommendedFlow')}</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>{t('adminGenerateProducts.flowStep1')}</li>
              <li>{t('adminGenerateProducts.flowStep2')}</li>
              <li>{t('adminGenerateProducts.flowStep3')}</li>
              <li>{t('adminGenerateProducts.flowStep4')}</li>
              <li>{t('adminGenerateProducts.flowStep5')}</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">{t('adminGenerateProducts.systemFeatures')}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>{t('adminGenerateProducts.feature1')}</li>
              <li>{t('adminGenerateProducts.feature2')}</li>
              <li>{t('adminGenerateProducts.feature3')}</li>
              <li>{t('adminGenerateProducts.feature4')}</li>
              <li>{t('adminGenerateProducts.feature5')}</li>
              <li>{t('adminGenerateProducts.feature6')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Credenciales de gestores */}
      {generatedStores.length > 0 && (
        <div className="mt-6 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {t('adminGenerateProducts.managerCredentials')}
          </h3>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800 mb-3">
              {t('adminGenerateProducts.credentialsDescription')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">{t('adminGenerateProducts.manager')} {num}</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>{t('adminGenerateProducts.email')}</strong> manager{num}@test.com</p>
                    <p><strong>{t('adminGenerateProducts.password')}</strong> password123</p>
                    <p><strong>{t('adminGenerateProducts.role')}</strong> {t('adminGenerateProducts.storeManager')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> {t('adminGenerateProducts.credentialsNote')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenerateProducts; 