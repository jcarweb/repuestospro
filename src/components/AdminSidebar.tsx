import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  X, 
  Package, 
  Users, 
  BarChart3, 
  Gift, 
  Cog, 
  Search,
  ShoppingCart,
  TrendingUp,
  Settings,
  Key,
  Database
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: BarChart3
    },
    {
      name: 'Usuarios',
      path: '/admin/users',
      icon: Users
    },
    {
      name: 'Productos',
      path: '/admin/products',
      icon: Package
    },
    {
      name: 'Categorías',
      path: '/admin/categories',
      icon: Database
    },
    {
      name: 'Promociones',
      path: '/admin/promotions',
      icon: Gift
    },
    {
      name: 'Ventas',
      path: '/admin/sales',
      icon: ShoppingCart
    },
    {
      name: 'Fidelización',
      path: '/admin/loyalty',
      icon: TrendingUp
    },
    {
      name: 'Google Analytics',
      path: '/admin/analytics',
      icon: BarChart3
    },
    {
      name: 'Códigos de Registro',
      path: '/admin/registration-codes',
      icon: Key
    },
    {
      name: 'Configuración de Búsqueda',
      path: '/admin/search-config',
      icon: Search
    },
    {
      name: 'Generar Productos',
      path: '/admin/generate-products',
      icon: Package
    },
    {
      name: 'Configuración Global',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#FFC300] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#333333]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#333333]">PiezasYA</h1>
              <p className="text-sm text-gray-500">Administrador</p>
            </div>
          </div>
          
          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menú */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-[#FFC300] bg-opacity-20 text-[#333333] border-r-2 border-[#FFC300]'
                    : 'text-[#333333] hover:bg-[#FFC300] hover:bg-opacity-10 hover:text-[#333333]'
                  }
                `}
                onClick={onClose}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#333333]">Administrador</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
