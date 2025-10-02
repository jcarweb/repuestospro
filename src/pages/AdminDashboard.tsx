import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';
import { Users, Package, TrendingUp, DollarSign, Settings, BarChart3, Camera, MapPin, Store } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { forceUpdate } = useLanguageChange(); // Para asegurar re-renders

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#333333] dark:text-[#FFC300]">{t('adminDashboard.title')}</h1>
        <p className="text-gray-600 dark:text-white">{t('adminDashboard.welcome')}, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 border-l-4 border-[#FFC300]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#FFC300] bg-opacity-20">
              <Users className="w-6 h-6 text-[#FFC300]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminDashboard.stats.users')}</p>
              <p className="text-2xl font-semibold text-[#333333] dark:text-[#FFC300]">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 border-l-4 border-[#E63946]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#E63946] bg-opacity-20">
              <Package className="w-6 h-6 text-[#E63946]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminDashboard.stats.products')}</p>
              <p className="text-2xl font-semibold text-[#333333] dark:text-[#FFC300]">5,678</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 border-l-4 border-[#FFC300]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#FFC300] bg-opacity-20">
              <TrendingUp className="w-6 h-6 text-[#FFC300]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminDashboard.stats.sales')}</p>
              <p className="text-2xl font-semibold text-[#333333] dark:text-[#FFC300]">$45,678</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 border-l-4 border-[#E63946]">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#E63946] bg-opacity-20">
              <BarChart3 className="w-6 h-6 text-[#E63946]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">{t('adminDashboard.stats.orders')}</p>
              <p className="text-2xl font-semibold text-[#333333] dark:text-[#FFC300]">892</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enriquecimiento de Datos - Nueva Sección */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#333333] dark:text-[#FFC300] mb-6">🔍 Sistema de Enriquecimiento de Datos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 border-l-4 border-[#10B981]">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#10B981] bg-opacity-20">
                <Camera className="w-6 h-6 text-[#10B981]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-[#333333] dark:text-[#FFC300]">Fotos de Locales</h3>
                <p className="text-sm text-gray-600 dark:text-white">Captura y enriquecimiento automático</p>
              </div>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/admin/store-photos'}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-[#10B981] hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-[#10B981] mr-3" />
                  <span className="text-[#333333] dark:text-white">Ver Fotos de Locales</span>
                </div>
                <span className="text-[#10B981]">→</span>
              </button>
              <button 
                onClick={() => window.location.href = '/admin/store-photos/upload'}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-[#10B981] hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Camera className="w-5 h-5 text-[#10B981] mr-3" />
                  <span className="text-[#333333] dark:text-white">Subir Nueva Foto</span>
                </div>
                <span className="text-[#10B981]">→</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 border-l-4 border-[#8B5CF6]">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#8B5CF6] bg-opacity-20">
                <BarChart3 className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-[#333333] dark:text-[#FFC300]">Enriquecimiento Automático</h3>
                <p className="text-sm text-gray-600 dark:text-white">OCR, APIs externas y análisis</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-white">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full mr-2"></span>
                OCR con Tesseract.js
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full mr-2"></span>
                Búsqueda en MercadoLibre
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full mr-2"></span>
                Consultas a DuckDuckGo
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full mr-2"></span>
                Análisis de Instagram
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[#333333] dark:text-[#FFC300] mb-4">{t('adminDashboard.quickActions.title')}</h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FFC300] hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 text-[#FFC300] mr-3" />
                <span className="text-[#333333] dark:text-white">{t('adminDashboard.quickActions.manageUsers')}</span>
              </div>
              <span className="text-[#FFC300]">→</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FFC300] hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 text-[#E63946] mr-3" />
                <span className="text-[#333333] dark:text-white">{t('adminDashboard.quickActions.manageProducts')}</span>
              </div>
              <span className="text-[#E63946]">→</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/stores'}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FFC300] hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Store className="w-5 h-5 text-[#10B981] mr-3" />
                <span className="text-[#333333] dark:text-white">Gestionar Tiendas</span>
              </div>
              <span className="text-[#10B981]">→</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/settings'}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FFC300] hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-[#333333] dark:text-white mr-3" />
                <span className="text-[#333333] dark:text-white">{t('adminDashboard.quickActions.settings')}</span>
              </div>
              <span className="text-[#333333] dark:text-white">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[#333333] dark:text-[#FFC300] mb-4">{t('adminDashboard.recentActivity.title')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#444444] rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('adminDashboard.recentActivity.newUser')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">{t('adminDashboard.recentActivity.ago')} 5 {t('adminDashboard.recentActivity.minutes')}</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#444444] rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('adminDashboard.recentActivity.productAdded')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">{t('adminDashboard.recentActivity.ago')} 15 {t('adminDashboard.recentActivity.minutes')}</p>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#444444] rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('adminDashboard.recentActivity.orderCompleted')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">{t('adminDashboard.recentActivity.ago')} 1 {t('adminDashboard.recentActivity.hour')}</p>
              </div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[#333333] dark:text-[#FFC300] mb-4">{t('adminDashboard.stats.title')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-white">{t('adminDashboard.stats.monthlySales')}</span>
                <span className="font-medium dark:text-[#FFC300]">$12,345</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#555555] rounded-full h-2 mt-1">
                <div className="bg-[#FFC300] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-white">{t('adminDashboard.stats.activeUsers')}</span>
                <span className="font-medium dark:text-[#FFC300]">1,234</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#555555] rounded-full h-2 mt-1">
                <div className="bg-[#E63946] h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-white">{t('adminDashboard.stats.productsSold')}</span>
                <span className="font-medium dark:text-[#FFC300]">567</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#555555] rounded-full h-2 mt-1">
                <div className="bg-[#FFC300] h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 