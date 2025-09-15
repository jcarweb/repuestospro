import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import SalesChart from '../components/SalesChart';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Target,
  PieChart,
  Activity,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface SalesOverview {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  conversionRate: number;
  refundRate: number;
  averageItemsPerOrder: number;
  totalItemsSold: number;
}

interface SalesTrends {
  daily: Array<{
    date: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  weekly: Array<{
    week: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  monthly: Array<{
    month: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
}

interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  profitMargin: number;
}

interface TopCategory {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
}

interface CustomerAnalytics {
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    email: string;
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    lastOrderDate: string;
  }>;
  customerSegments: {
    new: number;
    returning: number;
    loyal: number;
    inactive: number;
  };
  customerRetention: {
    rate: number;
    averageLifetime: number;
    repeatPurchaseRate: number;
  };
}

interface PaymentAnalytics {
  paymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  paymentTrends: Array<{
    date: string;
    method: string;
    amount: number;
  }>;
}

interface SalesReport {
  overview: SalesOverview;
  trends: SalesTrends;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  customerAnalytics: CustomerAnalytics;
  paymentAnalytics: PaymentAnalytics;
  period: {
    from: string;
    to: string;
    days: number;
  };
}

const StoreManagerSales: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Estados principales
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string[]>([]);

  // Estados de visualización
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'products' | 'customers' | 'payments'>('overview');
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Configurar fechas por defecto (últimos 30 días)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Cargar reporte cuando cambien los filtros
  useEffect(() => {
    if (activeStore && dateFrom && dateTo) {
      loadSalesReport();
    }
  }, [activeStore, dateFrom, dateTo, selectedCategory, selectedPaymentMethod, selectedOrderStatus]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSalesReport();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadSalesReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedPaymentMethod && { paymentMethod: selectedPaymentMethod }),
        ...(selectedOrderStatus.length > 0 && { orderStatus: selectedOrderStatus.join(',') })
      });

      const response = await fetch(`/api/sales-reports/store?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }

      const data = await response.json();
      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        format,
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedPaymentMethod && { paymentMethod: selectedPaymentMethod }),
        ...(selectedOrderStatus.length > 0 && { orderStatus: selectedOrderStatus.join(',') })
      });

      const response = await fetch(`/api/sales-reports/store/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading && !report) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando reporte de ventas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <span className="ml-2 text-red-800">Error: {error}</span>
          </div>
          <button
            onClick={loadSalesReport}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          No hay datos disponibles para el período seleccionado
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Ventas
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Análisis completo de rendimiento de ventas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg border ${
              autoRefresh
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>

                     <button
             onClick={() => setShowFilters(!showFilters)}
             className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
           >
             <Filter className="h-4 w-4" />
             <span className="ml-2">Filtros</span>
           </button>

           <button
             onClick={() => {
               setSelectedCategory('');
               setSelectedPaymentMethod('');
               setSelectedOrderStatus([]);
             }}
             className="px-4 py-2 bg-blue-100 dark:bg-blue-700 rounded-lg border border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300"
           >
             <RefreshCw className="h-4 w-4" />
             <span className="ml-2">Limpiar Filtros</span>
           </button>

          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span className="ml-2">Exportar</span>
            </button>
          </div>
        </div>
      </div>

             {/* Indicador de filtros activos */}
       {(selectedCategory || selectedPaymentMethod || selectedOrderStatus.length > 0) && (
         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Filter className="h-4 w-4 text-blue-600" />
               <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Filtros activos:</span>
               <div className="flex gap-2">
                 {selectedCategory && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Categoría</span>
                 )}
                 {selectedPaymentMethod && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Pago: {selectedPaymentMethod}</span>
                 )}
                 {selectedOrderStatus.length > 0 && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                     Estados: {selectedOrderStatus.length}
                   </span>
                 )}
               </div>
             </div>
             <button
               onClick={() => {
                 setSelectedCategory('');
                 setSelectedPaymentMethod('');
                 setSelectedOrderStatus([]);
               }}
               className="text-sm text-blue-600 hover:text-blue-800"
             >
               Limpiar todos
             </button>
           </div>
         </div>
       )}

       {/* Filtros */}
       {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Método de Pago</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="debit_card">Tarjeta de Débito</option>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado de Orden</label>
              <select
                multiple
                value={selectedOrderStatus}
                onChange={(e) => setSelectedOrderStatus(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navegación de vistas */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Vista General', icon: BarChart3 },
          { id: 'trends', label: 'Tendencias', icon: TrendingUp },
          { id: 'products', label: 'Productos', icon: Package },
          { id: 'customers', label: 'Clientes', icon: Users },
          { id: 'payments', label: 'Pagos', icon: DollarSign }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              selectedView === view.id
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <view.icon className="h-4 w-4 mr-2" />
            {view.label}
          </button>
        ))}
      </div>

      {/* Vista General */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Ventas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(report.overview.totalSales)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.overview.totalOrders} órdenes
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Valor Promedio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(report.overview.averageOrderValue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    por orden
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Clientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(report.overview.totalCustomers)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.overview.newCustomers} nuevos
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tasa Conversión</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPercentage(report.overview.conversionRate)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatNumber(report.overview.totalItemsSold)} items vendidos
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de tendencias */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tendencias de Ventas</h3>
                <select
                  value={trendPeriod}
                  onChange={(e) => setTrendPeriod(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              <SalesChart
                type="bar"
                data={report.trends[trendPeriod].map((trend: any) => ({
                  name: trendPeriod === 'daily' ? trend.date : trendPeriod === 'weekly' ? trend.week : trend.month,
                  value: trend.sales,
                  orders: trend.orders,
                  customers: trend.customers
                }))}
                xKey="name"
                yKey="value"
                height={250}
                colors={['#3B82F6']}
              />
            </div>

            {/* Gráfico de productos top */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
              <div className="space-y-3">
                {report.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{product.productName}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatNumber(product.quantitySold)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(product.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Tendencias */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Análisis de Tendencias</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTrendPeriod('daily')}
                  className={`px-3 py-1 rounded text-sm ${
                    trendPeriod === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Diario
                </button>
                <button
                  onClick={() => setTrendPeriod('weekly')}
                  className={`px-3 py-1 rounded text-sm ${
                    trendPeriod === 'weekly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setTrendPeriod('monthly')}
                  className={`px-3 py-1 rounded text-sm ${
                    trendPeriod === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Mensual
                </button>
              </div>
            </div>
            <SalesChart
              type="line"
              data={report.trends[trendPeriod].map((trend: any) => ({
                name: trendPeriod === 'daily' ? trend.date : trendPeriod === 'weekly' ? trend.week : trend.month,
                value: trend.sales,
                orders: trend.orders,
                customers: trend.customers
              }))}
              xKey="name"
              yKey="value"
              height={350}
              colors={['#10B981']}
            />
          </div>
        </div>
      )}

      {/* Vista de Productos */}
      {selectedView === 'products' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Análisis de Productos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 font-medium">SKU</th>
                    <th className="text-left py-3 px-4 font-medium">Categoría</th>
                    <th className="text-right py-3 px-4 font-medium">Cantidad</th>
                    <th className="text-right py-3 px-4 font-medium">Ingresos</th>
                    <th className="text-right py-3 px-4 font-medium">Precio Prom.</th>
                    <th className="text-right py-3 px-4 font-medium">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topProducts.map((product) => (
                    <tr key={product.productId} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{product.productName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{product.sku}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatNumber(product.quantitySold)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(product.totalRevenue)}</td>
                      <td className="py-3 px-4 text-right text-sm">{formatCurrency(product.averagePrice)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.profitMargin > 20 ? 'bg-green-100 text-green-800' :
                          product.profitMargin > 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formatPercentage(product.profitMargin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Clientes */}
      {selectedView === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segmentos de clientes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Segmentos de Clientes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nuevos</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(report.customerAnalytics.customerSegments.new / report.overview.totalCustomers) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{report.customerAnalytics.customerSegments.new}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recurrentes</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(report.customerAnalytics.customerSegments.returning / report.overview.totalCustomers) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{report.customerAnalytics.customerSegments.returning}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Leales</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(report.customerAnalytics.customerSegments.loyal / report.overview.totalCustomers) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{report.customerAnalytics.customerSegments.loyal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top clientes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Mejores Clientes</h3>
              <div className="space-y-3">
                {report.customerAnalytics.topCustomers.slice(0, 5).map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{customer.customerName}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-gray-500">{customer.orderCount} órdenes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Pagos */}
      {selectedView === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métodos de pago */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
              <div className="space-y-4">
                {report.paymentAnalytics.paymentMethods.map((method) => (
                  <div key={method.method} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{method.method.replace('_', ' ')}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatPercentage(method.percentage)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tendencias de pagos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Tendencias de Pagos</h3>
              <SalesChart
                type="pie"
                data={report.paymentAnalytics.paymentMethods.map((method: any) => ({
                  name: method.method.replace('_', ' '),
                  value: method.count
                }))}
                height={250}
                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
              />
            </div>
          </div>
        </div>
      )}

      {/* Información del período */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Período: {new Date(report.period.from).toLocaleDateString()} - {new Date(report.period.to).toLocaleDateString()}
          </span>
          <span>
            {report.period.days} días de datos
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoreManagerSales;
