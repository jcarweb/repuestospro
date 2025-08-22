import React from 'react';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';

const ActiveStoreIndicator: React.FC = () => {
  const { activeStore, loading } = useActiveStore();

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

  if (!activeStore) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
            No hay tienda seleccionada
          </span>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          Selecciona una tienda para comenzar a gestionar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="h-5 w-5 text-[#FFC300]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeStore.name}
            </h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              activeStore.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {activeStore.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{activeStore.address}, {activeStore.city}, {activeStore.state}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{activeStore.phone}</span>
              {activeStore.phoneLocal && (
                <span className="text-xs text-gray-500">({activeStore.phoneLocal})</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{activeStore.email}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
          <div>ID: {activeStore._id.slice(-8)}</div>
          <div>Moneda: {activeStore.settings.currency}</div>
          <div>IVA: {activeStore.settings.taxRate}%</div>
        </div>
      </div>
    </div>
  );
};

export default ActiveStoreIndicator;
