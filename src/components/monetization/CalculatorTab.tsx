import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  Receipt,
  RefreshCw
} from 'lucide-react';
import api from '../../config/api';

interface CalculationResult {
  subtotal: number;
  commission: number;
  taxes: number;
  total: number;
  breakdown: {
    commission: {
      amount: number;
      rate: number;
      type: string;
    };
    taxes: Array<{
      name: string;
      amount: number;
      rate: number;
      type: string;
    }>;
  };
}

const CalculatorTab: React.FC = () => {
  const { t } = useLanguage();
  const [saleAmount, setSaleAmount] = useState<number>(0);
  const [storeType, setStoreType] = useState<'new' | 'growing' | 'established'>('new');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const response = await api.get('/monetization/exchange-rate/current');
      setExchangeRate(response.data.exchangeRate?.rate || 0);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  const calculateCommission = async () => {
    if (saleAmount <= 0) return;

    setIsCalculating(true);
    try {
      const response = await api.post('/monetization/calculator', {
        saleAmount,
        storeType,
        exchangeRate
      });
      setCalculationResult(response.data.result);
    } catch (error) {
      console.error('Error calculating:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#333333] dark:text-white">
            {t('monetization.calculator.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Calculadora de comisiones e impuestos
          </p>
        </div>
        <button
          onClick={fetchExchangeRate}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-[#555555] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#666666] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar Tasa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-6">
          <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
            Parámetros de Cálculo
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto de Venta (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Tienda
              </label>
              <select
                value={storeType}
                onChange={(e) => setStoreType(e.target.value as 'new' | 'growing' | 'established')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
              >
                <option value="new">Tienda Nueva</option>
                <option value="growing">Tienda en Crecimiento</option>
                <option value="established">Tienda Establecida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tasa de Cambio USD/VES
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Última actualización: {exchangeRate > 0 ? formatCurrency(exchangeRate) : 'No disponible'}
              </p>
            </div>

            <button
              onClick={calculateCommission}
              disabled={isCalculating || saleAmount <= 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50 transition-colors"
            >
              <Calculator className="w-5 h-5" />
              <span>{isCalculating ? 'Calculando...' : 'Calcular'}</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-6">
          <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
            Resultados del Cálculo
          </h3>

          {calculationResult ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="font-medium">{formatUSD(calculationResult.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Comisión:</span>
                    <span className="font-medium text-red-600">{formatUSD(calculationResult.commission)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Impuestos:</span>
                    <span className="font-medium text-orange-600">{formatUSD(calculationResult.taxes)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#333333] dark:text-white">Total:</span>
                      <span className="font-bold text-lg text-[#FFC300]">{formatUSD(calculationResult.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission Breakdown */}
              <div className="bg-gray-50 dark:bg-[#555555] rounded-lg p-4">
                <h4 className="font-medium text-[#333333] dark:text-white mb-3 flex items-center">
                  <Percent className="w-4 h-4 mr-2" />
                  Desglose de Comisión
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Tipo:</span>
                    <span className="font-medium">{calculationResult.breakdown.commission.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Tasa:</span>
                    <span className="font-medium">{calculationResult.breakdown.commission.rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Monto:</span>
                    <span className="font-medium">{formatUSD(calculationResult.breakdown.commission.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Taxes Breakdown */}
              {calculationResult.breakdown.taxes.length > 0 && (
                <div className="bg-gray-50 dark:bg-[#555555] rounded-lg p-4">
                  <h4 className="font-medium text-[#333333] dark:text-white mb-3 flex items-center">
                    <Receipt className="w-4 h-4 mr-2" />
                    Desglose de Impuestos
                  </h4>
                  <div className="space-y-2">
                    {calculationResult.breakdown.taxes.map((tax, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">{tax.name}:</span>
                          <span className="font-medium">{tax.rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                          <span className="font-medium">{formatUSD(tax.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VES Equivalent */}
              <div className="bg-[#FFC300]/10 rounded-lg p-4">
                <h4 className="font-medium text-[#333333] dark:text-white mb-2">
                  Equivalente en VES
                </h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FFC300]">
                    {formatCurrency(calculationResult.total * exchangeRate)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Basado en tasa de {formatCurrency(exchangeRate)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sin cálculos
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ingresa los parámetros y haz clic en "Calcular" para ver los resultados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-3">
          Información sobre el Cálculo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-medium text-[#333333] dark:text-white mb-2">Comisiones por Tipo de Tienda:</h4>
            <ul className="space-y-1">
              <li>• <strong>Tienda Nueva:</strong> 5% (primeros 6 meses)</li>
              <li>• <strong>Tienda en Crecimiento:</strong> 8-10% (ventas crecientes)</li>
              <li>• <strong>Tienda Establecida:</strong> 3-4% (con membresía premium)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[#333333] dark:text-white mb-2">Impuestos Aplicables:</h4>
            <ul className="space-y-1">
              <li>• <strong>IVA:</strong> 16% sobre productos y servicios</li>
              <li>• <strong>ISLR:</strong> 2% sobre ventas empresariales</li>
              <li>• <strong>Impuestos locales:</strong> Según jurisdicción</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTab;
