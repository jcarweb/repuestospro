import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Map,
  FileText,
  Star,
  Calendar,
  Bell,
  User,
  Settings,
  Truck
} from 'lucide-react';

interface DeliverySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeliverySidebar: React.FC<DeliverySidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const menuItems = [
    {
      path: '/delivery/dashboard',
      icon: LayoutDashboard,
      label: t('sidebar.delivery.dashboard'),
      exact: true
    },
    {
      path: '/delivery/orders',
      icon: Package,
      label: t('sidebar.delivery.assignedOrders'),
      exact: false
    },
    {
      path: '/delivery/map',
      icon: Map,
      label: t('sidebar.delivery.routeMap'),
      exact: false
    },
    {
      path: '/delivery/report',
      icon: FileText,
      label: t('sidebar.delivery.deliveryReport'),
      exact: false
    },
    {
      path: '/delivery/ratings',
      icon: Star,
      label: t('sidebar.delivery.ratings'),
      exact: false
    },
    {
      path: '/delivery/schedule',
      icon: Calendar,
      label: t('sidebar.delivery.workSchedule'),
      exact: false
    },
    {
      path: '/delivery/status',
      icon: Bell,
      label: t('sidebar.delivery.availabilityStatus'),
      exact: false
    },
    {
      path: '/delivery/profile',
      icon: User,
      label: t('sidebar.delivery.profile'),
      exact: false
    }
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#333333] border-r border-gray-200 dark:border-[#555555] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#555555]">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-[#FFC300]" />
            <div>
              <h2 className="text-lg font-bold text-[#333333] dark:text-white">
                PIEZAS YA Delivery
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('sidebar.roles.delivery')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menú de navegación */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-[#FFC300] text-[#333333]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#444444]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Información del usuario */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-[#555555] bg-gray-50 dark:bg-[#444444]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-[#555555] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#333333] dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliverySidebar;
