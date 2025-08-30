import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSidebarConfig } from '../hooks/useSidebarConfig';
import Logo from './Logo';
import { 
  Home, 
  Package, 
  Tag, 
  ShoppingCart, 
  ShoppingBag,
  Truck,
  BarChart3,
  MessageSquare,
  Star,
  Building2,
  Users,
  Bell,
  TrendingUp,
  Settings
} from 'lucide-react';

interface StoreManagerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const StoreManagerSidebar: React.FC<StoreManagerSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { t, currentLanguage, updateTrigger } = useLanguage();
  const location = useLocation();
  
  const { config, getVisibleMenuItems, getWidthClass, getThemeClass } = useSidebarConfig();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Forzar re-render cuando cambie el idioma
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [currentLanguage, updateTrigger, t]);

  const isActive = (path: string) => {
    const isExactMatch = location.pathname === path;
    const isPartialMatch = location.pathname.startsWith(path + '/');
    return isExactMatch || isPartialMatch;
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Home, Package, Tag, ShoppingCart, ShoppingBag, Truck, BarChart3,
      MessageSquare, Star, Building2, Users, Bell, TrendingUp, Settings
    };
    return iconMap[iconName] || Home;
  };

  if (!config) {
    return null;
  }

  const visibleMenuItems = getVisibleMenuItems();

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
        key={`store-manager-sidebar-${currentLanguage}-${forceUpdate}`}
        className={`
          fixed top-0 left-0 h-full shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          ${getWidthClass()} border-r border-gray-200 dark:border-[#555555]
          ${getThemeClass()}
          ${config.enableAnimations ? 'transition-all duration-300' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-[#555555]">
            <div className="flex items-center space-x-3">
              <Logo className="h-8 w-auto" />
              <div className={config.width === 'compact' ? 'hidden' : ''}>
                <h1 className="text-lg font-bold text-[#333333] dark:text-[#FFC300]">PIEZAS YA</h1>
                <p className="text-sm text-gray-500 dark:text-white capitalize">
                  Gestor de Tienda
                </p>
              </div>
            </div>
            
            {config.showStoreInfo && activeStore && config.width !== 'compact' && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded text-xs">
                <p className="font-medium text-blue-900 dark:text-blue-100">{activeStore.name}</p>
                <p className="text-blue-700 dark:text-blue-300">{activeStore.city}</p>
              </div>
            )}
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {visibleMenuItems.map((item) => {
                const Icon = getIconComponent(item.icon);
                const isItemActive = isActive(item.path);
                
                return (
                  <li key={`${item.path}-${currentLanguage}-${forceUpdate}`}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isItemActive
                          ? 'bg-[#FFC300] bg-opacity-20 text-[#333333] border-r-2 border-[#FFC300]'
                          : 'text-[#333333] dark:text-white hover:bg-[#FFC300] hover:bg-opacity-10 hover:text-[#333333]'
                        }
                      `}
                      onClick={onClose}
                      title={config.showDescriptions ? item.description : undefined}
                    >
                      {config.showIcons && <Icon className="w-5 h-5 text-[#333333] dark:text-white" />}
                      {config.width !== 'compact' && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {config.showUserInfo && (
            <div className="p-4 border-t border-gray-200 dark:border-[#555555]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-[#555555] rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-200" />
                </div>
                {config.width !== 'compact' && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StoreManagerSidebar;
