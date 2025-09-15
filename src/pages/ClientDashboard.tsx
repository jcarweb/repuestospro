import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ShoppingCart, 
  Package, 
  Star, 
  Clock, 
  TrendingUp, 
  Heart,
  ShoppingBag,
  CreditCard,
  MapPin,
  Bell,
  Gift,
  Award
} from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [stats, setStats] = useState({
    totalOrders: 12,
    totalSpent: 1250.50,
    loyaltyPoints: 450,
    favoriteProducts: 8,
    pendingDeliveries: 2,
    recentActivity: []
  });

  // Simular datos del dashboard
  useEffect(() => {
    // Aquí conectarías con tu API real
    const mockActivity = [
      { id: 1, type: 'order', message: 'Pedido #12345 confirmado', time: '2 horas atrás' },
      { id: 2, type: 'delivery', message: 'Entrega programada para mañana', time: '1 día atrás' },
      { id: 3, type: 'review', message: 'Reseña publicada para Motor XYZ', time: '3 días atrás' }
    ];
    setStats(prev => ({ ...prev, recentActivity: mockActivity }));
  }, []);

  const quickActions = [
    {
      title: t('dashboard.continueShopping'),
      description: t('dashboard.continueShopping.description'),
      icon: Package,
      link: '/products',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: t('dashboard.viewCart'),
      description: t('dashboard.viewCart.description'),
      icon: ShoppingCart,
      link: '/cart',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: t('dashboard.myOrders'),
      description: t('dashboard.myOrders.description'),
      icon: ShoppingBag,
      link: '/orders',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: t('dashboard.favorites'),
      description: t('dashboard.favorites.description'),
      icon: Heart,
      link: '/favorites',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  const recentOrders = [
    { id: '12345', status: 'delivered', total: 89.99, date: '2024-01-15' },
    { id: '12344', status: 'in_transit', total: 156.50, date: '2024-01-12' },
    { id: '12343', status: 'processing', total: 234.75, date: '2024-01-10' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in_transit': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return t('dashboard.status.delivered');
      case 'in_transit': return t('dashboard.status.inTransit');
      case 'processing': return t('dashboard.status.processing');
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to="/products"
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isDark 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {t('dashboard.continueShopping')}
          </Link>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`
          p-6 rounded-lg border transition-colors
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.totalOrders')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`
          p-6 rounded-lg border transition-colors
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.totalSpent')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalSpent.toFixed(2)}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`
          p-6 rounded-lg border transition-colors
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.loyaltyPoints')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.loyaltyPoints}
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className={`
          p-6 rounded-lg border transition-colors
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.favoriteProducts')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.favoriteProducts}
              </p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className={`
        p-6 rounded-lg border
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`
                  p-4 rounded-lg border transition-all duration-200 hover:scale-105
                  ${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-lg text-white
                    ${action.color}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pedidos Recientes y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recientes */}
        <div className={`
          p-6 rounded-lg border
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.recentOrders')}
          </h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      #{order.id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </p>
                  <span className={`
                    text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}
                  `}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/orders"
              className={`
                text-sm font-medium transition-colors
                ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}
              `}
            >
              {t('dashboard.viewAllOrders')} →
            </Link>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className={`
          p-6 rounded-lg border
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.recentActivity')}
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mt-1">
                  <Bell className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de Fidelización */}
      <div className={`
        p-6 rounded-lg border
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.loyaltyProgram')}
          </h2>
          <Gift className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
            <p className="text-2xl font-bold">{stats.loyaltyPoints}</p>
            <p className="text-sm opacity-90">{t('dashboard.pointsEarned')}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
            <p className="text-2xl font-bold">$25</p>
            <p className="text-sm opacity-90">{t('dashboard.nextReward')}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm opacity-90">{t('dashboard.availableRewards')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
