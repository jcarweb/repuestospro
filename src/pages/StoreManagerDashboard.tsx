import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import ActiveStoreIndicator from '../components/ActiveStoreIndicator';
import InventoryStatusCard from '../components/InventoryStatusCard';
import InventoryConfigModal from '../components/InventoryConfigModal';
import StoreDebugInfo from '../components/StoreDebugInfo';
import ApiTestComponent from '../components/ApiTestComponent';
import StoreContextTester from '../components/StoreContextTester';
import SimpleStoreTest from '../components/SimpleStoreTest';
import ContextVsDirectTest from '../components/ContextVsDirectTest';
import ContextInitializationTest from '../components/ContextInitializationTest';
import SimpleContextTest from '../components/SimpleContextTest';
import ActiveStoreDebugger from '../components/ActiveStoreDebugger';
import StoreSelector from '../components/StoreSelector';
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Star, 
  MessageSquare,
  DollarSign,
  BarChart3
} from 'lucide-react';

const StoreManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { activeStore } = useActiveStore();
  const [showInventoryConfig, setShowInventoryConfig] = useState(false);

  // Datos de ejemplo - en una implementación real vendrían de la API
  const stats = {
    totalProducts: 156,
    activePromotions: 8,
    pendingOrders: 12,
    totalSales: 15420.50,
    averageRating: 4.2,
    unreadMessages: 5,
    monthlyGrowth: 15.3,
    conversionRate: 3.8
  };

  const recentOrders = [
    { id: '1', customer: 'Juan Pérez', amount: 125.00, status: t('storeManagerDashboard.recentOrders.statuses.pending'), date: '2024-01-15' },
    { id: '2', customer: 'María García', amount: 89.50, status: t('storeManagerDashboard.recentOrders.statuses.inProcess'), date: '2024-01-14' },
    { id: '3', customer: 'Carlos López', amount: 234.75, status: t('storeManagerDashboard.recentOrders.statuses.delivered'), date: '2024-01-13' },
  ];

  const quickActions = [
    { title: t('storeManagerDashboard.quickActions.addProduct'), icon: Package, action: () => console.log('Agregar producto') },
    { title: t('storeManagerDashboard.quickActions.createPromotion'), icon: TrendingUp, action: () => console.log('Crear promoción') },
    { title: t('storeManagerDashboard.quickActions.viewOrders'), icon: ShoppingCart, action: () => console.log('Ver pedidos') },
    { title: t('storeManagerDashboard.quickActions.messages'), icon: MessageSquare, action: () => console.log('Ver mensajes') },
  ];

  return (
    <div className="p-6">
      {/* Debug Info - Temporal */}
      <StoreDebugInfo />
      <ApiTestComponent />
      <StoreContextTester />
      <SimpleStoreTest />
      <ContextVsDirectTest />
      <ContextInitializationTest />
      <SimpleContextTest />
      <ActiveStoreDebugger />
      
      {/* Selector de tienda */}
      <StoreSelector />
      
      {/* Indicador de tienda activa */}
      <ActiveStoreIndicator />
      
      {/* Estado del inventario */}
      <div className="mb-6">
        <InventoryStatusCard onConfigureClick={() => setShowInventoryConfig(true)} />
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('storeManagerDashboard.title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('storeManagerDashboard.welcome')}, {user?.name || 'Gestor de Tienda'}
          {activeStore && (
            <span className="text-[#FFC300] font-medium"> - {activeStore.name}</span>
          )}
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('storeManagerDashboard.stats.products')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('storeManagerDashboard.stats.activePromotions')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePromotions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('storeManagerDashboard.stats.pendingOrders')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('storeManagerDashboard.stats.monthlySales')}</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones rápidas */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('storeManagerDashboard.quickActions.title')}</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <action.icon className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pedidos recientes */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('storeManagerDashboard.recentOrders.title')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">{t('storeManagerDashboard.recentOrders.id')}</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">{t('storeManagerDashboard.recentOrders.customer')}</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">{t('storeManagerDashboard.recentOrders.amount')}</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">{t('storeManagerDashboard.recentOrders.status')}</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">{t('storeManagerDashboard.recentOrders.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 text-sm text-gray-900">#{order.id}</td>
                      <td className="py-2 text-sm text-gray-700">{order.customer}</td>
                      <td className="py-2 text-sm text-gray-900">${order.amount}</td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === t('storeManagerDashboard.recentOrders.statuses.pending') ? 'bg-yellow-100 text-yellow-800' :
                          order.status === t('storeManagerDashboard.recentOrders.statuses.inProcess') ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('storeManagerDashboard.stats.averageRating')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('storeManagerDashboard.stats.monthlyGrowth')}</p>
              <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('storeManagerDashboard.stats.conversionRate')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
             </div>
       
       {/* Modal de configuración de inventario */}
       <InventoryConfigModal
         isOpen={showInventoryConfig}
         onClose={() => setShowInventoryConfig(false)}
         onConfigSaved={() => {
           setShowInventoryConfig(false);
           // Aquí podrías refrescar el estado del inventario
           window.location.reload(); // Temporal: recargar para ver cambios
         }}
       />
     </div>
   );
 };
 
 export default StoreManagerDashboard;
