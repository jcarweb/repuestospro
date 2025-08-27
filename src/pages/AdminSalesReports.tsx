import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  Building2,
  User,
  Target,
  PieChart,
  Activity,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  X
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

interface Store {
  _id: string;
  name: string;
  location: string;
  manager: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
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

const AdminSalesReports: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Estados principales
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros avanzados
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estados de datos de filtros
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Estados de visualización
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'products' | 'customers' | 'payments' | 'stores'>('overview');
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

  // Cargar datos de filtros
  useEffect(() => {
    loadFilterData();
  }, []);

  // Cargar reporte cuando cambien los filtros
  useEffect(() => {
    if (dateFrom && dateTo) {
      loadSalesReport();
    }
  }, [dateFrom, dateTo, selectedStore, selectedUser, selectedCategory, selectedPaymentMethod, selectedOrderStatus, searchTerm]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSalesReport();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadFilterData = async () => {
    try {
      // Cargar tiendas
      const storesResponse = await fetch('/api/stores', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (storesResponse.ok) {
        const storesData = await storesResponse.json();
        setStores(storesData.data || []);
      }

      // Cargar usuarios
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }

      // Cargar categorías
      const categoriesResponse = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data?.map((cat: any) => cat.name) || []);
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const loadSalesReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        ...(selectedStore && { storeId: selectedStore }),
        ...(selectedUser && { userId: selectedUser }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedPaymentMethod && { paymentMethod: selectedPaymentMethod }),
        ...(selectedOrderStatus.length > 0 && { orderStatus: selectedOrderStatus.join(',') }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/sales-reports/admin?${params}`, {
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
        ...(selectedStore && { storeId: selectedStore }),
        ...(selectedUser && { userId: selectedUser }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedPaymentMethod && { paymentMethod: selectedPaymentMethod }),
        ...(selectedOrderStatus.length > 0 && { orderStatus: selectedOrderStatus.join(',') }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/sales-reports/admin/export?${params}`, {
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
      a.download = `admin-sales-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  const handleGenerateTestData = async () => {
    try {
      const response = await fetch('/api/sales-reports/generate-test-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar datos de prueba');
      }

      const data = await response.json();
      alert(data.message);
      
      // Recargar el reporte después de generar datos
      loadSalesReport();
    } catch (err) {
      console.error('Error generating test data:', err);
      alert('Error al generar datos de prueba');
    }
  };

  const handleGenerateStoreManagerTestData = async () => {
    try {
      const response = await fetch('/api/sales-reports/generate-store-manager-test-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: 'jucarl74@gmail.com'
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar datos de prueba para el gestor de tienda');
      }

      const data = await response.json();
      alert(data.message);
      
      // Recargar el reporte después de generar datos
      loadSalesReport();
    } catch (err) {
      console.error('Error generating store manager test data:', err);
      alert('Error al generar datos de prueba para el gestor de tienda');
    }
  };

  const clearFilters = () => {
    setSelectedStore('');
    setSelectedUser('');
    setSelectedCategory('');
    setSelectedPaymentMethod('');
    setSelectedOrderStatus([]);
    setSearchTerm('');
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reportes de Ventas - Administrador
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Análisis global de ventas con filtros avanzados
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
            <span className="ml-2">Filtros Avanzados</span>
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

          <button
            onClick={handleGenerateTestData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Generar Datos de Prueba</span>
          </button>

          <button
            onClick={handleGenerateStoreManagerTestData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Generar Datos para Gestor de Tienda</span>
          </button>
        </div>
      </div>

      {/* Filtros Avanzados */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filtros Avanzados</h3>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
            >
              Limpiar Filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Fechas */}
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

            {/* Tienda */}
            <div>
              <label className="block text-sm font-medium mb-2">Tienda</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las tiendas</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name} - {store.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium mb-2">Usuario</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los usuarios</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium mb-2">Método de Pago</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los métodos</option>
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="debit_card">Tarjeta de Débito</option>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            {/* Estado de Orden */}
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

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium mb-2">Búsqueda</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por producto, cliente..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {(selectedStore || selectedUser || selectedCategory || selectedPaymentMethod || selectedOrderStatus.length > 0 || searchTerm) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Filtros Activos:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedStore && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Tienda: {stores.find(s => s._id === selectedStore)?.name}
                  </span>
                )}
                {selectedUser && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Usuario: {users.find(u => u._id === selectedUser)?.name}
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Categoría: {selectedCategory}
                  </span>
                )}
                {selectedPaymentMethod && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Pago: {selectedPaymentMethod}
                  </span>
                )}
                {selectedOrderStatus.length > 0 && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Estados: {selectedOrderStatus.join(', ')}
                  </span>
                )}
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Búsqueda: {searchTerm}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navegación de vistas */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Vista General', icon: BarChart3 },
          { id: 'trends', label: 'Tendencias', icon: TrendingUp },
          { id: 'products', label: 'Productos', icon: Package },
          { id: 'customers', label: 'Clientes', icon: Users },
          { id: 'payments', label: 'Pagos', icon: DollarSign },
          { id: 'stores', label: 'Por Tiendas', icon: Building2 }
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
      {selectedView === 'overview' && report && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Ventas Global</p>
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
                <h3 className="text-lg font-semibold">Tendencias de Ventas Globales</h3>
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
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Gráfico de tendencias globales</p>
                  <p className="text-sm">Datos: {report.trends[trendPeriod].length} puntos</p>
                </div>
              </div>
            </div>

            {/* Gráfico de productos top */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos Globales</h3>
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

      {/* Vista de Tiendas */}
      {selectedView === 'stores' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Análisis por Tiendas</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium">Tienda</th>
                    <th className="text-left py-3 px-4 font-medium">Ubicación</th>
                    <th className="text-right py-3 px-4 font-medium">Ventas</th>
                    <th className="text-right py-3 px-4 font-medium">Órdenes</th>
                    <th className="text-right py-3 px-4 font-medium">Clientes</th>
                    <th className="text-right py-3 px-4 font-medium">Valor Prom.</th>
                    <th className="text-right py-3 px-4 font-medium">Rendimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store._id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-gray-500">{store.manager}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{store.location}</td>
                      <td className="py-3 px-4 text-right font-medium">$0.00</td>
                      <td className="py-3 px-4 text-right">0</td>
                      <td className="py-3 px-4 text-right">0</td>
                      <td className="py-3 px-4 text-right text-sm">$0.00</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          N/A
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

      {/* Información del período */}
      {report && (
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
      )}
    </div>
  );
};

export default AdminSalesReports;
