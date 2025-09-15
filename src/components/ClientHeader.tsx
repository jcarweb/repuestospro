import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import AvatarImageSimple from './AvatarImageSimple';
import NotificationDropdown from './NotificationDropdown';
import { profileService } from '../services/profileService';
import { notificationService } from '../services/notificationService';
import { 
  ShoppingCart, 
  User, 
  Settings, 
  Shield, 
  LogOut, 
  Menu,
  X,
  ChevronDown,
  Bell,
  Heart,
  Search
} from 'lucide-react';

interface ClientHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isSidebarCollapsed?: boolean;
  cartItemCount?: number;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({
  onToggleSidebar, 
  isSidebarOpen,
  isSidebarCollapsed = false,
  cartItemCount = 0
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Cargar perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          setLoadingProfile(true);
          const profile = await profileService.getProfile();
          setUserProfile(profile);
        } catch (error: any) {
          console.error('Error cargando perfil:', error);
          // Si es error de autenticación, no hacer nada - el AuthContext se encargará
          if (error.message === 'Usuario no autenticado') {
            console.log('ClientHeader: Token inválido, pero manteniendo sesión local');
          }
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Cargar conteo de notificaciones no leídas
  useEffect(() => {
    const loadNotificationCount = async () => {
      if (user) {
        try {
          const response = await notificationService.getUnreadNotifications(1);
          setNotificationCount(response.data.unreadCount);
        } catch (error) {
          console.error('Error loading notification count:', error);
        }
      }
    };

    loadNotificationCount();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar búsqueda
    console.log('Buscando:', searchQuery);
  };

  const userMenuItems = [
    {
      label: t('header.profile'),
      icon: User,
      action: () => navigate('/profile')
    },
    {
      label: t('header.security'),
      icon: Shield,
      action: () => navigate('/security')
    },
    {
      label: t('header.settings'),
      icon: Settings,
      action: () => navigate('/configuration')
    },
    {
      label: t('header.logout'),
      icon: LogOut,
      action: handleLogout
    }
  ];

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300
      ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
      ${isSidebarOpen ? (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''}
    `}>
      <div className="flex items-center justify-between px-6 py-3 w-full">
        {/* Logo - Izquierda (pegado al margen) */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Enlaces del ecommerce y búsqueda - Centro */}
        <div className="flex items-center space-x-8 flex-1 justify-center max-w-4xl">
          {/* Enlaces del ecommerce */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/categories" 
              className="text-gray-700 dark:text-gray-300 hover:text-[#FFC300] transition-colors font-medium"
            >
              Categorías
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 dark:text-gray-300 hover:text-[#FFC300] transition-colors font-medium"
            >
              Productos
            </Link>
            <Link 
              to="/promotions" 
              className="text-gray-700 dark:text-gray-300 hover:text-[#FFC300] transition-colors font-medium"
            >
              Promociones
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 dark:text-gray-300 hover:text-[#FFC300] transition-colors font-medium"
            >
              Nosotros
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 dark:text-gray-300 hover:text-[#FFC300] transition-colors font-medium"
            >
              Contacto
            </Link>
          </div>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="relative ml-8">
            <input
              type="text"
              placeholder="Buscar repuestos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#444444] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </form>
        </div>

        {/* Usuario y acciones - Derecha (pegado al margen) */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Favoritos */}
          <Link
            to="/favorites"
            className={`
              p-2 rounded-lg transition-colors relative
              ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
            `}
            title={t('header.favorites')}
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Notificaciones */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`
              p-2 rounded-lg transition-colors relative
              ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
            `}
            title={t('header.notifications')}
          >
            <Bell className="w-5 h-5" />
            {/* Badge de notificaciones */}
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* Carrito de Compras */}
          <Link
            to="/cart"
            className={`
              p-2 rounded-lg transition-colors relative
              ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
            `}
            title={t('header.cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Menú de Usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                flex items-center space-x-2 p-2 rounded-lg transition-colors
                ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
              `}
            >
              {loadingProfile ? (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <AvatarImageSimple
                  avatar={userProfile?.avatar}
                  alt={user?.name || 'Usuario'}
                  size="sm"
                  className="w-8 h-8"
                />
              )}
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Cliente</div>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown del menú de usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                {userMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                                         <button
                       key={index}
                       onClick={() => {
                         item.action();
                         setShowUserMenu(false);
                       }}
                       className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                     >
                       <Icon className="w-4 h-4" />
                       <span className="text-sm font-medium">{item.label}</span>
                     </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown de notificaciones */}
      <NotificationDropdown
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationCountChange={setNotificationCount}
      />
    </header>
  );
};

export default ClientHeader;
