import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '../../config/api';

interface ExchangeRate {
  _id?: string;
  rate: number;
  currency: string;
  source: string;
  sourceUrl: string;
  lastUpdated: Date;
  isActive: boolean;
}

interface ExchangeRates {
  USD: ExchangeRate | null;
  EUR: ExchangeRate | null;
}

const ExchangeRateTab: React.FC = () => {
  const { t } = useLanguage();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ USD: null, EUR: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configUrl, setConfigUrl] = useState('https://www.bcv.org.ve/');
  const [autoUpdateStatus, setAutoUpdateStatus] = useState<{ isRunning: boolean; nextUpdate?: Date } | null>(null);
  const [history, setHistory] = useState<{ USD: ExchangeRate[]; EUR: ExchangeRate[] }>({ USD: [], EUR: [] });

  useEffect(() => {
    fetchExchangeRates();
    fetchAutoUpdateStatus();
    fetchHistory();
    
    // Configurar actualización automática cada 30 minutos (ya que la actualización del servidor es diaria)
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/monetization/exchange-rate/current');
      setExchangeRates(response.data.exchangeRates);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAutoUpdateStatus = async () => {
    try {
      const response = await api.get('/monetization/exchange-rate/auto-update/status');
      setAutoUpdateStatus(response.data.status);
    } catch (error) {
      console.error('Error obteniendo estado de actualización automática:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/monetization/exchange-rate/history');
      setHistory(response.data.history);
    } catch (error) {
      console.error('Error obteniendo historial:', error);
    }
  };

  const updateExchangeRates = async () => {
    setIsUpdating(true);
    try {
      const response = await api.post('/monetization/exchange-rate/update', { sourceUrl: configUrl });
      setExchangeRates(response.data.exchangeRates);
      setMessage({ type: 'success', text: 'Tasas de cambio actualizadas exitosamente' });
      fetchHistory(); // Actualizar historial
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setIsUpdating(false);
    }
  };

  const startAutoUpdate = async () => {
    try {
      await api.post('/monetization/exchange-rate/auto-update/start');
      setMessage({ type: 'success', text: 'Actualización automática iniciada' });
      fetchAutoUpdateStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error iniciando actualización automática' });
    }
  };

  const stopAutoUpdate = async () => {
    try {
      await api.post('/monetization/exchange-rate/auto-update/stop');
      setMessage({ type: 'success', text: 'Actualización automática detenida' });
      fetchAutoUpdateStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deteniendo actualización automática' });
    }
  };

  const updateConfigUrl = async () => {
    try {
      const response = await api.put('/monetization/exchange-rate/config', { sourceUrl: configUrl });
      setMessage({ type: 'success', text: 'URL de configuración actualizada' });
      setShowConfigModal(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#333333] dark:text-white">
            {t('monetization.exchangeRate.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestión de las tasas de cambio USD/VES y EUR/VES
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-[#555555] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#666666] transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar</span>
          </button>
          {autoUpdateStatus?.isRunning ? (
            <button
              onClick={stopAutoUpdate}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <span>Detener Auto</span>
            </button>
          ) : (
            <button
              onClick={startAutoUpdate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <span>Iniciar Auto</span>
            </button>
          )}
          <button
            onClick={updateExchangeRates}
            disabled={isUpdating}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Current Rates Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* USD Rate */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-2">
                Tasa Actual USD/VES
              </h3>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#FFC300]" />
                  <span className="text-gray-600 dark:text-gray-300">Cargando...</span>
                </div>
              ) : exchangeRates.USD ? (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-[#FFC300]">
                    ${exchangeRates.USD.rate.toFixed(2)} VES
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Actualizado: {formatDate(exchangeRates.USD.lastUpdated)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Fuente: {exchangeRates.USD.source}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  No hay tasa USD configurada
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-[#FFC300] rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-[#333333]" />
              </div>
            </div>
          </div>
        </div>

        {/* EUR Rate */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-2">
                Tasa Actual EUR/VES
              </h3>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">Cargando...</span>
                </div>
              ) : exchangeRates.EUR ? (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-500">
                    €{exchangeRates.EUR.rate.toFixed(2)} VES
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Actualizado: {formatDate(exchangeRates.EUR.lastUpdated)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Fuente: {exchangeRates.EUR.source}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  No hay tasa EUR configurada
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Update Status */}
      {autoUpdateStatus && (
        <div className="bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${autoUpdateStatus.isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Actualización automática: {autoUpdateStatus.isRunning ? 'Activa (diaria 9:20 AM)' : 'Inactiva'}
              </span>
            </div>
            {autoUpdateStatus.nextUpdate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Próxima actualización: {formatDate(autoUpdateStatus.nextUpdate)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Rate History */}
      <div className="bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-6">
        <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
          Historial de Tasas
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* USD History */}
          <div>
            <h4 className="text-md font-medium text-[#333333] dark:text-white mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-[#FFC300]" />
              Historial USD/VES
            </h4>
            {history.USD.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.USD.map((rate, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#555555] rounded-lg">
                    <div>
                      <div className="font-semibold text-[#FFC300]">
                        ${rate.rate.toFixed(2)} VES
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(rate.lastUpdated)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {rate.source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay historial USD disponible</p>
              </div>
            )}
          </div>

          {/* EUR History */}
          <div>
            <h4 className="text-md font-medium text-[#333333] dark:text-white mb-3 flex items-center">
              <span className="w-4 h-4 mr-2 text-blue-500 font-bold">€</span>
              Historial EUR/VES
            </h4>
            {history.EUR.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.EUR.map((rate, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#555555] rounded-lg">
                    <div>
                      <div className="font-semibold text-blue-500">
                        €{rate.rate.toFixed(2)} VES
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(rate.lastUpdated)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {rate.source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay historial EUR disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#333333] rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
                Configurar Fuente de Tasa
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL de la Fuente
                  </label>
                  <input
                    type="url"
                    value={configUrl}
                    onChange={(e) => setConfigUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    placeholder="https://www.bcv.org.ve/"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={updateConfigUrl}
                    className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800]"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeRateTab;
