import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import AvatarImageSimple from './AvatarImageSimple';
import { profileService } from '../services/profileService';
import { User, LogOut, Settings, Shield, Key } from 'lucide-react';

const SellerHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Ref para detectar clicks fuera del menú
  const userMenuRef = useRef<HTMLDivElement>(null);

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
          // Si es error de autenticación, usar datos del usuario local
          if (error.message === 'Usuario no autenticado') {
            console.log('SellerHeader: Token inválido, usando datos locales del usuario');
            setUserProfile({
              _id: user._id || 'local-user',
              name: user.name || 'Vendedor',
              email: user.email || 'seller@piezasyaya.com',
              phone: user.phone || '+584121234567',
              avatar: user.avatar || '/uploads/perfil/default-avatar.svg',
              role: user.role || 'seller',
              isEmailVerified: user.isEmailVerified || true,
              isActive: user.isActive || true,
              pin: null,
              fingerprintEnabled: false,
              twoFactorEnabled: false,
              emailNotifications: true,
              pushNotifications: true,
              marketingEmails: false,
              theme: 'light',
              language: 'es',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/seller/profile');
    setIsUserMenuOpen(false);
  };

  const handleSecurityClick = () => {
    navigate('/seller/security');
    setIsUserMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/seller/configuration');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-[#333333] shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/seller/dashboard" className="flex items-center">
              <Logo />
            </Link>
          </div>


          {/* Menú de usuario */}
          <div className="flex items-center">
            {/* Menú de usuario */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <AvatarImageSimple
                  src={userProfile?.avatar || user?.avatar}
                  name={userProfile?.name || user?.name || 'Vendedor'}
                  size="sm"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.name || user?.name || 'Vendedor'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vendedor
                  </p>
                </div>
              </button>

              {/* Dropdown del menú de usuario */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#333333] rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <AvatarImageSimple
                        src={userProfile?.avatar || user?.avatar}
                        name={userProfile?.name || user?.name || 'Vendedor'}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userProfile?.name || user?.name || 'Vendedor'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {userProfile?.email || user?.email}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                          Vendedor
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Perfil</span>
                    </button>

                    <button
                      onClick={handleSecurityClick}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Seguridad</span>
                    </button>

                    <button
                      onClick={handleSettingsClick}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </button>

                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader;
