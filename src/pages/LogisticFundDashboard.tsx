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

interface FundStatus {
  fund: {
    id: string;
    balance: number;
    status: string;
    totalContributions: number;
    totalPayments: number;
    emergencyReserve: number;
  };
  profitability: number;
  fundHealth: string;
  recentTransactions: any[];
  recentBonuses: any[];
  systemHealth: {
    status: string;
    issues: string[];
    balanceRatio: number;
    profitability: number;
    recommendations: string[];
  };
}

const LogisticFundDashboard: React.FC = () => {
  const [fundStatus, setFundStatus] = useState<FundStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchFundStatus();
  }, [selectedPeriod]);

  const fetchFundStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/logistic/fund/status?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setFundStatus(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error cargando estado del fondo');
    } finally {
      setLoading(false);
    }
  };

  const executeGovernance = async () => {
    try {
      const response = await fetch('/api/logistic/fund/governance/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Gobernanza ejecutada: ${data.data.action} - ${data.data.reason}`);
        fetchFundStatus();
      }
    } catch (err) {
      alert('Error ejecutando gobernanza');
    }
  };

  const processWeeklyBonuses = async () => {
    try {
      const response = await fetch('/api/logistic/fund/bonuses/weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Bonos semanales procesados correctamente');
        fetchFundStatus();
      }
    } catch (err) {
      alert('Error procesando bonos semanales');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (!fundStatus) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No hay datos del fondo disponibles
      </div>
    );
  }

  const { fund, profitability, fundHealth, systemHealth } = fundStatus;

  // Datos para gráficos
  const balanceData = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    datasets: [
      {
        label: 'Balance del Fondo',
        data: [10000, 8500, 9200, 7800, 9500, 8800, 9200],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }
    ]
  };

  const profitabilityData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Rentabilidad (%)',
        data: [12, 8, 15, 10, 18, 14],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ]
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBgColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fondo Logístico Inteligente</h1>
          <p className="text-gray-600">Dashboard de gestión y monitoreo del sistema logístico</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={executeGovernance}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Ejecutar Gobernanza
          </button>
          <button
            onClick={processWeeklyBonuses}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Procesar Bonos
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Balance del Fondo</p>
              <p className="text-2xl font-bold text-gray-900">${fund.balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rentabilidad</p>
              <p className={`text-2xl font-bold ${profitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitability.toFixed(2)}%
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
              <p className="text-sm font-medium text-gray-600">Total Aportes</p>
              <p className="text-2xl font-bold text-gray-900">${fund.totalContributions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-900">${fund.totalPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className={`p-6 rounded-lg ${getHealthBgColor(systemHealth.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
            <p className={`text-sm font-medium ${getHealthColor(systemHealth.status)}`}>
              {systemHealth.status.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Ratio de Balance: {(systemHealth.balanceRatio * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Rentabilidad: {systemHealth.profitability.toFixed(2)}%</p>
          </div>
        </div>
        
        {systemHealth.issues.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Problemas detectados:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              {systemHealth.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución del Balance</h3>
          <Line data={balanceData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Balance del Fondo (Últimos 7 días)'
              }
            }
          }} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rentabilidad Mensual</h3>
          <Bar data={profitabilityData} options={{
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

      {/* Recommendations */}
      {systemHealth.recommendations.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
          <ul className="space-y-2">
            {systemHealth.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LogisticFundDashboard;
