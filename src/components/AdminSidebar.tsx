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
  Gift, 
  Cog, 
  Search,
  ShoppingCart,
  TrendingUp,
  Settings,
  Key,
  Database,
  Store,
  FolderOpen,
  Megaphone,
  DollarSign,
  Star,
  Building2,
  Camera
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
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

  // Menú según el rol del usuario
  const getMenuItems = () => {
    if (user?.role === 'store_manager') {
      return [
        {
          name: t('sidebar.storeManager.dashboard'),
          path: '/store-manager/dashboard',
          icon: BarChart3
        },
        {
          name: t('sidebar.storeManager.branches'),
          path: '/store-manager/branches',
          icon: Building2
        },
        {
          name: t('sidebar.storeManager.inventory'),
          path: '/store-manager/inventory',
          icon: Package
        },
        {
          name: t('sidebar.storeManager.products'),
          path: '/store-manager/products',
          icon: Package
        },
        {
          name: t('sidebar.storeManager.promotions'),
          path: '/store-manager/promotions',
          icon: Gift
        },
        {
          name: t('sidebar.storeManager.sales'),
          path: '/store-manager/sales',
          icon: ShoppingCart
        },
        {
          name: t('sidebar.storeManager.orders'),
          path: '/store-manager/orders',
          icon: ShoppingCart
        },
        {
          name: t('sidebar.storeManager.delivery'),
          path: '/store-manager/delivery',
          icon: ShoppingCart
        },
        {
          name: t('sidebar.storeManager.analytics'),
          path: '/store-manager/analytics',
          icon: BarChart3
        },
        {
          name: t('sidebar.storeManager.messages'),
          path: '/store-manager/messages',
          icon: Megaphone
        },
        {
          name: t('sidebar.storeManager.reviews'),
          path: '/store-manager/reviews',
          icon: Star
        },
        {
          name: t('sidebar.storeManager.settings'),
          path: '/store-manager/settings',
          icon: Settings
        }
      ];
    } else {
      // Menú para Administrador
      return [
        {
          name: t('sidebar.admin.dashboard'),
          path: '/admin/dashboard',
          icon: BarChart3
        },
        {
          name: t('sidebar.admin.users'),
          path: '/admin/users',
          icon: Users
        },
        {
          name: t('sidebar.admin.stores'),
          path: '/admin/stores',
          icon: Store
        },
        {
          name: t('sidebar.admin.products'),
          path: '/admin/products',
          icon: Package
        },
        {
          name: t('sidebar.admin.categories'),
          path: '/admin/categories',
          icon: Database
        },
        {
          name: t('sidebar.admin.subcategories'),
          path: '/admin/subcategories',
          icon: FolderOpen
        },
        {
          name: t('sidebar.admin.promotions'),
          path: '/admin/promotions',
          icon: Gift
        },
        {
          name: t('sidebar.admin.advertisements'),
          path: '/admin/advertisements',
          icon: Megaphone
        },
        {
          name: t('sidebar.admin.sales'),
          path: '/admin/sales',
          icon: ShoppingCart
        },
        {
          name: t('sidebar.admin.salesReports'),
          path: '/admin/sales-reports',
          icon: BarChart3
        },
        {
          name: t('sidebar.admin.loyalty'),
          path: '/admin/loyalty',
          icon: TrendingUp
        },
        {
          name: t('sidebar.admin.analytics'),
          path: '/admin/analytics',
          icon: BarChart3
        },
        {
          name: t('sidebar.admin.registrationCodes'),
          path: '/admin/registration-codes',
          icon: Key
        },
        {
          name: t('sidebar.admin.searchConfig'),
          path: '/admin/search-config',
          icon: Search
        },
        {
          name: t('sidebar.admin.generateProducts'),
          path: '/admin/generate-products',
          icon: Package
        },
        {
          name: t('sidebar.admin.dataEnrichment'),
          path: '/admin/data-enrichment',
          icon: Camera
        },
        {
          name: t('sidebar.admin.globalSettings'),
          path: '/admin/settings',
          icon: Settings
        },
        {
          name: t('sidebar.admin.monetization'),
          path: '/admin/monetization',
          icon: DollarSign
        }
      ];
    }
  };

  const menuItems = getMenuItems();

  console.log('🔍 AdminSidebar: Renderizando sidebar');
  console.log('🔍 AdminSidebar: User role:', user?.role);
  console.log('🔍 AdminSidebar: Menu items:', menuItems.length);
  console.log('🔍 AdminSidebar: Current location:', location.pathname);
  console.log('🔍 AdminSidebar: Menu items for role:', user?.role, menuItems.map(item => item.name));

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
        key={`admin-sidebar-${currentLanguage}-${forceUpdate}`}
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#333333] shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
                 {/* Header del sidebar */}
         <div className="p-4 border-b border-gray-200 dark:border-[#555555] flex-shrink-0">
           {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-1 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#444444]"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Título del Panel */}
          <div className="mt-2 mb-4">
            <h1 className="text-lg font-bold text-[#333333] dark:text-white text-center">
              {user?.role === 'store_manager' ? t('sidebar.storeManager.title') : t('sidebar.admin.title')}
            </h1>
          </div>
        </div>

        {/* Menú con scroll */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={`${item.path}-${currentLanguage}-${forceUpdate}`}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-[#FFC300] bg-opacity-20 text-[#333333] border-r-2 border-[#FFC300]'
                    : 'text-[#333333] dark:text-white hover:bg-[#FFC300] hover:bg-opacity-10 hover:text-[#333333]'
                  }
                `}
                onClick={onClose}
              >
                <Icon className="w-5 h-5 text-[#333333] dark:text-white" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-[#555555] bg-white dark:bg-[#333333] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-[#555555] rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600 dark:text-gray-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#333333] dark:text-white">
                {user?.role === 'store_manager' ? t('sidebar.roles.storeManager') : t('sidebar.roles.admin')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
