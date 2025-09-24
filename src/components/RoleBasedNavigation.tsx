import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import { 
  Home, 
  Package, 
  Tag, 
  ShoppingCart, 
  Award, 
  BarChart3, 
  Users, 
  Search, 
  Database,
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
  X
} from 'lucide-react';

interface RoleBasedNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'sidebar' | 'header' | 'mobile';
}

const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({ 
  isOpen, 
  onClose, 
  variant = 'sidebar' 
}) => {
  const { user, hasRole, hasAnyRole } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Forzar re-render cuando cambie el idioma
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [currentLanguage, t]);

  const isActive = (path: string) => {
    const isExactMatch = location.pathname === path;
    const isPartialMatch = location.pathname.startsWith(path + '/');
    return isExactMatch || isPartialMatch;
  };

  // Configuración de menús por rol con temas y traducciones
  const getMenuConfiguration = () => {
    const baseConfig = {
      admin: {
        title: t('sidebar.roles.admin'),
        icon: Shield,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        menuItems: [
          {
            title: t('sidebar.admin.dashboard'),
            path: '/admin/dashboard',
            icon: Home,
            description: t('sidebar.admin.dashboard.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.users'),
            path: '/admin/users',
            icon: Users,
            description: t('sidebar.admin.users.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.products'),
            path: '/admin/products',
            icon: Package,
            description: t('sidebar.admin.products.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.categories'),
            path: '/admin/categories',
            icon: Database,
            description: t('sidebar.admin.categories.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.promotions'),
            path: '/admin/promotions',
            icon: Tag,
            description: t('sidebar.admin.promotions.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.sales'),
            path: '/admin/sales',
            icon: ShoppingCart,
            description: t('sidebar.admin.sales.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.analytics'),
            path: '/admin/analytics',
            icon: BarChart3,
            description: t('sidebar.admin.analytics.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.loyalty'),
            path: '/admin/loyalty',
            icon: Award,
            description: t('sidebar.admin.loyalty.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.registrationCodes'),
            path: '/admin/registration-codes',
            icon: Key,
            description: t('sidebar.admin.registrationCodes.description'),
            badge: null
          },
          {
            title: t('sidebar.admin.globalSettings'),
            path: '/admin/settings',
            icon: Settings,
            description: t('sidebar.admin.globalSettings.description'),
            badge: null
          }
        ]
      },
      store_manager: {
        title: t('sidebar.roles.storeManager'),
        icon: Store,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        menuItems: [
          {
            title: t('sidebar.storeManager.dashboard'),
            path: '/store-manager/dashboard',
            icon: Home,
            description: t('sidebar.storeManager.dashboard.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.inventory'),
            path: '/store-manager/inventory',
            icon: Package,
            description: t('sidebar.storeManager.inventory.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.products'),
            path: '/store-manager/products',
            icon: Package,
            description: t('sidebar.storeManager.products.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.promotions'),
            path: '/store-manager/promotions',
            icon: Tag,
            description: t('sidebar.storeManager.promotions.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.sales'),
            path: '/store-manager/sales',
            icon: ShoppingCart,
            description: t('sidebar.storeManager.sales.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.orders'),
            path: '/store-manager/orders',
            icon: ShoppingBag,
            description: t('sidebar.storeManager.orders.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.delivery'),
            path: '/store-manager/delivery',
            icon: Truck,
            description: t('sidebar.storeManager.delivery.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.analytics'),
            path: '/store-manager/analytics',
            icon: BarChart3,
            description: t('sidebar.storeManager.analytics.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.messages'),
            path: '/store-manager/messages',
            icon: MessageSquare,
            description: t('sidebar.storeManager.messages.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.reviews'),
            path: '/store-manager/reviews',
            icon: Star,
            description: t('sidebar.storeManager.reviews.description'),
            badge: null
          },
          {
            title: t('sidebar.storeManager.settings'),
            path: '/store-manager/settings',
            icon: Settings,
            description: t('sidebar.storeManager.settings.description'),
            badge: null
          }
        ]
      },
      delivery: {
        title: t('sidebar.roles.delivery'),
        icon: Truck,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        menuItems: [
          {
            title: t('sidebar.delivery.dashboard'),
            path: '/delivery/dashboard',
            icon: LayoutDashboard,
            description: t('sidebar.delivery.dashboard.description'),
            badge: null
          },
          {
            title: t('sidebar.delivery.assignedOrders'),
            path: '/delivery/orders',
            icon: ShoppingBag,
            description: t('sidebar.delivery.assignedOrders.description'),
            badge: null
          },
          {
            title: t('sidebar.delivery.routeMap'),
            path: '/delivery/map',
            icon: Map,
            description: t('sidebar.delivery.routeMap.description'),
            badge: null
          },
          {
            title: t('sidebar.delivery.deliveryReport'),
            path: '/delivery/report',
            icon: FileText,
            description: t('sidebar.delivery.deliveryReport.description'),
            badge: null
          },
          {
            title: t('sidebar.delivery.ratings'),
            path: '/delivery/ratings',
            icon: Star,
            description: t('sidebar.delivery.ratings.description'),
            badge: null
          },
          {
            title: t('sidebar.delivery.workSchedule'),
            path: '/delivery/schedule',
            icon: Calendar,
            description: t('sidebar.delivery.workSchedule.description'),
            badge: null
          },
          {
            title: t('sidebar.delivery.availabilityStatus'),
            path: '/delivery/status',
            icon: Bell,
            description: t('sidebar.delivery.availabilityStatus.description'),
            badge: null
          },
          {
            title: t('sidebar.delivery.profile'),
            path: '/delivery/profile',
            icon: User,
            description: t('sidebar.delivery.profile.description'),
            badge: null
          }
        ]
      },
      client: {
        title: t('sidebar.roles.client'),
        icon: User,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        menuItems: [
          {
            title: t('sidebar.client.home'),
            path: '/',
            icon: Home,
            description: t('sidebar.client.home.description'),
            badge: null
          },
          {
            title: t('sidebar.client.products'),
            path: '/products',
            icon: Package,
            description: t('sidebar.client.products.description'),
            badge: null
          },
          {
            title: t('sidebar.client.categories'),
            path: '/categories',
            icon: Database,
            description: t('sidebar.client.categories.description'),
            badge: null
          },
          {
            title: t('sidebar.client.cart'),
            path: '/cart',
            icon: ShoppingCart,
            description: t('sidebar.client.cart.description'),
            badge: null
          },
          {
            title: t('sidebar.client.favorites'),
            path: '/favorites',
            icon: Heart,
            description: t('sidebar.client.favorites.description'),
            badge: null
          },
          {
            title: t('sidebar.client.loyalty'),
            path: '/loyalty',
            icon: Award,
            description: t('sidebar.client.loyalty.description'),
            badge: null
          },
          {
            title: t('sidebar.client.myOrders'),
            path: '/orders',
            icon: ShoppingBag,
            description: t('sidebar.client.myOrders.description'),
            badge: null
          },
          {
            title: t('sidebar.client.profile'),
            path: '/profile',
            icon: User,
            description: t('sidebar.client.profile.description'),
            badge: null
          },
          {
            title: t('sidebar.client.security'),
            path: '/security',
            icon: Shield,
            description: t('sidebar.client.security.description'),
            badge: null
          },
          {
            title: t('sidebar.client.notifications'),
            path: '/notifications',
            icon: Bell,
            description: t('sidebar.client.notifications.description'),
            badge: null
          }
        ]
      },
      seller: {
        title: t('sidebar.roles.seller'),
        icon: Users,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        menuItems: [
          {
            title: t('sidebar.seller.dashboard'),
            path: '/seller/dashboard',
            icon: LayoutDashboard,
            description: t('sidebar.seller.dashboard.description'),
            badge: null
          },
          {
            title: t('sidebar.seller.priceConsultation'),
            path: '/seller/prices',
            icon: DollarSign,
            description: t('sidebar.seller.priceConsultation.description'),
            badge: null
          },
          {
            title: t('sidebar.seller.customerChat'),
            path: '/seller/chat',
            icon: MessageSquare,
            description: t('sidebar.seller.customerChat.description'),
            badge: null
          },
          {
            title: t('sidebar.seller.quotes'),
            path: '/seller/quotes',
            icon: FileText,
            description: t('sidebar.seller.quotes.description'),
            badge: null
          },
          {
            title: t('sidebar.seller.products'),
            path: '/seller/products',
            icon: Package,
            description: t('sidebar.seller.products.description'),
            badge: null
          },
          {
            title: t('sidebar.seller.customers'),
            path: '/seller/customers',
            icon: Users,
            description: t('sidebar.seller.customers.description'),
            badge: null
          },
          {
            title: t('sidebar.seller.performance'),
            path: '/seller/performance',
            icon: BarChart3,
            description: t('sidebar.seller.performance.description'),
            badge: null
          },
          {
            title: t('sidebar.seller.profile'),
            path: '/seller/profile',
            icon: User,
            description: t('sidebar.seller.profile.description'),
            badge: null
          }
        ]
      }
    };

    // Determinar configuración según el rol
    if (hasRole('admin')) return baseConfig.admin;
    if (hasRole('store_manager')) return baseConfig.store_manager;
    if (hasRole('delivery')) return baseConfig.delivery;
    if (hasRole('seller')) return baseConfig.seller;
    if (hasRole('client')) return baseConfig.client;
    
    return baseConfig.client; // Default
  };

  const config = getMenuConfiguration();

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
        <span>{isDark ? t('theme.dark') : t('theme.light')}</span>
        {showThemeMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {showThemeMenu && (
        <div className={`
          absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg z-50
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <button
            onClick={() => {
              toggleTheme();
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
        <span>{t(`language.${currentLanguage}`)}</span>
        {showLanguageMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {showLanguageMenu && (
        <div className={`
          absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg z-50
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          {(['es', 'en', 'pt'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
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

  // Renderizado según variante
  if (variant === 'header') {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <config.icon className={`w-5 h-5 ${config.color}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {config.title}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeSelector />
          <LanguageSelector />
        </div>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`
        fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden
        ${isOpen ? 'block' : 'hidden'}
      `}>
        <div className={`
          fixed top-0 left-0 h-full w-80 max-w-[80vw] 
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          shadow-xl transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Header móvil */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Logo className="h-8 w-auto" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">PIEZAS YA</h1>
                  <p className={`text-sm ${config.color}`}>{config.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {config.menuItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = isActive(item.path);
                
                return (
                  <li key={`${item.path}-${currentLanguage}-${forceUpdate}`}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isItemActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                      onClick={onClose}
                      title={item.description}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer móvil */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
            
            <div className="flex items-center space-x-2">
              <ThemeSelector />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variante sidebar (default)
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
        key={`sidebar-${currentLanguage}-${forceUpdate}`}
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64 border-r border-gray-200 dark:border-gray-700
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Logo className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">PIEZAS YA</h1>
                <div className="flex items-center space-x-2">
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                  <p className={`text-sm ${config.color} font-medium`}>
                    {config.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {config.menuItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = isActive(item.path);
                
                return (
                  <li key={`${item.path}-${currentLanguage}-${forceUpdate}`}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isItemActive
                          ? `${config.bgColor} ${config.color} border-r-2 border-current`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                      onClick={onClose}
                      title={item.description}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
            
            <div className="flex items-center space-x-2">
              <ThemeSelector />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleBasedNavigation;
