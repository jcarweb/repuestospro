import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Tag, 
  Home, 
  ShoppingCart, 
  Package, 
  Settings,
  Award,
  Shield,
  User,
  Search,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: Home,
      roles: ['admin', 'store_manager']
    },
    {
      title: 'Productos',
      path: '/admin/products',
      icon: Package,
      roles: ['admin', 'store_manager']
    },
    {
      title: 'Categorías',
      path: '/admin/categories',
      icon: Package,
      roles: ['admin', 'store_manager']
    },
    {
      title: 'Promociones',
      path: '/admin/promotions',
      icon: Tag,
      roles: ['admin', 'store_manager']
    },
    {
      title: 'Ventas',
      path: '/admin/sales',
      icon: ShoppingCart,
      roles: ['admin', 'store_manager']
    },
    {
      title: 'Fidelización',
      path: '/admin/loyalty',
      icon: Award,
      roles: ['admin', 'store_manager']
    },
    {
      title: 'Google Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
      roles: ['admin']
    },
    {
      title: 'Códigos de Registro',
      path: '/admin/registration-codes',
      icon: Users,
      roles: ['admin']
    },
    {
      title: 'Configuración de Búsqueda',
      path: '/admin/search-config',
      icon: Search,
      roles: ['admin']
    },
    {
      title: 'Generar Productos',
      path: '/admin/generate-products',
      icon: Database,
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

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
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Panel de Control
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Información del usuario */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive(item.path) 
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Mi Perfil</span>
              </Link>
              <Link
                to="/profile?section=settings"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Configuración</span>
              </Link>
              <Link
                to="/security"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span>Seguridad</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 