import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Home, 
  Package, 
  Tag, 
  ShoppingCart, 
  Award, 
  Users, 
  Search, 
  Truck,
  Store,
  Settings,
  User,
  CreditCard,
  MapPin,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Bell,
  Shield,
  Key,
  Smartphone,
  Navigation,
  Calendar,
  TrendingUp,
  DollarSign,
  Gift,
  Heart,
  ShoppingBag,
  Building2,
  LayoutDashboard,
  Map,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onToggle,
  isCollapsed,
  onToggleCollapse
}) => {
  const { user } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { isDark } = useTheme();
  const location = useLocation();
  
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);

  const isActive = (path: string) => {
    const isExactMatch = location.pathname === path;
    const isPartialMatch = location.pathname.startsWith(path + '/');
    return isExactMatch || isPartialMatch;
  };

  // Menú específico para el cliente
  const menuItems = [
    {
      title: t('sidebar.client.home'),
      path: '/dashboard',
      icon: Home,
      description: t('sidebar.client.home.description')
    },
    {
      title: t('sidebar.client.products'),
      path: '/products',
      icon: Package,
      description: t('sidebar.client.products.description')
    },
    {
      title: t('sidebar.client.categories'),
      path: '/categories',
      icon: Tag,
      description: t('sidebar.client.categories.description')
    },
    {
      title: t('sidebar.client.cart'),
      path: '/cart',
      icon: ShoppingCart,
      description: t('sidebar.client.cart.description')
    },
    {
      title: t('sidebar.client.favorites'),
      path: '/favorites',
      icon: Heart,
      description: t('sidebar.client.favorites.description')
    },
    {
      title: t('sidebar.client.loyalty'),
      path: '/loyalty',
      icon: Award,
      description: t('sidebar.client.loyalty.description')
    },
    {
      title: t('sidebar.client.orders'),
      path: '/orders',
      icon: ShoppingBag,
      description: t('sidebar.client.orders.description')
    },
    {
      title: t('sidebar.client.profile'),
      path: '/profile',
      icon: User,
      description: t('sidebar.client.profile.description')
    },
    {
      title: t('sidebar.client.security'),
      path: '/security',
      icon: Shield,
      description: t('sidebar.client.security.description')
    },
    {
      title: t('sidebar.client.notifications'),
      path: '/notifications',
      icon: Bell,
      description: t('sidebar.client.notifications.description')
    }
  ];

  // Componente de selector de tema
  const ThemeSelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowThemeMenu(!showThemeMenu)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isDark 
            ? 'bg-gray-700 text-white hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        {!isCollapsed && <span>{isDark ? t('theme.dark') : t('theme.light')}</span>}
        {!isCollapsed && (showThemeMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </button>
      
      {showThemeMenu && !isCollapsed && (
        <div className={`
          absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg z-50
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <button
            onClick={() => {
              // Aquí conectarías con tu contexto de tema
              setShowThemeMenu(false);
            }}
            className={`
              w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700
              ${isDark ? 'text-white' : 'text-gray-700'}
            `}
          >
            <div className="flex items-center space-x-2">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? t('theme.switchToLight') : t('theme.switchToDark')}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  // Componente de selector de idioma
  const LanguageSelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isDark 
            ? 'bg-gray-700 text-white hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        <Globe className="w-4 h-4" />
        {!isCollapsed && <span>{t(`language.${currentLanguage}`)}</span>}
        {!isCollapsed && (showLanguageMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </button>
      
      {showLanguageMenu && !isCollapsed && (
        <div className={`
          absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg z-50
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          {(['es', 'en', 'pt'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                // Aquí conectarías con tu contexto de idioma
                setShowLanguageMenu(false);
              }}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                ${currentLanguage === lang 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : isDark ? 'text-white' : 'text-gray-700'
                }
              `}
            >
              {t(`language.${lang}`)}
            </button>
          ))}
        </div>
      )}
    </div>
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
      <div 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          ${isCollapsed ? 'w-16' : 'w-64'} border-r border-gray-200 dark:border-gray-700
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar - Solo botón de colapsar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {/* Botón para colapsar/expandir sidebar */}
              <button
                onClick={onToggleCollapse}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
                `}
                title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
                const isItemActive = isActive(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isItemActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      onClick={onClose}
                      title={isCollapsed ? item.description : undefined}
                    >
                      <Icon className="w-5 h-5" />
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

            {/* Controles de tema e idioma */}
            <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <ThemeSelector />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientSidebar;
