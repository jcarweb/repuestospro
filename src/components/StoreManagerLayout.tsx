import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminHeader from './AdminHeader';
import StoreManagerSidebar from './StoreManagerSidebar';
import ActiveStoreSelector from './ActiveStoreSelector';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';

interface StoreManagerLayoutProps {
  children: React.ReactNode;
}

const StoreManagerLayout: React.FC<StoreManagerLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { t } = useLanguage();
  
  console.log('🔍 StoreManagerLayout: User role:', user?.role);
  console.log('🔍 StoreManagerLayout: Active store:', activeStore?.name);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#333333]">
      <AdminHeader />
      
      {/* Selector de tienda activa */}
      {user?.role === 'store_manager' && (
        <div className="bg-white dark:bg-[#333333] border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('store.activeStore')}
              </span>
              <ActiveStoreSelector />
            </div>
            {activeStore && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {activeStore.address}, {activeStore.city}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Botón para abrir/cerrar sidebar en móvil */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-4 right-4 lg:hidden bg-[#FFC300] text-[#333333] p-3 rounded-full shadow-lg hover:bg-[#E6B800] transition-colors z-40"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - siempre visible en desktop */}
        <div className="hidden lg:block">
          <StoreManagerSidebar isOpen={true} onClose={() => {}} />
        </div>

        {/* Sidebar móvil */}
        <div className="lg:hidden">
          <StoreManagerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#333333]">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreManagerLayout;
