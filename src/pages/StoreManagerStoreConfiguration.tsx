import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { 
  Settings, 
  DollarSign, 
  Euro, 
  Save, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Info
} from 'lucide-react';

interface StoreConfiguration {
  currency: string;
  taxRate: number;
  deliveryRadius: number;
  minimumOrder: number;
  autoAcceptOrders: boolean;
  preferredExchangeRate: 'USD' | 'EUR';
}

interface ExchangeRate {
  rate: number;
  currency: string;
  source: string;
  lastUpdated: string;
  isActive: boolean;
}

const StoreManagerStoreConfiguration: React.FC = () => {
  const { user, token } = useAuth();
  const { activeStore } = useActiveStore();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  
  const [config, setConfig] = useState<StoreConfiguration>({
    currency: 'USD',
    taxRate: 16.0,
    deliveryRadius: 10,
    minimumOrder: 0,
    autoAcceptOrders: false,
    preferredExchangeRate: 'USD'
  });

  useEffect(() => {
    if (activeStore) {
      loadStoreConfiguration();
      loadExchangeRate();
    }
  }, [activeStore]);

  const loadStoreConfiguration = async () => {
    if (!activeStore) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/stores/${activeStore._id}`);
      if (response.data.success) {
        const store = response.data.store;
        setConfig({
          currency: store.settings.currency || 'USD',
          taxRate: store.settings.taxRate || 16.0,
          deliveryRadius: store.settings.deliveryRadius || 10,
          minimumOrder: store.settings.minimumOrder || 0,
          autoAcceptOrders: store.settings.autoAcceptOrders || false,
          preferredExchangeRate: store.settings.preferredExchangeRate || 'USD'
        });
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setMessage({ type: 'error', text: 'Error al cargar la configuración de la tienda' });
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    if (!activeStore) return;
    
    setLoadingRate(true);
    try {
      const response = await api.get(`/monetization/store/${activeStore._id}/exchange-rate/current`);
      if (response.data.success) {
        setExchangeRate(response.data.exchangeRate);
      }
    } catch (error) {
      console.error('Error cargando tasa de cambio:', error);
    } finally {
      setLoadingRate(false);
    }
  };

  const handleInputChange = (field: keyof StoreConfiguration, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!activeStore) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      // Actualizar configuración básica de la tienda
      const storeResponse = await api.put(`/stores/${activeStore._id}`, {
        settings: {
          currency: config.currency,
          taxRate: config.taxRate,
          deliveryRadius: config.deliveryRadius,
          minimumOrder: config.minimumOrder,
          autoAcceptOrders: config.autoAcceptOrders,
          preferredExchangeRate: config.preferredExchangeRate
        }
      });

      if (storeResponse.data.success) {
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
        // Recargar la tasa de cambio con la nueva preferencia
        loadExchangeRate();
      } else {
        setMessage({ type: 'error', text: 'Error al guardar la configuración' });
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-[#FFC300] rounded-lg">
              <Settings className="h-6 w-6 text-[#333333]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración de Tienda
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Configura los parámetros básicos y preferencias de tu tienda
          </p>
        </div>

        {/* Alertas */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuración Básica */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuración Básica
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moneda Principal
                  </label>
                  <select
                    value={config.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="VES">VES - Bolívar Soberano</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tasa de IVA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Radio de Entrega (km)
                  </label>
                  <input
                    type="number"
                    value={config.deliveryRadius}
                    onChange={(e) => handleInputChange('deliveryRadius', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pedido Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.minimumOrder}
                    onChange={(e) => handleInputChange('minimumOrder', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Aceptar Pedidos Automáticamente
                    </h3>
                    <p className="text-xs text-gray-500">
                      Los pedidos se aceptarán automáticamente sin revisión manual
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('autoAcceptOrders', !config.autoAcceptOrders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.autoAcceptOrders ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.autoAcceptOrders ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Configuración de Tasa de Cambio */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Preferencia de Tasa de Cambio
              </h2>
              
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Información Importante</p>
                    <p>Selecciona con qué tasa de cambio prefieres trabajar. Esta configuración afectará los cálculos de precios y conversiones en tu tienda.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tasa de Cambio Preferida
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="preferredExchangeRate"
                        value="USD"
                        checked={config.preferredExchangeRate === 'USD'}
                        onChange={(e) => handleInputChange('preferredExchangeRate', e.target.value as 'USD' | 'EUR')}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <div className="font-medium">Dólar Estadounidense (USD)</div>
                          <div className="text-sm text-gray-500">Tasa oficial del BCV</div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="preferredExchangeRate"
                        value="EUR"
                        checked={config.preferredExchangeRate === 'EUR'}
                        onChange={(e) => handleInputChange('preferredExchangeRate', e.target.value as 'USD' | 'EUR')}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <Euro className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <div className="font-medium">Euro (EUR)</div>
                          <div className="text-sm text-gray-500">Tasa oficial del BCV</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tasa Actual
                  </label>
                  {loadingRate ? (
                    <div className="flex items-center justify-center p-4">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Cargando tasa...</span>
                    </div>
                  ) : exchangeRate ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {exchangeRate.rate.toLocaleString('es-VE')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {exchangeRate.currency} por Bs.
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Fuente: {exchangeRate.source}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(exchangeRate.lastUpdated)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-yellow-800 dark:text-yellow-200">
                          No se pudo cargar la tasa de cambio
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Acciones */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Acciones</h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>

                <button
                  onClick={loadExchangeRate}
                  disabled={loadingRate}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingRate ? 'animate-spin' : ''}`} />
                  Actualizar Tasa
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Información de la Tienda
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Nombre:</strong> {activeStore?.name}</p>
                  <p><strong>Ciudad:</strong> {activeStore?.city}</p>
                  <p><strong>Estado:</strong> {activeStore?.state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagerStoreConfiguration;
