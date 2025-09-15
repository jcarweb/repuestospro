import React from 'react';
import { ShoppingCart, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AdminSales: React.FC = () => {
  const { t } = useLanguage();
  
  const stats = [
    {
      title: t('adminSales.stats.todaySales'),
      value: '$2,450',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: t('adminSales.stats.monthlySales'),
      value: '$12,450',
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: t('adminSales.stats.pendingOrders'),
      value: '8',
      icon: ShoppingCart,
      color: 'bg-yellow-500'
    },
    {
      title: t('adminSales.stats.activeCustomers'),
      value: '156',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('adminSales.title')}</h1>
        <p className="text-gray-600 mt-2">{t('adminSales.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSales.salesHistory.title')}</h3>
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('adminSales.salesHistory.comingSoon')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('adminSales.salesHistory.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSales; 