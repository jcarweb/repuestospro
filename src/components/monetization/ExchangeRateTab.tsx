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
  source: string;
  sourceUrl: string;
  lastUpdated: Date;
  isActive: boolean;
}

const ExchangeRateTab: React.FC = () => {
  const { t } = useLanguage();
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configUrl, setConfigUrl] = useState('https://www.bcv.org.ve/');

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/monetization/exchange-rate/current');
      setExchangeRate(response.data.exchangeRate);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateExchangeRate = async () => {
    setIsUpdating(true);
    try {
             const response = await api.post('/monetization/exchange-rate/update', { sourceUrl: configUrl });
      setExchangeRate(response.data.exchangeRate);
      setMessage({ type: 'success', text: 'Tasa de cambio actualizada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setIsUpdating(false);
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
            Gestión de la tasa de cambio USD/VES
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
          <button
            onClick={updateExchangeRate}
            disabled={isUpdating}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Current Rate Display */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-6">
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
            ) : exchangeRate ? (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-[#FFC300]">
                  ${exchangeRate.rate.toFixed(2)} VES
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Actualizado: {formatDate(exchangeRate.lastUpdated)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Fuente: {exchangeRate.source}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                No hay tasa de cambio configurada
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

      {/* Rate History */}
      <div className="bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-6">
        <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
          Historial de Tasas
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Historial de tasas próximamente</p>
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
