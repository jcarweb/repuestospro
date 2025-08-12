import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Botón para abrir/cerrar sidebar en móvil */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-4 right-4 lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Contenido principal */}
        <main className="flex-1 p-8 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;