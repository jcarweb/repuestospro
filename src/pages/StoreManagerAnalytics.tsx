import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  sales: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    dailyData: Array<{ date: string; sales: number }>;
    monthlyData: Array<{ month: string; sales: number }>;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
    topSelling: Array<{ name: string; sales: number; percentage: number }>;
  };
  customers: {
    total: number;
    newThisMonth: number;
    returning: number;
    averageOrderValue: number;
    customerSegments: Array<{ segment: string; count: number; percentage: number }>;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    averageProcessingTime: number;
    orderStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>;
  };
}

interface SubscriptionInfo {
  name: string;
  type: 'basic' | 'pro' | 'elite';
  price: number;
  hasAnalyticsAccess: boolean;
  expiresAt?: string;
  status: 'active' | 'expired' | 'pending' | 'inactive';
}

const StoreManagerAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'products' | 'customers' | 'orders'>('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (activeStore?._id) {
      loadSubscriptionAndAnalytics();
    }
  }, [activeStore]);

  const loadSubscriptionAndAnalytics = async () => {
    if (!activeStore?._id) return;

    console.log('🏪 Tienda activa:', activeStore.name, 'ID:', activeStore._id);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Verificar acceso a analytics primero
      console.log('🔍 Verificando acceso a analytics para tienda:', activeStore._id);
      const analyticsAccessResponse = await fetch(`/api/analytics/check-access?storeId=${activeStore._id}`, {
        headers
      });

      console.log('📡 Respuesta de verificación:', analyticsAccessResponse.status);
      console.log('📡 Headers de respuesta:', Object.fromEntries(analyticsAccessResponse.headers.entries()));
      
      if (analyticsAccessResponse.ok) {
        const accessData = await analyticsAccessResponse.json();
        console.log('📊 Datos de acceso:', accessData);
        
        // Si no tiene acceso, mostrar información de suscripción
        if (!accessData.hasAccess) {
          console.log('🔒 Acceso denegado, mostrando mensaje de restricción');
          setSubscription(accessData.subscription);
          setLoading(false);
          return;
        }

        // Si tiene acceso, cargar datos de analytics
        console.log('✅ Acceso permitido, cargando datos de analytics');
        const analyticsResponse = await fetch(`/api/analytics/store/${activeStore._id}`, {
          headers
        });

        console.log('📡 Respuesta de analytics:', analyticsResponse.status);
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          console.log('📊 Datos de analytics cargados:', analyticsData);
          setAnalyticsData(analyticsData.data);
        } else {
          console.error('Error cargando datos de analytics:', analyticsResponse.status);
          setError('Error al cargar los datos de analytics');
        }
      } else {
        console.error('❌ Error verificando acceso:', analyticsAccessResponse.status);
        const errorText = await analyticsAccessResponse.text();
        console.error('📄 Respuesta de error:', errorText);
        setError('Error al verificar acceso a analytics');
      }

    } catch (err) {
      console.error('Error cargando analytics:', err);
      setError('Error al cargar los datos de analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗️' : '↘️';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si no tiene acceso a analytics, mostrar mensaje de restricción
  if (subscription && (subscription.type === 'basic' || !subscription.hasAnalyticsAccess)) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-8 text-center text-white">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-3xl font-bold mb-4">Analytics Avanzado</h1>
            <p className="text-lg mb-6">
              Tu plan actual <strong>{subscription.name}</strong> no incluye acceso a analytics avanzado.
            </p>
            <p className="text-purple-100 mb-8">
              Actualiza a un plan Pro o Elite para acceder a métricas detalladas, gráficos interactivos y análisis profundos de tu tienda.
            </p>
            <button
              onClick={() => window.location.href = '/monetization'}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Ver Planes Disponibles
            </button>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tu Plan Actual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Plan</p>
                <p className="font-semibold">{subscription.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Precio</p>
                <p className="font-semibold">{formatCurrency(subscription.price)}/mes</p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                  subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {subscription.status === 'active' ? 'Activo' :
                   subscription.status === 'expired' ? 'Expirado' : 'Pendiente'}
                </span>
              </div>
              {subscription.expiresAt && (
                <div>
                  <p className="text-gray-600">Expira</p>
                  <p className="font-semibold">{new Date(subscription.expiresAt).toLocaleDateString('es-VE')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay suscripción, mostrar mensaje de restricción
  if (!loading && !subscription) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-8 text-center text-white">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-3xl font-bold mb-4">Analytics Avanzado</h1>
            <p className="text-lg mb-6">
              No tienes una suscripción activa para acceder a analytics avanzado.
            </p>
            <p className="text-purple-100 mb-8">
              Actualiza a un plan Pro o Elite para acceder a métricas detalladas, gráficos interactivos y análisis profundos de tu tienda.
            </p>
            <button
              onClick={() => window.location.href = '/monetization'}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Ver Planes Disponibles
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadSubscriptionAndAnalytics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">No se pudieron cargar los datos de analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics de Tienda</h1>
        <p className="text-gray-600 mt-2">
          Métricas y análisis detallados de {activeStore?.name || 'tu tienda'}
        </p>
      </div>

      {/* Navegación de pestañas */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'sales'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ventas
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'customers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Clientes
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pedidos
        </button>
      </div>

      {/* Vista de Resumen */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ventas del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.sales.thisMonth)}</p>
                  <p className={`text-sm ${getGrowthColor(analyticsData.sales.growth)}`}>
                    {getGrowthIcon(analyticsData.sales.growth)} {formatPercentage(analyticsData.sales.growth)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Productos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.products.active)}</p>
                  <p className="text-sm text-gray-500">de {formatNumber(analyticsData.products.total)} total</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Clientes Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.customers.total)}</p>
                  <p className="text-sm text-green-600">+{formatNumber(analyticsData.customers.newThisMonth)} este mes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pedidos Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.orders.pending)}</p>
                  <p className="text-sm text-gray-500">de {formatNumber(analyticsData.orders.total)} total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de ventas diarias */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ventas Diarias (Últimos 30 días)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.sales.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Productos más vendidos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
              <div className="space-y-3">
                {analyticsData.products.topSelling.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(product.sales)} ventas</p>
                      <p className="text-sm text-gray-500">{product.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución de Clientes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.customers.customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segment, percentage }) => `${segment}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.customers.customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Ventas */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Tendencia de Ventas Mensuales</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.sales.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="sales" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ingresos por Categoría</h3>
            <div className="space-y-3">
              {analyticsData.revenue.revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.revenue)}</p>
                    <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Productos */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{formatNumber(analyticsData.products.active)}</div>
                <p className="text-gray-600">Productos Activos</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{formatNumber(analyticsData.products.lowStock)}</div>
                <p className="text-gray-600">Stock Bajo</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{formatNumber(analyticsData.products.outOfStock)}</div>
                <p className="text-gray-600">Sin Stock</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Productos Más Vendidos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posición
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porcentaje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.products.topSelling.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatNumber(product.sales)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.percentage.toFixed(1)}%</div>
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
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatNumber(analyticsData.customers.total)}</div>
                <p className="text-gray-600">Total Clientes</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{formatNumber(analyticsData.customers.newThisMonth)}</div>
                <p className="text-gray-600">Nuevos Este Mes</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(analyticsData.customers.averageOrderValue)}</div>
                <p className="text-gray-600">Valor Promedio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Segmentación de Clientes</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analyticsData.customers.customerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, percentage }) => `${segment}: ${percentage.toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.customers.customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vista de Pedidos */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{formatNumber(analyticsData.orders.total)}</div>
                <p className="text-gray-600">Total Pedidos</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{formatNumber(analyticsData.orders.completed)}</div>
                <p className="text-gray-600">Completados</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{formatNumber(analyticsData.orders.pending)}</div>
                <p className="text-gray-600">Pendientes</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{formatNumber(analyticsData.orders.cancelled)}</div>
                <p className="text-gray-600">Cancelados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución de Estados de Pedidos</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.orders.orderStatusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Métricas de Procesamiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {analyticsData.orders.averageProcessingTime.toFixed(1)}h
                </div>
                <p className="text-gray-600">Tiempo Promedio de Procesamiento</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {((analyticsData.orders.completed / analyticsData.orders.total) * 100).toFixed(1)}%
                </div>
                <p className="text-gray-600">Tasa de Completación</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerAnalytics;
