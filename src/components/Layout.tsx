import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determinar si el usuario es admin o store_manager
  const isAdminOrStoreManager = user?.role === 'admin' || user?.role === 'store_manager';

  // Para web: usar sidebar si es admin/store_manager, header normal si no
  // Para móvil: siempre usar header normal
  const shouldUseSidebar = isAdminOrStoreManager;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header siempre se renderiza, pero con contenido adaptado */}
      <Header />

      {/* Layout principal */}
      <div className="flex flex-1">
        {/* Sidebar para web */}
        {shouldUseSidebar && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
        )}

        {/* Sidebar móvil */}
        {shouldUseSidebar && (
          <div className="lg:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Botón de menú para móvil cuando hay sidebar */}
          {shouldUseSidebar && (
            <div className="lg:hidden p-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Contenido de la página */}
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Layout; 