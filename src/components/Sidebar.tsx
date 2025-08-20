import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  ShoppingBag
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, hasRole, hasAnyRole } = useAuth();
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

  // Menú para Administrador - se re-evalúa en cada render
  const adminMenuItems = [
    {
      title: t('sidebar.admin.dashboard'),
      path: '/admin/dashboard',
      icon: Home,
      description: 'Panel principal de administración'
    },
    {
      title: t('sidebar.admin.users'),
      path: '/admin/users',
      icon: Users,
      description: 'Gestión de usuarios del sistema'
    },
    {
      title: t('sidebar.admin.products'),
      path: '/admin/products',
      icon: Package,
      description: 'Gestión de productos global'
    },
    {
      title: t('sidebar.admin.categories'),
      path: '/admin/categories',
      icon: Database,
      description: 'Gestión de categorías y subcategorías'
    },
    {
      title: t('sidebar.admin.promotions'),
      path: '/admin/promotions',
      icon: Tag,
      description: 'Gestión de promociones globales'
    },
    {
      title: t('sidebar.admin.sales'),
      path: '/admin/sales',
      icon: ShoppingCart,
      description: t('sidebar.admin.sales.description')
    },
    {
      title: t('sidebar.admin.loyalty'),
      path: '/admin/loyalty',
      icon: Award,
      description: 'Sistema de lealtad y premios'
    },
    {
      title: t('sidebar.admin.analytics'),
      path: '/admin/analytics',
      icon: BarChart3,
      description: 'Estadísticas y métricas'
    },
    {
      title: t('sidebar.admin.registrationCodes'),
      path: '/admin/registration-codes',
      icon: Key,
      description: 'Generar códigos de registro'
    },
    {
      title: t('sidebar.admin.searchConfig'),
      path: '/admin/search-config',
      icon: Search,
      description: 'Configurar búsqueda avanzada'
    },
    {
      title: t('sidebar.admin.generateProducts'),
      path: '/admin/generate-products',
      icon: Database,
      description: 'Generar productos de prueba'
    },
    {
      title: t('sidebar.admin.globalSettings'),
      path: '/admin/settings',
      icon: Settings,
      description: 'Configuración del sistema'
    }
  ];

  // Menú para Gestor de Tienda - se re-evalúa en cada render
  const storeManagerMenuItems = [
    {
      title: t('sidebar.storeManager.dashboard'),
      path: '/store-manager/dashboard',
      icon: Home,
      description: 'Panel de gestión de tienda'
    },
    {
      title: t('sidebar.storeManager.products'),
      path: '/store-manager/products',
      icon: Package,
      description: 'Gestión de productos de la tienda'
    },
    {
      title: t('sidebar.storeManager.promotions'),
      path: '/store-manager/promotions',
      icon: Tag,
      description: 'Promociones de la tienda'
    },
    {
      title: t('sidebar.storeManager.sales'),
      path: '/store-manager/sales',
      icon: ShoppingCart,
      description: t('sidebar.storeManager.sales.description')
    },
    {
      title: t('sidebar.storeManager.orders'),
      path: '/store-manager/orders',
      icon: ShoppingBag,
      description: 'Gestión de pedidos'
    },
    {
      title: t('sidebar.storeManager.delivery'),
      path: '/store-manager/delivery',
      icon: Truck,
      description: 'Asignar y gestionar delivery'
    },
    {
      title: t('sidebar.storeManager.analytics'),
      path: '/store-manager/analytics',
      icon: BarChart3,
      description: 'Estadísticas de la tienda'
    },
    {
      title: t('sidebar.storeManager.messages'),
      path: '/store-manager/messages',
      icon: MessageSquare,
      description: 'Mensajería con clientes'
    },
    {
      title: t('sidebar.storeManager.reviews'),
      path: '/store-manager/reviews',
      icon: Star,
      description: 'Reseñas de productos'
    },
    {
      title: t('sidebar.storeManager.settings'),
      path: '/store-manager/settings',
      icon: Settings,
      description: 'Configuración de la tienda'
    }
  ];

  // Menú para Delivery - se re-evalúa en cada render
  const deliveryMenuItems = [
    {
      title: t('sidebar.delivery.dashboard'),
      path: '/delivery/dashboard',
      icon: Home,
      description: 'Panel de delivery'
    },
    {
      title: t('sidebar.delivery.assignedOrders'),
      path: '/delivery/orders',
      icon: ShoppingBag,
      description: 'Ver pedidos asignados'
    },
    {
      title: t('sidebar.delivery.routeMap'),
      path: '/delivery/map',
      icon: MapPin,
      description: 'Mapa con rutas de entrega'
    },
    {
      title: t('sidebar.delivery.deliveryReport'),
      path: '/delivery/report',
      icon: FileText,
      description: 'Reportar estado de entregas'
    },
    {
      title: t('sidebar.delivery.ratings'),
      path: '/delivery/ratings',
      icon: Star,
      description: 'Ver calificaciones recibidas'
    },
    {
      title: t('sidebar.delivery.workSchedule'),
      path: '/delivery/schedule',
      icon: Clock,
      description: 'Configurar horario de trabajo'
    },
    {
      title: t('sidebar.delivery.availabilityStatus'),
      path: '/delivery/status',
      icon: Bell,
      description: 'Cambiar estado de disponibilidad'
    },
    {
      title: t('sidebar.delivery.profile'),
      path: '/delivery/profile',
      icon: User,
      description: 'Configuración del perfil'
    }
  ];

  // Menú para Cliente - se re-evalúa en cada render
  const clientMenuItems = [
    {
      title: t('sidebar.client.home'),
      path: '/',
      icon: Home,
      description: 'Página principal'
    },
    {
      title: t('sidebar.client.products'),
      path: '/products',
      icon: Package,
      description: 'Explorar productos'
    },
    {
      title: t('sidebar.client.categories'),
      path: '/categories',
      icon: Database,
      description: 'Ver categorías'
    },
    {
      title: t('sidebar.client.cart'),
      path: '/cart',
      icon: ShoppingCart,
      description: 'Ver carrito de compras'
    },
    {
      title: t('sidebar.client.favorites'),
      path: '/favorites',
      icon: Heart,
      description: 'Productos favoritos'
    },
    {
      title: t('sidebar.client.loyalty'),
      path: '/loyalty',
      icon: Award,
      description: 'Puntos y premios'
    },
    {
      title: t('sidebar.client.myOrders'),
      path: '/orders',
      icon: ShoppingBag,
      description: 'Historial de pedidos'
    },
    {
      title: t('sidebar.client.profile'),
      path: '/profile',
      icon: User,
      description: 'Configuración del perfil'
    },
    {
      title: t('sidebar.client.security'),
      path: '/security',
      icon: Shield,
      description: 'Configuración de seguridad'
    },
    {
      title: t('sidebar.client.notifications'),
      path: '/notifications',
      icon: Bell,
      description: 'Configurar notificaciones'
    }
  ];

  // Determinar qué menú mostrar según el rol
  const getMenuItems = () => {
    if (hasRole('admin')) {
      return adminMenuItems;
    } else if (hasRole('store_manager')) {
      return storeManagerMenuItems;
    } else if (hasRole('delivery')) {
      return deliveryMenuItems;
    } else if (hasRole('client')) {
      return clientMenuItems;
    }
    return [];
  };

  const menuItems = getMenuItems();

  // Función para obtener el rol traducido - se re-evalúa en cada render
  const getRoleText = () => {
    if (user?.role === 'admin') return t('sidebar.roles.admin');
    if (user?.role === 'store_manager') return t('sidebar.roles.storeManager');
    if (user?.role === 'delivery') return t('sidebar.roles.delivery');
    if (user?.role === 'client') return t('sidebar.roles.client');
    return '';
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
         key={`sidebar-${currentLanguage}-${forceUpdate}`}
         className={`
           fixed top-0 left-0 h-full bg-white dark:bg-[#333333] shadow-lg z-50 transform transition-transform duration-300 ease-in-out
           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
           lg:translate-x-0 lg:static lg:z-auto
           w-64 border-r border-gray-200 dark:border-[#555555]
         `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-[#555555]">
            <div className="flex items-center space-x-3">
              <Logo className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-[#333333] dark:text-[#FFC300]">PIEZAS YA</h1>
                                 <p className="text-sm text-gray-500 dark:text-white capitalize">
                   {getRoleText()}
                 </p>
              </div>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
                             {menuItems.map((item) => {
                 const Icon = item.icon;
                 return (
                   <li key={`${item.path}-${currentLanguage}-${forceUpdate}`}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive(item.path)
                          ? 'bg-[#FFC300] bg-opacity-20 text-[#333333] border-r-2 border-[#FFC300]'
                          : 'text-[#333333] dark:text-white hover:bg-[#FFC300] hover:bg-opacity-10 hover:text-[#333333]'
                        }
                      `}
                      onClick={onClose}
                      title={item.description}
                    >
                      <Icon className="w-5 h-5 text-[#333333] dark:text-white" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-[#555555]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-[#555555] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 