import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu } from 'lucide-react';
import RoleBasedNavigation from './RoleBasedNavigation';

interface SellerLayoutProps {
  children: React.ReactNode;
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  
  console.log('🔍 SellerLayout: User role:', user?.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#333333]">
      {/* Header simplificado para vendedor */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('sidebar.roles.seller')} - PiezasYa
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <RoleBasedNavigation 
                isOpen={false} 
                onClose={() => {}} 
                variant="header" 
              />
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - siempre visible en desktop */}
        <div className="hidden lg:block">
          <RoleBasedNavigation isOpen={true} onClose={() => {}} />
        </div>

        {/* Sidebar móvil */}
        <div className="lg:hidden">
          <RoleBasedNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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

export default SellerLayout;
