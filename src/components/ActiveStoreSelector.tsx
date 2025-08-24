import React, { useState } from 'react';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Store, ChevronDown, Building2, Check } from 'lucide-react';

const ActiveStoreSelector: React.FC = () => {
  const { activeStore, setActiveStore, userStores, loading } = useActiveStore();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  if (userStores.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <Building2 className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">{t('store.noStores')}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent transition-colors"
      >
        <Building2 className="h-4 w-4 text-[#FFC300]" />
        <span className="text-sm font-medium text-gray-700 truncate max-w-32">
          {activeStore?.name || t('store.selectStore')}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="py-1">
            {userStores.map((store) => (
              <button
                key={store._id}
                onClick={() => {
                  setActiveStore(store);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  activeStore?._id === store._id ? 'bg-[#FFC300] bg-opacity-10' : ''
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Building2 className="h-4 w-4 text-[#FFC300] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {store.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {store.address}, {store.city}
                    </div>
                  </div>
                </div>
                {activeStore?._id === store._id && (
                  <Check className="h-4 w-4 text-[#FFC300] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown al hacer clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ActiveStoreSelector;
