import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Home, 
  Package, 
  Tag, 
  ShoppingCart, 
  Heart,
  Award,
  ShoppingBag,
  User,
  Shield,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SimpleClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SimpleClientSidebar: React.FC<SimpleClientSidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed,
  onToggleCollapse
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();

  // Función para verificar si una ruta está activa
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Menú optimizado para el cliente con traducciones
  const menuItems = [
    { title: t('nav.home'), path: '/profile', icon: Home },
    { title: t('nav.orders'), path: '/orders', icon: ShoppingBag },
    { title: t('nav.favorites'), path: '/favorites', icon: Heart },
    { title: t('nav.cart'), path: '/cart', icon: ShoppingCart },
    { title: t('nav.loyalty'), path: '/loyalty', icon: Award },
    { title: t('nav.profile'), path: '/profile', icon: User },
    { title: t('nav.security'), path: '/security', icon: Shield },
    { title: t('nav.settings'), path: '/configuration', icon: Settings },
    { title: t('nav.notifications'), path: '/notifications', icon: Bell }
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
      <div 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
                     ${isCollapsed ? 'w-20' : 'w-64'} border-r border-gray-200 dark:border-gray-700
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar - SOLO BOTÓN DE COLAPSAR, SIN LOGO */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {/* Botón para colapsar/expandir sidebar */}
              <button
                onClick={onToggleCollapse}
                className={`
                  p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700
                  ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}
                `}
                title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              >
                                 {isCollapsed ? <ChevronRight className="w-8 h-8" /> : <ChevronLeft className="w-8 h-8" />}
              </button>

              {/* Botón para cerrar en móvil */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive(item.path) 
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                                                 ${isCollapsed ? 'justify-center px-2 py-3' : ''}
                      `}
                      onClick={onClose}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <Icon className={`${isCollapsed ? 'w-12 h-12' : 'w-6 h-6'}`} />
                      {!isCollapsed && <span className="flex-1">{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Información del usuario */}
            {!isCollapsed && (
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleClientSidebar;
