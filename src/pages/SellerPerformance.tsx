import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MessageSquare,
  FileText,
  Star,
  Clock,
  Target,
  Award,
  Calendar,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
} from 'lucide-react';

interface PerformanceMetrics {
  period: string;
  totalQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  conversionRate: number;
  totalRevenue: number;
  averageQuoteValue: number;
  totalCustomers: number;
  newCustomers: number;
  customerSatisfaction: number;
  responseTime: number; // en minutos
  chatMessages: number;
  activeChats: number;
}

interface DailyPerformance {
  date: string;
  quotes: number;
  accepted: number;
  revenue: number;
  customers: number;
}

interface TopProduct {
  _id: string;
  name: string;
  category: string;
  quotes: number;
  accepted: number;
  revenue: number;
  conversionRate: number;
}

interface TopCustomer {
  _id: string;
  name: string;
  totalQuotes: number;
  acceptedQuotes: number;
  totalSpent: number;
  lastActivity: string;
  rating: number;
}

const SellerPerformance: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<PerformanceMetrics | null>(null);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const periodOptions = [
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' },
  ];

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedPeriod]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock current metrics
      const mockCurrentMetrics: PerformanceMetrics = {
        period: selectedPeriod,
        totalQuotes: 45,
        acceptedQuotes: 32,
        rejectedQuotes: 13,
        conversionRate: 71.1,
        totalRevenue: 2850.00,
        averageQuoteValue: 89.06,
        totalCustomers: 28,
        newCustomers: 5,
        customerSatisfaction: 4.6,
        responseTime: 12,
        chatMessages: 156,
        activeChats: 8,
      };

      // Mock previous metrics for comparison
      const mockPreviousMetrics: PerformanceMetrics = {
        period: selectedPeriod,
        totalQuotes: 38,
        acceptedQuotes: 25,
        rejectedQuotes: 13,
        conversionRate: 65.8,
        totalRevenue: 2200.00,
        averageQuoteValue: 88.00,
        totalCustomers: 25,
        newCustomers: 3,
        customerSatisfaction: 4.4,
        responseTime: 18,
        chatMessages: 142,
        activeChats: 6,
      };

      // Mock daily performance data
      const mockDailyPerformance: DailyPerformance[] = [
        { date: '2023-10-20', quotes: 3, accepted: 2, revenue: 180.00, customers: 2 },
        { date: '2023-10-21', quotes: 5, accepted: 4, revenue: 320.00, customers: 3 },
        { date: '2023-10-22', quotes: 4, accepted: 3, revenue: 250.00, customers: 2 },
        { date: '2023-10-23', quotes: 6, accepted: 4, revenue: 380.00, customers: 4 },
        { date: '2023-10-24', quotes: 7, accepted: 5, revenue: 420.00, customers: 3 },
        { date: '2023-10-25', quotes: 8, accepted: 6, revenue: 480.00, customers: 5 },
        { date: '2023-10-26', quotes: 12, accepted: 8, revenue: 820.00, customers: 6 },
      ];

      // Mock top products
      const mockTopProducts: TopProduct[] = [
        {
          _id: 'prod1',
          name: 'Filtro de Aceite Motor',
          category: 'Filtros',
          quotes: 15,
          accepted: 12,
          revenue: 300.00,
          conversionRate: 80.0,
        },
        {
          _id: 'prod2',
          name: 'Pastillas de Freno Delanteras',
          category: 'Frenos',
          quotes: 12,
          accepted: 8,
          revenue: 360.00,
          conversionRate: 66.7,
        },
        {
          _id: 'prod3',
          name: 'Aceite Motor 5W-30',
          category: 'Aceites',
          quotes: 10,
          accepted: 7,
          revenue: 245.00,
          conversionRate: 70.0,
        },
        {
          _id: 'prod4',
          name: 'Batería 12V 60Ah',
          category: 'Eléctrico',
          quotes: 8,
          accepted: 5,
          revenue: 600.00,
          conversionRate: 62.5,
        },
      ];

      // Mock top customers
      const mockTopCustomers: TopCustomer[] = [
        {
          _id: 'cust1',
          name: 'Juan Pérez',
          totalQuotes: 8,
          acceptedQuotes: 6,
          totalSpent: 480.00,
          lastActivity: '2023-10-26T14:30:00Z',
          rating: 4.8,
        },
        {
          _id: 'cust2',
          name: 'Roberto Silva',
          totalQuotes: 6,
          acceptedQuotes: 5,
          totalSpent: 420.00,
          lastActivity: '2023-10-24T15:45:00Z',
          rating: 4.9,
        },
        {
          _id: 'cust3',
          name: 'Carlos Ruiz',
          totalQuotes: 5,
          acceptedQuotes: 3,
          totalSpent: 240.00,
          lastActivity: '2023-10-26T12:15:00Z',
          rating: 4.2,
        },
        {
          _id: 'cust4',
          name: 'María García',
          totalQuotes: 4,
          acceptedQuotes: 3,
          totalSpent: 180.00,
          lastActivity: '2023-10-26T13:45:00Z',
          rating: 4.5,
        },
      ];

      setCurrentMetrics(mockCurrentMetrics);
      setPreviousMetrics(mockPreviousMetrics);
      setDailyPerformance(mockDailyPerformance);
      setTopProducts(mockTopProducts);
      setTopCustomers(mockTopCustomers);
    } catch (err) {
      setError('Error al cargar los datos de rendimiento.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando datos de rendimiento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchPerformanceData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!currentMetrics || !previousMetrics) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rendimiento del Vendedor</h1>
          <p className="text-gray-600 mt-2">Analiza tu desempeño y métricas de ventas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cotizaciones Totales</p>
              <p className="text-2xl font-bold text-gray-900">{currentMetrics.totalQuotes}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {(() => {
              const change = calculateChange(currentMetrics.totalQuotes, previousMetrics.totalQuotes);
              const ChangeIcon = getChangeIcon(change);
              return (
                <>
                  <ChangeIcon className={`w-4 h-4 ${getChangeColor(change)}`} />
                  <span className={`ml-1 text-sm ${getChangeColor(change)}`}>
                    {formatPercentage(Math.abs(change))}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">vs período anterior</span>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(currentMetrics.conversionRate)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {(() => {
              const change = calculateChange(currentMetrics.conversionRate, previousMetrics.conversionRate);
              const ChangeIcon = getChangeIcon(change);
              return (
                <>
                  <ChangeIcon className={`w-4 h-4 ${getChangeColor(change)}`} />
                  <span className={`ml-1 text-sm ${getChangeColor(change)}`}>
                    {formatPercentage(Math.abs(change))}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">vs período anterior</span>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMetrics.totalRevenue)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {(() => {
              const change = calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue);
              const ChangeIcon = getChangeIcon(change);
              return (
                <>
                  <ChangeIcon className={`w-4 h-4 ${getChangeColor(change)}`} />
                  <span className={`ml-1 text-sm ${getChangeColor(change)}`}>
                    {formatPercentage(Math.abs(change))}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">vs período anterior</span>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfacción del Cliente</p>
              <p className="text-2xl font-bold text-gray-900">{currentMetrics.customerSatisfaction}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {(() => {
              const change = calculateChange(currentMetrics.customerSatisfaction, previousMetrics.customerSatisfaction);
              const ChangeIcon = getChangeIcon(change);
              return (
                <>
                  <ChangeIcon className={`w-4 h-4 ${getChangeColor(change)}`} />
                  <span className={`ml-1 text-sm ${getChangeColor(change)}`}>
                    {formatPercentage(Math.abs(change))}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">vs período anterior</span>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cotizaciones Aceptadas</p>
              <p className="text-2xl font-bold text-gray-900">{currentMetrics.acceptedQuotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cotizaciones Rechazadas</p>
              <p className="text-2xl font-bold text-gray-900">{currentMetrics.rejectedQuotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes Atendidos</p>
              <p className="text-2xl font-bold text-gray-900">{currentMetrics.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiempo de Respuesta</p>
              <p className="text-2xl font-bold text-gray-900">{currentMetrics.responseTime} min</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rendimiento diario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rendimiento Diario</h3>
          <div className="space-y-4">
            {dailyPerformance.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {day.quotes} cotizaciones • {day.customers} clientes
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(day.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {day.accepted}/{day.quotes} aceptadas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos más cotizados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Productos Más Cotizados</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {product.quotes} cotizaciones
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPercentage(product.conversionRate)} conversión
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cotizaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aceptadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actividad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.totalQuotes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.acceptedQuotes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(customer.totalSpent)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-900">{customer.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(customer.lastActivity).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerPerformance;
