import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      {/* Botón para abrir/cerrar sidebar en móvil */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-4 right-4 lg:hidden bg-[#FFC300] text-[#333333] p-3 rounded-full shadow-lg hover:bg-[#E6B800] transition-colors z-40"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Contenido principal */}
        <main className="flex-1 lg:ml-64 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;