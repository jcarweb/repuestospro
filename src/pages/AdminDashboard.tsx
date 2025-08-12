import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Package, TrendingUp, DollarSign, Settings, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Bienvenido, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios</p>
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-semibold text-gray-900">5,678</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ventas</p>
                <p className="text-2xl font-semibold text-gray-900">$45,678</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Órdenes</p>
                <p className="text-2xl font-semibold text-gray-900">892</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <span>Gestionar Usuarios</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-green-600 mr-3" />
                  <span>Gestionar Productos</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-purple-600 mr-3" />
                  <span>Configuración</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Nuevo usuario registrado</p>
                  <p className="text-xs text-gray-500">Hace 5 minutos</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Producto agregado</p>
                  <p className="text-xs text-gray-500">Hace 15 minutos</p>
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Orden completada</p>
                  <p className="text-xs text-gray-500">Hace 1 hora</p>
                </div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ventas del mes</span>
                  <span className="font-medium">$12,345</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usuarios activos</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Productos vendidos</span>
                  <span className="font-medium">567</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 