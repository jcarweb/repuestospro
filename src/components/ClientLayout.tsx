import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import ClientHeader from './ClientHeader';
import SimpleClientSidebar from './SimpleClientSidebar';
import { useLocation } from 'react-router-dom';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const location = useLocation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Ocultar sidebar en rutas específicas del ecommerce
  const hideSidebarRoutes = ['/products', '/product', '/categories', '/checkout'];
  const shouldHideSidebar = hideSidebarRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Cerrar sidebar en móvil al cambiar de ruta
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Simular conteo de items del carrito (esto se conectaría con tu estado real)
  useEffect(() => {
    // Aquí conectarías con tu contexto de carrito
    setCartItemCount(Math.floor(Math.random() * 5)); // Solo para demo
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Si estamos en una ruta del ecommerce, no mostrar el sidebar
  if (shouldHideSidebar) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header sin sidebar */}
        <ClientHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={false}
          cartItemCount={cartItemCount}
        />
        
        {/* Contenido principal */}
        <main className="pt-16 w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      {/* Header */}
      <ClientHeader
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        cartItemCount={cartItemCount}
      />

      {/* Contenido principal con sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SimpleClientSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto min-w-0 w-full">
          <div className="p-6 w-full max-w-none">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientLayout;
