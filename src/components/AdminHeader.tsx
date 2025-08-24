import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import { Package, User, LogOut, Bell, Settings, Shield } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
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

  const handleMenuClick = (path: string) => {
    // Navegar según el rol del usuario
    if (user?.role === 'admin') {
      navigate(`/admin${path}`);
    } else if (user?.role === 'store_manager') {
      navigate(`/store-manager${path}`);
    } else {
      // Para otros roles, navegar a la ruta base
      navigate(path);
    }
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-[#333333] shadow-sm border-b border-gray-200 dark:border-[#555555] h-16 flex items-center justify-between px-6">
             {/* Logo */}
       <div className="flex items-center">
         <Logo className="h-12 w-auto" />
       </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-400 dark:text-gray-300 hover:text-[#FFC300] transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-3 p-2 text-[#333333] dark:text-white hover:text-[#FFC300] transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-[#444444]"
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-[#555555] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-200" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#333333] dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-white">
                {user?.role === 'store_manager' ? t('sidebar.roles.storeManager') : t('sidebar.roles.admin')}
              </p>
            </div>
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
                <span>{t('header.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
