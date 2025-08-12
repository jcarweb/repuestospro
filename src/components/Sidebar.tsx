import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Menú para Administrador
  const adminMenuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: Home,
      description: 'Panel principal de administración'
    },
    {
      title: 'Usuarios',
      path: '/admin/users',
      icon: Users,
      description: 'Gestión de usuarios del sistema'
    },
    {
      title: 'Productos',
      path: '/admin/products',
      icon: Package,
      description: 'Gestión de productos global'
    },
    {
      title: 'Categorías',
      path: '/admin/categories',
      icon: Database,
      description: 'Gestión de categorías y subcategorías'
    },
    {
      title: 'Promociones',
      path: '/admin/promotions',
      icon: Tag,
      description: 'Gestión de promociones globales'
    },
    {
      title: 'Ventas',
      path: '/admin/sales',
      icon: ShoppingCart,
      description: 'Reportes de ventas globales'
    },
    {
      title: 'Fidelización',
      path: '/admin/loyalty',
      icon: Award,
      description: 'Sistema de lealtad y premios'
    },
    {
      title: 'Google Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
      description: 'Estadísticas y métricas'
    },
    {
      title: 'Códigos de Registro',
      path: '/admin/registration-codes',
      icon: Key,
      description: 'Generar códigos de registro'
    },
    {
      title: 'Configuración de Búsqueda',
      path: '/admin/search-config',
      icon: Search,
      description: 'Configurar búsqueda avanzada'
    },
    {
      title: 'Generar Productos',
      path: '/admin/generate-products',
      icon: Database,
      description: 'Generar productos de prueba'
    },
    {
      title: 'Configuración Global',
      path: '/admin/settings',
      icon: Settings,
      description: 'Configuración del sistema'
    }
  ];

  // Menú para Gestor de Tienda
  const storeManagerMenuItems = [
    {
      title: 'Dashboard',
      path: '/store-manager/dashboard',
      icon: Home,
      description: 'Panel de gestión de tienda'
    },
    {
      title: 'Productos',
      path: '/store-manager/products',
      icon: Package,
      description: 'Gestión de productos de la tienda'
    },
    {
      title: 'Promociones',
      path: '/store-manager/promotions',
      icon: Tag,
      description: 'Promociones de la tienda'
    },
    {
      title: 'Ventas',
      path: '/store-manager/sales',
      icon: ShoppingCart,
      description: 'Reportes de ventas de la tienda'
    },
    {
      title: 'Pedidos',
      path: '/store-manager/orders',
      icon: ShoppingBag,
      description: 'Gestión de pedidos'
    },
    {
      title: 'Delivery',
      path: '/store-manager/delivery',
      icon: Truck,
      description: 'Asignar y gestionar delivery'
    },
    {
      title: 'Analytics',
      path: '/store-manager/analytics',
      icon: BarChart3,
      description: 'Estadísticas de la tienda'
    },
    {
      title: 'Mensajes',
      path: '/store-manager/messages',
      icon: MessageSquare,
      description: 'Mensajería con clientes'
    },
    {
      title: 'Reseñas',
      path: '/store-manager/reviews',
      icon: Star,
      description: 'Reseñas de productos'
    },
    {
      title: 'Configuración',
      path: '/store-manager/settings',
      icon: Settings,
      description: 'Configuración de la tienda'
    }
  ];

  // Menú para Delivery
  const deliveryMenuItems = [
    {
      title: 'Dashboard',
      path: '/delivery/dashboard',
      icon: Home,
      description: 'Panel de delivery'
    },
    {
      title: 'Pedidos Asignados',
      path: '/delivery/orders',
      icon: ShoppingBag,
      description: 'Ver pedidos asignados'
    },
    {
      title: 'Mapa de Rutas',
      path: '/delivery/map',
      icon: MapPin,
      description: 'Mapa con rutas de entrega'
    },
    {
      title: 'Reportar Entrega',
      path: '/delivery/report',
      icon: FileText,
      description: 'Reportar estado de entregas'
    },
    {
      title: 'Calificaciones',
      path: '/delivery/ratings',
      icon: Star,
      description: 'Ver calificaciones recibidas'
    },
    {
      title: 'Horario de Trabajo',
      path: '/delivery/schedule',
      icon: Clock,
      description: 'Configurar horario de trabajo'
    },
    {
      title: 'Estado de Disponibilidad',
      path: '/delivery/status',
      icon: Bell,
      description: 'Cambiar estado de disponibilidad'
    },
    {
      title: 'Perfil',
      path: '/delivery/profile',
      icon: User,
      description: 'Configuración del perfil'
    }
  ];

  // Menú para Cliente
  const clientMenuItems = [
    {
      title: 'Inicio',
      path: '/',
      icon: Home,
      description: 'Página principal'
    },
    {
      title: 'Productos',
      path: '/products',
      icon: Package,
      description: 'Explorar productos'
    },
    {
      title: 'Categorías',
      path: '/categories',
      icon: Database,
      description: 'Ver categorías'
    },
    {
      title: 'Carrito',
      path: '/cart',
      icon: ShoppingCart,
      description: 'Ver carrito de compras'
    },
    {
      title: 'Favoritos',
      path: '/favorites',
      icon: Heart,
      description: 'Productos favoritos'
    },
    {
      title: 'Fidelización',
      path: '/loyalty',
      icon: Award,
      description: 'Puntos y premios'
    },
    {
      title: 'Mis Pedidos',
      path: '/orders',
      icon: ShoppingBag,
      description: 'Historial de pedidos'
    },
    {
      title: 'Perfil',
      path: '/profile',
      icon: User,
      description: 'Configuración del perfil'
    },
    {
      title: 'Seguridad',
      path: '/security',
      icon: Shield,
      description: 'Configuración de seguridad'
    },
    {
      title: 'Notificaciones',
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
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 border-r border-gray-200
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">RepuestosPro</h1>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role === 'admin' && 'Administrador'}
                  {user?.role === 'store_manager' && 'Gestor de Tienda'}
                  {user?.role === 'delivery' && 'Delivery'}
                  {user?.role === 'client' && 'Cliente'}
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
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive(item.path)
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      onClick={onClose}
                      title={item.description}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
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