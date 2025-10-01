import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import { 
  X, 
  Package, 
  Users, 
  BarChart3, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  User,
  Settings,
  Bell,
  TrendingUp,
  Star,
  ShoppingCart,
  Search,
  Target,
  Award
} from 'lucide-react';

interface SellerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t, currentLanguage, updateTrigger } = useLanguage();
  const location = useLocation();
  
  // Estado local para forzar re-renders
  const [forceUpdate, setForceUpdate] = useState(0);

  // Forzar re-render cuando cambie el idioma
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [currentLanguage, updateTrigger, t]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Menú específico para vendedores
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/seller/dashboard',
      icon: BarChart3,
      description: 'Panel principal',
      badge: null
    },
    {
      title: 'Consulta de Precios',
      path: '/seller/prices',
      icon: DollarSign,
      description: 'Consultar precios',
      badge: null
    },
    {
      title: 'Chat con Clientes',
      path: '/seller/chat',
      icon: MessageSquare,
      description: 'Atención al cliente',
      badge: null
    },
    {
      title: 'Cotizaciones',
      path: '/seller/quotes',
      icon: FileText,
      description: 'Gestionar cotizaciones',
      badge: null
    },
    {
      title: 'Productos',
      path: '/seller/products',
      icon: Package,
      description: 'Catálogo de productos',
      badge: null
    },
    {
      title: 'Clientes',
      path: '/seller/customers',
      icon: Users,
      description: 'Gestión de clientes',
      badge: null
    },
    {
      title: 'Rendimiento',
      path: '/seller/performance',
      icon: TrendingUp,
      description: 'Métricas de ventas',
      badge: null
    },
    {
      title: 'Perfil',
      path: '/seller/profile',
      icon: User,
      description: 'Mi perfil',
      badge: null
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
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#333333] shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar - Solo botón de cerrar en móvil */}
          <div className="flex items-center justify-end p-4 border-b border-gray-200 dark:border-gray-600 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Información del usuario */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'Vendedor'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 mt-1">
                  Vendedor
                </span>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isItemActive 
                      ? 'bg-[#FFC300] text-[#333333] shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-600">
            <div className="space-y-2">
              <Link
                to="/seller/configuration"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </Link>
              
              <Link
                to="/seller/notifications"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>Notificaciones</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerSidebar;
