import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Package, TrendingUp, DollarSign, Settings, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#333333]">Panel de Administración</h1>
        <p className="text-gray-600">Bienvenido, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#FFC300]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#FFC300] bg-opacity-20">
              <Users className="w-6 h-6 text-[#FFC300]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios</p>
              <p className="text-2xl font-semibold text-[#333333]">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#E63946]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#E63946] bg-opacity-20">
              <Package className="w-6 h-6 text-[#E63946]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-semibold text-[#333333]">5,678</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#FFC300]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#FFC300] bg-opacity-20">
              <TrendingUp className="w-6 h-6 text-[#FFC300]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas</p>
              <p className="text-2xl font-semibold text-[#333333]">$45,678</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#E63946]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#E63946] bg-opacity-20">
              <BarChart3 className="w-6 h-6 text-[#E63946]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Órdenes</p>
              <p className="text-2xl font-semibold text-[#333333]">892</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[#333333] mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FFC300] hover:bg-opacity-10 rounded-lg transition-colors">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-[#FFC300] mr-3" />
                <span className="text-[#333333]">Gestionar Usuarios</span>
              </div>
              <span className="text-[#FFC300]">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FFC300] hover:bg-opacity-10 rounded-lg transition-colors">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-[#E63946] mr-3" />
                <span className="text-[#333333]">Gestionar Productos</span>
              </div>
              <span className="text-[#E63946]">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FFC300] hover:bg-opacity-10 rounded-lg transition-colors">
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-[#333333] mr-3" />
                <span className="text-[#333333]">Configuración</span>
              </div>
              <span className="text-[#333333]">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[#333333] mb-4">Actividad Reciente</h3>
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
          <h3 className="text-lg font-semibold text-[#333333] mb-4">Estadísticas</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ventas del mes</span>
                <span className="font-medium">$12,345</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-[#FFC300] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Usuarios activos</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-[#E63946] h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Productos vendidos</span>
                <span className="font-medium">567</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-[#FFC300] h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 