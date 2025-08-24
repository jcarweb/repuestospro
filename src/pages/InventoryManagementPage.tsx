import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useTheme } from '../contexts/ThemeContext';
import ActiveStoreIndicator from '../components/ActiveStoreIndicator';
import InventoryStatusCard from '../components/InventoryStatusCard';
import InventoryConfigModal from '../components/InventoryConfigModal';
import StoreSelector from '../components/StoreSelector';
import { 
  Package, 
  Settings,
  Building2,
  TrendingUp,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

const InventoryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { theme } = useTheme();
  const [showInventoryConfig, setShowInventoryConfig] = useState(false);
  const navigate = useNavigate();

  const handleConfigureInventory = () => {
    setShowInventoryConfig(true);
  };

  const handleViewReports = () => {
    navigate('/store-manager/inventory/reports');
  };

  const handleTransfers = () => {
    navigate('/store-manager/inventory/transfers');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Package className="h-8 w-8 text-[#FFC300]" />
                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
             Gestión de Inventario
           </h1>
        </div>
                 <p className="text-gray-600 dark:text-gray-300">
           Administra y configura el inventario de tu tienda
           {activeStore && (
             <span className="text-[#FFC300] font-medium"> - {activeStore.name}</span>
           )}
         </p>
      </div>

      {/* Selector de tienda */}
      <div className="mb-6">
        <StoreSelector />
      </div>
      
      {/* Indicador de tienda activa */}
      <div className="mb-6">
        <ActiveStoreIndicator />
      </div>

      {/* Estado del inventario */}
      <div className="mb-6">
        <InventoryStatusCard onConfigureClick={() => setShowInventoryConfig(true)} />
      </div>

             {/* Información adicional */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Tipos de Inventario */}
         <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
           <div className="flex items-center space-x-2 mb-4">
             <Building2 className="h-6 w-6 text-blue-600" />
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tipos de Inventario</h3>
           </div>
           <div className="space-y-3">
             <div className="flex items-center space-x-2">
               <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
               <span className="text-sm text-gray-700 dark:text-gray-300">Global</span>
             </div>
             <div className="flex items-center space-x-2">
               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
               <span className="text-sm text-gray-700 dark:text-gray-300">Separado</span>
             </div>
             <div className="flex items-center space-x-2">
               <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
               <span className="text-sm text-gray-700 dark:text-gray-300">Híbrido</span>
             </div>
           </div>
         </div>

                 {/* Estadísticas */}
         <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
           <div className="flex items-center space-x-2 mb-4">
             <BarChart3 className="h-6 w-6 text-green-600" />
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas</h3>
           </div>
           <div className="space-y-3">
             <div className="flex justify-between">
               <span className="text-sm text-gray-600 dark:text-gray-300">Total Productos</span>
               <span className="text-sm font-medium dark:text-white">156</span>
             </div>
             <div className="flex justify-between">
               <span className="text-sm text-gray-600 dark:text-gray-300">Stock Bajo</span>
               <span className="text-sm font-medium text-yellow-600">12</span>
             </div>
             <div className="flex justify-between">
               <span className="text-sm text-gray-600 dark:text-gray-300">Sin Stock</span>
               <span className="text-sm font-medium text-red-600">3</span>
             </div>
           </div>
         </div>

                 {/* Acciones Rápidas */}
         <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
           <div className="flex items-center space-x-2 mb-4">
             <Settings className="h-6 w-6 text-[#FFC300]" />
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones</h3>
           </div>
           <div className="space-y-3">
             <button
               onClick={handleConfigureInventory}
               className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] transition-colors"
             >
               Configurar Inventario
             </button>
             <button
               onClick={handleViewReports}
               className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
             >
               Ver Reportes
             </button>
             <button
               onClick={handleTransfers}
               className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
             >
               Transferencias
             </button>
           </div>
         </div>
      </div>

             {/* Alertas y Notificaciones */}
       <div className="mt-6">
         <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
           <div className="flex items-start space-x-2">
             <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
             <div>
               <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Alertas</h4>
               <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                 • Stock bajo en algunos productos
                 • Productos sin stock
                 • Transferencias pendientes
               </p>
             </div>
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

export default InventoryManagementPage;
