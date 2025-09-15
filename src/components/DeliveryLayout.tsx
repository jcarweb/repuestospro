import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import DeliveryHeader from './DeliveryHeader';
import DeliverySidebar from './DeliverySidebar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DeliveryLayoutProps {
  children: React.ReactNode;
}

const DeliveryLayout: React.FC<DeliveryLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  
  console.log('🔍 DeliveryLayout: User role:', user?.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#333333]">
      <DeliveryHeader />
      
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
          <DeliverySidebar isOpen={true} onClose={() => {}} />
        </div>

        {/* Sidebar móvil */}
        <div className="lg:hidden">
          <DeliverySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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

export default DeliveryLayout;
