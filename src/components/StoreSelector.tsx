import React from 'react';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { Building2, ChevronDown } from 'lucide-react';

const StoreSelector: React.FC = () => {
  const { activeStore, userStores, setActiveStore, loading } = useActiveStore();

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!userStores || userStores.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
            No hay tiendas disponibles
          </span>
        </div>
      </div>
    );
  }

  if (userStores.length === 1) {
    return (
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-[#FFC300]" />
          <span className="text-gray-900 dark:text-white font-medium">
            {userStores[0].name}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Activa
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-[#FFC300]" />
          <span className="text-gray-900 dark:text-white font-medium">
            Seleccionar Tienda
          </span>
        </div>
        <div className="relative">
          <select
            value={activeStore?._id || ''}
            onChange={(e) => {
              const selectedStore = userStores.find(store => store._id === e.target.value);
              if (selectedStore) {
                setActiveStore(selectedStore);
              }
            }}
            className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {userStores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name} {store.isMainStore ? '(Principal)' : '(Sucursal)'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      {activeStore && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Tienda Activa: {activeStore.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeStore.address}, {activeStore.city}
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {activeStore.isMainStore ? 'Principal' : 'Sucursal'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;
