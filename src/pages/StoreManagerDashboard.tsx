import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Star, 
  MessageSquare,
  DollarSign,
  BarChart3
} from 'lucide-react';

const StoreManagerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Datos de ejemplo - en una implementación real vendrían de la API
  const stats = {
    totalProducts: 156,
    activePromotions: 8,
    pendingOrders: 12,
    totalSales: 15420.50,
    averageRating: 4.2,
    unreadMessages: 5,
    monthlyGrowth: 15.3,
    conversionRate: 3.8
  };

  const recentOrders = [
    { id: '1', customer: 'Juan Pérez', amount: 125.00, status: 'Pendiente', date: '2024-01-15' },
    { id: '2', customer: 'María García', amount: 89.50, status: 'En proceso', date: '2024-01-14' },
    { id: '3', customer: 'Carlos López', amount: 234.75, status: 'Entregado', date: '2024-01-13' },
  ];

  const quickActions = [
    { title: 'Agregar Producto', icon: Package, action: () => console.log('Agregar producto') },
    { title: 'Crear Promoción', icon: TrendingUp, action: () => console.log('Crear promoción') },
    { title: 'Ver Pedidos', icon: ShoppingCart, action: () => console.log('Ver pedidos') },
    { title: 'Mensajes', icon: MessageSquare, action: () => console.log('Ver mensajes') },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de Gestión de Tienda
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.name || 'Gestor de Tienda'}
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promociones Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePromotions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones rápidas */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <action.icon className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recientes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">ID</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Monto</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 text-sm text-gray-900">#{order.id}</td>
                      <td className="py-2 text-sm text-gray-700">{order.customer}</td>
                      <td className="py-2 text-sm text-gray-900">${order.amount}</td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
              <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagerDashboard;
