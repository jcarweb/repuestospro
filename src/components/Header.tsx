import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import AuthModal from './AuthModal';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Menu,
  X,
  Search,
  Package,
  BarChart3,
  Users,
  Gift,
  Cog,
  Heart
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const { getFavoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const cartItemCount = getItemCount();
  const favoritesCount = getFavoritesCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const isAdmin = user?.role === 'admin';
  const isStoreManager = user?.role === 'store_manager';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-[#FFC300]" />
              <span className="text-xl font-bold text-[#333333]">PiezasYA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/categories" 
              className="text-[#333333] hover:text-[#FFC300] transition-colors"
            >
              Categorías
            </Link>
            <Link 
              to="/nearby-products" 
              className="text-[#333333] hover:text-[#FFC300] transition-colors"
            >
              Repuestos Cercanos
            </Link>
            <Link 
              to="/" 
              className="text-[#333333] hover:text-[#FFC300] transition-colors"
            >
              Inicio
            </Link>
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className="text-[#333333] hover:text-[#FFC300] transition-colors"
              >
                Mi Perfil
              </Link>
            )}
            {/* Admin Navigation */}
            {isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="text-[#333333] hover:text-[#FFC300] transition-colors"
              >
                Panel Admin
              </Link>
            )}
            {isStoreManager && (
              <Link 
                to="/store-manager/dashboard" 
                className="text-[#333333] hover:text-[#FFC300] transition-colors"
              >
                Panel Tienda
              </Link>
            )}
          </nav>

          {/* Right side - Search, Cart, User */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar repuestos..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Favorites */}
            <Link to="/favorites" className="relative p-2 text-[#333333] hover:text-[#FFC300] transition-colors">
              <Heart className="w-6 h-6" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-[#333333] hover:text-[#FFC300] transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E63946] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-[#333333] hover:text-[#FFC300] transition-colors"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || 'Usuario'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      to="/security"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Seguridad</span>
                    </Link>
                    <Link
                      to="/configuration"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </Link>
                    
                    {/* Admin Menu Items */}
                    {isAdmin && (
                      <>
                        <hr className="my-2" />
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Administración
                        </div>
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Users className="w-4 h-4" />
                          <span>Usuarios</span>
                        </Link>
                        <Link
                          to="/admin/promotions"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Gift className="w-4 h-4" />
                          <span>Promociones</span>
                        </Link>
                        <Link
                          to="/admin/search-config"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Cog className="w-4 h-4" />
                          <span>Config. Búsqueda</span>
                        </Link>
                        <Link
                          to="/admin/generate-products"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Package className="w-4 h-4" />
                          <span>Generar Productos</span>
                        </Link>
                      </>
                    )}
                    
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAuthClick('login')}
                  className="text-[#333333] hover:text-[#FFC300] transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors font-semibold"
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                to="/categories"
                className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Categorías
              </Link>
              <Link
                to="/"
                className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/security"
                    className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Seguridad
                  </Link>
                  <Link
                    to="/configuration"
                    className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Configuración
                  </Link>
                  
                  {/* Admin Mobile Menu */}
                  {isAdmin && (
                    <>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Administración
                      </div>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Usuarios
                      </Link>
                      <Link
                        to="/admin/promotions"
                        className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Promociones
                      </Link>
                      <Link
                        to="/admin/search-config"
                        className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Config. Búsqueda
                      </Link>
                      <Link
                        to="/admin/generate-products"
                        className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Generar Productos
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Cerrar Sesión
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