import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  StarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface DeliveryStats {
  deliveryStats: {
    totalDeliverys: number;
    activeDeliverys: number;
    approvedDeliverys: number;
    pendingDeliverys: number;
    suspendedDeliverys: number;
    averageRating: number;
    totalDeliveries: number;
    totalEarnings: number;
  };
  transactionStats: {
    totalTransactions: number;
    totalPayments: number;
    totalWithdrawals: number;
    totalBonuses: number;
  };
  orderStats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalOrderValue: number;
    totalDeliveryFees: number;
    totalBonuses: number;
  };
  period: number;
}

interface ProfitabilityReport {
  totalOrders: number;
  totalOrderValue: number;
  totalDeliveryFees: number;
  totalBonuses: number;
  totalCommissionDeduction: number;
  averageOrderValue: number;
  averageDeliveryFee: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  costPerOrder: number;
  revenuePerOrder: number;
}

const AdminDeliveryReports: React.FC = () => {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [profitability, setProfitability] = useState<ProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [zone, setZone] = useState('all');

  useEffect(() => {
    fetchStats();
    fetchProfitabilityReport();
  }, [period, startDate, endDate, zone]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(zone !== 'all' && { zone })
      });

      const response = await fetch(`/api/admin/delivery/stats?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitabilityReport = async () => {
    try {
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(zone !== 'all' && { zone })
      });

      const response = await fetch(`/api/admin/delivery/reports/profitability?${params}`);
      const data = await response.json();

      if (data.success) {
        setProfitability(data.data);
      }
    } catch (error) {
      console.error('Error fetching profitability report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes de Deliverys</h1>
        <p className="text-gray-600">Análisis de rendimiento y rentabilidad del sistema de deliverys</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las zonas</option>
              <option value="centro">Centro</option>
              <option value="norte">Norte</option>
              <option value="sur">Sur</option>
              <option value="este">Este</option>
              <option value="oeste">Oeste</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TruckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Deliverys</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.deliveryStats.totalDeliverys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.deliveryStats.activeDeliverys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rating Promedio</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.deliveryStats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ganancias Totales</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.deliveryStats.totalEarnings)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas de Transacciones */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Transacciones</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.transactionStats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pagos Totales</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.transactionStats.totalPayments)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDownIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Retiros Totales</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.transactionStats.totalWithdrawals)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GiftIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bonos Totales</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.transactionStats.totalBonuses)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reporte de Rentabilidad */}
      {profitability && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Análisis de Rentabilidad</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ingresos</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor Total Pedidos:</span>
                  <span className="font-medium">{formatCurrency(profitability.totalOrderValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Comisión Generada:</span>
                  <span className="font-medium">{formatCurrency(profitability.totalCommissionDeduction)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-gray-900">Total Ingresos:</span>
                  <span className="font-bold text-green-600">{formatCurrency(profitability.totalRevenue)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Costos</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tarifas de Entrega:</span>
                  <span className="font-medium">{formatCurrency(profitability.totalDeliveryFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bonos Otorgados:</span>
                  <span className="font-medium">{formatCurrency(profitability.totalBonuses)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-gray-900">Total Costos:</span>
                  <span className="font-bold text-red-600">{formatCurrency(profitability.totalCost)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Rentabilidad</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Margen Neto:</span>
                  <span className={`font-bold ${profitability.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profitability.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Margen %:</span>
                  <span className={`font-bold ${profitability.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(profitability.profitMargin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Costo por Pedido:</span>
                  <span className="font-medium">{formatCurrency(profitability.costPerOrder)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ingreso por Pedido:</span>
                  <span className="font-medium">{formatCurrency(profitability.revenuePerOrder)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas de Pedidos */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Estadísticas de Pedidos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.orderStats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.orderStats.completedOrders}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.orderStats.cancelledOrders}</div>
              <div className="text-sm text-gray-600">Cancelados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.orderStats.totalOrderValue)}</div>
              <div className="text-sm text-gray-600">Valor Total</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.orderStats.averageOrderValue || 0)}</div>
              <div className="text-sm text-gray-600">Valor Promedio por Pedido</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.orderStats.averageDeliveryFee || 0)}</div>
              <div className="text-sm text-gray-600">Tarifa Promedio de Entrega</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.orderStats.totalOrders > 0 ? 
                  ((stats.orderStats.completedOrders / stats.orderStats.totalOrders) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Tasa de Completitud</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeliveryReports;
