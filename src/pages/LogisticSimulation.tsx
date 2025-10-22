import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SimulationParameters {
  dailyOrders: number;
  averageOrderValue: number;
  marketplaceCommissionRate: number;
  logisticFeeBase: number;
  activeDeliverys: number;
  deliveriesPerDriver: number;
  simulationDays: number;
}

interface SimulationResult {
  day: number;
  orders: number;
  fundContributions: number;
  deliveryPayments: number;
  fundBalance: number;
  profitability: number;
  governanceAction?: string;
  adjustments?: any;
}

interface SimulationData {
  results: SimulationResult[];
  metrics: {
    totalContributions: number;
    totalPayments: number;
    netBalance: number;
    averageROI: number;
    breakEvenDay?: number;
    peakDeficit: number;
    peakSurplus: number;
  };
  recommendations: string[];
}

const LogisticSimulation: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const [customParameters, setCustomParameters] = useState<SimulationParameters>({
    dailyOrders: 1000,
    averageOrderValue: 50,
    marketplaceCommissionRate: 12,
    logisticFeeBase: 0.75,
    activeDeliverys: 50,
    deliveriesPerDriver: 20,
    simulationDays: 30
  });

  const scenarios = {
    conservative: {
      name: 'Conservador',
      description: 'Escenario con menor volumen y rentabilidad moderada',
      parameters: {
        dailyOrders: 800,
        averageOrderValue: 45,
        marketplaceCommissionRate: 12,
        logisticFeeBase: 0.75,
        activeDeliverys: 40,
        deliveriesPerDriver: 20,
        simulationDays: 30
      }
    },
    realistic: {
      name: 'Realista',
      description: 'Escenario basado en datos del mercado actual',
      parameters: {
        dailyOrders: 1000,
        averageOrderValue: 50,
        marketplaceCommissionRate: 12,
        logisticFeeBase: 0.75,
        activeDeliverys: 50,
        deliveriesPerDriver: 20,
        simulationDays: 30
      }
    },
    optimistic: {
      name: 'Optimista',
      description: 'Escenario con alto crecimiento y rentabilidad',
      parameters: {
        dailyOrders: 1500,
        averageOrderValue: 55,
        marketplaceCommissionRate: 12,
        logisticFeeBase: 0.75,
        activeDeliverys: 75,
        deliveriesPerDriver: 20,
        simulationDays: 30
      }
    }
  };

  const runSimulation = async (parameters: SimulationParameters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/simulation/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(parameters)
      });

      const data = await response.json();
      
      if (data.success) {
        setSimulationData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error ejecutando simulación');
    } finally {
      setLoading(false);
    }
  };

  const runScenarioSimulation = async (scenario: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/simulation/scenario/${scenario}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSimulationData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error ejecutando simulación de escenario');
    } finally {
      setLoading(false);
    }
  };

  const compareScenarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/simulation/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Mostrar comparación en una nueva ventana o modal
        console.log('Comparación de escenarios:', data.data);
        alert('Comparación completada. Revisar consola para detalles.');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error comparando escenarios');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomParameters = (field: keyof SimulationParameters, value: number) => {
    setCustomParameters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getChartData = () => {
    if (!simulationData) return null;

    const labels = simulationData.results.map(r => `Día ${r.day}`);
    const balanceData = simulationData.results.map(r => r.fundBalance);
    const profitabilityData = simulationData.results.map(r => r.profitability);

    return {
      balance: {
        labels,
        datasets: [
          {
            label: 'Balance del Fondo ($)',
            data: balanceData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
          }
        ]
      },
      profitability: {
        labels,
        datasets: [
          {
            label: 'Rentabilidad (%)',
            data: profitabilityData,
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2
          }
        ]
      }
    };
  };

  const chartData = getChartData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulación Financiera</h1>
          <p className="text-gray-600">Análisis y proyección del sistema logístico</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={compareScenarios}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Comparar Escenarios
          </button>
          <button
            onClick={() => runSimulation(customParameters)}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? 'Ejecutando...' : 'Ejecutar Simulación'}
          </button>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Escenario</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <div
              key={key}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedScenario === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedScenario(key)}
            >
              <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
              <p className="text-sm text-gray-600 mt-2">{scenario.description}</p>
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    runScenarioSimulation(key);
                  }}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded transition-colors"
                >
                  {loading ? 'Ejecutando...' : 'Ejecutar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Parameters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros Personalizados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pedidos Diarios
            </label>
            <input
              type="number"
              value={customParameters.dailyOrders}
              onChange={(e) => updateCustomParameters('dailyOrders', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Promedio del Pedido ($)
            </label>
            <input
              type="number"
              value={customParameters.averageOrderValue}
              onChange={(e) => updateCustomParameters('averageOrderValue', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comisión del Marketplace (%)
            </label>
            <input
              type="number"
              value={customParameters.marketplaceCommissionRate}
              onChange={(e) => updateCustomParameters('marketplaceCommissionRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Logístico Base ($)
            </label>
            <input
              type="number"
              value={customParameters.logisticFeeBase}
              onChange={(e) => updateCustomParameters('logisticFeeBase', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deliverys Activos
            </label>
            <input
              type="number"
              value={customParameters.activeDeliverys}
              onChange={(e) => updateCustomParameters('activeDeliverys', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entregas por Driver
            </label>
            <input
              type="number"
              value={customParameters.deliveriesPerDriver}
              onChange={(e) => updateCustomParameters('deliveriesPerDriver', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Simulation Results */}
      {simulationData && (
        <div className="space-y-6">
          {/* Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Aportes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${simulationData.metrics.totalContributions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${simulationData.metrics.totalPayments.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ROI Promedio</p>
                  <p className={`text-2xl font-bold ${simulationData.metrics.averageROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {simulationData.metrics.averageROI.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Balance Neto</p>
                  <p className={`text-2xl font-bold ${simulationData.metrics.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${simulationData.metrics.netBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución del Balance</h3>
                <Line data={chartData.balance} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Balance del Fondo a lo Largo del Tiempo'
                    }
                  }
                }} />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rentabilidad Diaria</h3>
                <Bar data={chartData.profitability} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Rentabilidad del Fondo (%)'
                    }
                  }
                }} />
              </div>
            </div>
          )}

          {/* Recommendations */}
          {simulationData.recommendations.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
              <ul className="space-y-2">
                {simulationData.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogisticSimulation;
