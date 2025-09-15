import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Calculator,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Store,
  Megaphone
} from 'lucide-react';
import ExchangeRateTab from '../components/monetization/ExchangeRateTab';
import CommissionsTab from '../components/monetization/CommissionsTab';
import SubscriptionsTab from '../components/monetization/SubscriptionsTab';
import StoreSubscriptionsTab from '../components/monetization/StoreSubscriptionsTab';
import TaxesTab from '../components/monetization/TaxesTab';
import CalculatorTab from '../components/monetization/CalculatorTab';
import AdvertisementRequestsTab from '../components/admin/AdvertisementRequestsTab';

const AdminMonetization: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('exchange-rate');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    {
      id: 'exchange-rate',
      name: t('monetization.exchangeRate.title'),
      icon: TrendingUp,
      description: 'Gestión de tasas de cambio'
    },
    {
      id: 'commissions',
      name: t('monetization.commissions.title'),
      icon: DollarSign,
      description: 'Configuración de comisiones'
    },
    {
      id: 'subscriptions',
      name: t('monetization.subscriptions.title'),
      icon: CreditCard,
      description: 'Planes de suscripción'
    },
    {
      id: 'store-subscriptions',
      name: 'Suscripciones de Tiendas',
      icon: Store,
      description: 'Gestionar suscripciones de tiendas'
    },
    {
      id: 'advertisement-requests',
      name: 'Solicitudes de Publicidad',
      icon: Megaphone,
      description: 'Gestionar solicitudes de publicidad de gestores'
    },
    {
      id: 'taxes',
      name: t('monetization.taxes.title'),
      icon: Calculator,
      description: 'Gestión de impuestos'
    },
    {
      id: 'calculator',
      name: t('monetization.calculator.title'),
      icon: Calculator,
      description: 'Calculadora de comisiones e impuestos'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'exchange-rate':
        return <ExchangeRateTab />;
      case 'commissions':
        return <CommissionsTab />;
      case 'subscriptions':
        return <SubscriptionsTab />;
      case 'store-subscriptions':
        return <StoreSubscriptionsTab />;
      case 'advertisement-requests':
        return <AdvertisementRequestsTab />;
      case 'taxes':
        return <TaxesTab />;
      case 'calculator':
        return <CalculatorTab />;
      default:
        return <ExchangeRateTab />;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#333333] shadow-sm border-b border-gray-200 dark:border-[#555555]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#333333] dark:text-white">
                  {t('monetization.title')}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Gestión completa de tasas, comisiones, suscripciones e impuestos
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Última actualización: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-[#333333] border-b border-gray-200 dark:border-[#555555]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-[#FFC300] text-[#FFC300]'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-[#FFC300] animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                {t('monetization.common.loading')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555]">
            {renderTabContent()}
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Success Message */}
        <div className="hidden bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Operación exitosa</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="hidden bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Error en la operación</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMonetization;
