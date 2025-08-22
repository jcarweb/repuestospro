import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';
import AuthModal from './AuthModal';
import Logo from './Logo';
import LanguageSelector from './LanguageSelector';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Menu,
  X,
  Search,
  Heart
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const { getFavoritesCount } = useFavorites();
  const { t } = useLanguage();
  const { forceUpdate } = useLanguageChange();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const cartItemCount = getItemCount();
  const favoritesCount = getFavoritesCount();
  
  // Ref para detectar clicks fuera del menú
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleMenuClick = (path: string) => {
    // Navegar según el rol del usuario
    if (user?.role === 'admin') {
      navigate(`/admin${path}`);
    } else if (user?.role === 'store_manager') {
      navigate(`/store-manager${path}`);
    } else if (user?.role === 'delivery') {
      // Para delivery, usar una ruta diferente para evitar conflicto con /delivery/profile
      if (path === '/profile') {
        navigate('/delivery/user-profile');
      } else {
        navigate(`/delivery${path}`);
      }
    } else {
      // Para clientes y otros roles
      navigate(path);
    }
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-[#333333] shadow-sm border-b border-gray-200 dark:border-[#555555]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/categories" 
              className="text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors"
            >
              {t('nav.categories')}
            </Link>
            <Link 
              to="/nearby-products" 
              className="text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors"
            >
              {t('common.nearbyProducts')}
            </Link>
            <Link 
              to="/" 
              className="text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors"
            >
              {t('nav.home')}
            </Link>
          </nav>

          {/* Right side - Search, Cart, User */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
              />
            </div>

            {/* Favorites */}
            <Link to="/favorites" className="relative p-2 text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors">
              <Heart className="w-6 h-6" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-[#444444]"
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-[#555555] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-200" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#333333] dark:text-white">
                    {user?.name || t('common.user')}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#333333] rounded-lg shadow-lg border border-gray-200 dark:border-[#555555] py-2 z-50">
                    <button
                      onClick={() => handleMenuClick('/profile')}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444] w-full text-left"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('common.profile')}</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick('/security')}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444] w-full text-left"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{t('common.security')}</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick('/configuration')}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444] w-full text-left"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t('common.settings')}</span>
                    </button>
                    
                    <hr className="my-2 border-gray-200 dark:border-[#555555]" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAuthClick('login')}
                  className="text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors"
                >
                  {t('common.login')}
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors font-semibold"
                >
                  {t('common.register')}
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

                 {/* Mobile Navigation */}
         {isMenuOpen && (
           <div className="md:hidden border-t border-gray-200 dark:border-[#555555] py-4">
             <div className="space-y-2">
                                <Link
                   to="/categories"
                   className="block px-4 py-2 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#444444] rounded-lg"
                   onClick={() => setIsMenuOpen(false)}
                 >
                   {t('common.categories')}
                 </Link>
                 <Link
                   to="/"
                   className="block px-4 py-2 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#444444] rounded-lg"
                   onClick={() => setIsMenuOpen(false)}
                 >
                   {t('common.home')}
                 </Link>
                             {isAuthenticated && (
                 <>
                   <Link
                     to="/profile"
                     className="block px-4 py-2 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#444444] rounded-lg"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     {t('common.profile')}
                   </Link>
                   <Link
                     to="/security"
                     className="block px-4 py-2 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#444444] rounded-lg"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     {t('common.security')}
                   </Link>
                   <Link
                     to="/configuration"
                     className="block px-4 py-2 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#444444] rounded-lg"
                     onClick={() => setIsMenuOpen(false)}
                   >
                     {t('common.settings')}
                   </Link>
                   
                   <button
                     onClick={handleLogout}
                     className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                   >
                     {t('common.logout')}
                   </button>
                 </>
               )}
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </header>
  );
};

export default Header; 